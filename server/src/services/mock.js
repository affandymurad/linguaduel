const fs   = require('fs');
const path = require('path');

// Di Netlify Functions __dirname bisa berbeda karena bundling; coba beberapa lokasi.
const SEED_DIR = [
  path.join(__dirname, '../../data/seed'),
  path.join(process.env.LAMBDA_TASK_ROOT || process.cwd(), 'server/data/seed'),
].find(d => fs.existsSync(d)) || path.join(__dirname, '../../data/seed');

/**
 * Baca semua soal dari file seed bahasa yang dipilih,
 * filter berdasarkan level (opsional) dan situasi yang sudah dipakai,
 * lalu kembalikan soal acak.
 *
 * @param {{ bahasa: string, level?: string, situasiDipakai?: string[], mode?: string }} opts
 */
function getSoalAcak({ bahasa, level, situasiDipakai = [], mode }) {
  const namaFile = bahasa.toLowerCase().replace(/\s+/g, '') + '.json';
  const filePath = path.join(SEED_DIR, namaFile);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File seed tidak ditemukan: ${namaFile}`);
  }

  let soalList = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Filter level jika ada
  if (level) {
    const filtered = soalList.filter(s => s.level === level);
    if (filtered.length > 0) soalList = filtered;
  }

  // Kecualikan soal yang situasinya sudah dipakai dalam sesi ini
  if (situasiDipakai.length > 0) {
    const belumDipakai = soalList.filter(s => !situasiDipakai.includes(s.situasi));
    // Hanya gunakan filter ini jika masih ada soal tersisa; jika semua sudah dipakai,
    // putar ulang dari daftar lengkap (agar sesi tidak macet).
    if (belumDipakai.length > 0) soalList = belumDipakai;
  }

  // Pilih soal acak
  const idx  = Math.floor(Math.random() * soalList.length);
  const soal = soalList[idx];

  // Acak urutan opsi (Fisher-Yates), hitung ulang indeks benar
  const jawaban = soal.opsi[soal.benar]; // simpan teks jawaban benar
  const opsiAcak = [...soal.opsi];
  for (let i = opsiAcak.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opsiAcak[i], opsiAcak[j]] = [opsiAcak[j], opsiAcak[i]];
  }
  const benarBaru = opsiAcak.indexOf(jawaban);
  const soalAcak = { ...soal, opsi: opsiAcak, benar: benarBaru };

  // Mode susun: hasilkan field `kata` dari kalimat_susun (jika ada) atau jawaban benar
  if (mode === 'susun') {
    const sumber = soal.kalimat_susun || jawaban;
    const kataBenar = sumber.split(/\s+/).filter(Boolean);
    // Fisher-Yates shuffle — ulangi hingga urutan berbeda dari aslinya (hindari soal trivial)
    let kata = [...kataBenar];
    let attempts = 0;
    do {
      for (let i = kata.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kata[i], kata[j]] = [kata[j], kata[i]];
      }
      attempts++;
    } while (
      kata.length > 1 &&
      kata.join(' ') === kataBenar.join(' ') &&
      attempts < 10
    );
    return { ...soalAcak, kata };
  }

  return soalAcak;
}

// ---------------------------------------------------------------------------
// Tokenisasi sederhana: ubah ke huruf kecil, hapus tanda baca, split kata
// ---------------------------------------------------------------------------
function tokenize(teks) {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Evaluasi mock untuk Mode 3 (Duel Nuansa).
 *
 * Strategi:
 * 1. Cari soal dengan situasi paling mirip (overlap kata situasi) → gunakan opsi benar soal itu sebagai acuan.
 * 2. Hitung skor kemiripan jawaban dengan opsi benar DIKURANGI kemiripan dengan opsi salah.
 * 3. Jawaban < 3 kata atau tidak bermakna → skor di bawah 40.
 * 4. Rincian (konteks, kesopanan, keaslian) bersifat deterministik — tanpa Math.random.
 * 5. `alternatif` = opsi benar soal yang paling relevan dengan situasi.
 */
function evaluasiMock({ situasi, jawaban, bahasa }) {
  // Muat seed
  let soalList = [];
  try {
    const namaFile = bahasa.toLowerCase().replace(/\s+/g, '') + '.json';
    const filePath = path.join(SEED_DIR, namaFile);
    if (fs.existsSync(filePath)) {
      soalList = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (_) { /* abaikan */ }

  const kataJawaban = tokenize(jawaban);
  const panjang = kataJawaban.length;

  // Jawaban terlalu pendek atau kosong → skor rendah langsung
  const terlalupendek = panjang < 3;

  // --- Cari soal paling relevan berdasarkan overlap kata situasi ---
  let soalRelevan = soalList.length > 0 ? soalList[0] : null;
  if (situasi && soalList.length > 0) {
    const kataSituasi = new Set(tokenize(situasi));
    let skorSituasiTertinggi = -1;
    for (const s of soalList) {
      const kataSeed = tokenize(s.situasi);
      const overlap = kataSeed.filter(k => kataSituasi.has(k)).length;
      const rasio = overlap / Math.max(kataSituasi.size, kataSeed.length, 1);
      if (rasio > skorSituasiTertinggi) {
        skorSituasiTertinggi = rasio;
        soalRelevan = s;
      }
    }
  }

  // --- Opsi benar dan opsi salah dari soal relevan ---
  const opsiBenarTeks  = soalRelevan ? soalRelevan.opsi[soalRelevan.benar] : '';
  const opsiSalahList  = soalRelevan
    ? soalRelevan.opsi.filter((_, i) => i !== soalRelevan.benar)
    : [];

  // --- Hitung rasio overlap antara Set kata acuan dan array kata jawaban ---
  function overlapSet(kataSet, kata) {
    return kata.filter(k => kataSet.has(k)).length / Math.max(kataSet.size, kata.length, 1);
  }

  const setBenar = new Set(tokenize(opsiBenarTeks));
  const rasioBenar = overlapSet(setBenar, kataJawaban);

  // Kurangi bila lebih mirip opsi salah
  let rasioSalahMaks = 0;
  for (const opsiS of opsiSalahList) {
    const setS = new Set(tokenize(opsiS));
    const r = overlapSet(setS, kataJawaban);
    if (r > rasioSalahMaks) rasioSalahMaks = r;
  }

  const netRasio = Math.max(0, rasioBenar - rasioSalahMaks * 0.5);

  // --- Skor dasar ---
  let skorDasar;
  if (terlalupendek) {
    // < 3 kata → selalu di bawah 40
    skorDasar = Math.round(10 + netRasio * 28);
  } else {
    // basis 40, tambah hingga +55 dari kemiripan neto, minimum 5
    skorDasar = Math.round(40 + netRasio * 55);
  }
  const skor = Math.max(5, Math.min(100, skorDasar));

  // --- Rincian deterministik (tanpa Math.random) ---
  // konteks = skor + offset dari panjang relatif jawaban vs opsi benar
  const kataBenarList = tokenize(opsiBenarTeks);
  const panjangDelta  = kataBenarList.length > 0
    ? Math.min(1, panjang / kataBenarList.length)
    : 0;
  const konteks   = Math.max(5, Math.min(100, Math.round(skor * 0.9 + panjangDelta * 10)));
  const kesopanan = Math.max(5, Math.min(100, Math.round(skor * 1.05 - 3)));
  const keaslian  = Math.max(5, Math.min(100, Math.round(
    skor * 0.85 + (rasioBenar > 0.3 ? 10 : 0)
  )));

  // --- Feedback dan alternatif ---
  const alternatif = opsiBenarTeks || 'Coba ungkapan yang lebih sesuai konteks.';
  let feedback;
  if (skor >= 80) {
    feedback = `Jawaban "${jawaban}" sangat tepat untuk situasi ini. Pilihan katamu mencerminkan pemahaman konteks yang baik.`;
  } else if (skor >= 55) {
    feedback = `Jawaban "${jawaban}" cukup sesuai, namun masih bisa diperhalus. Perhatikan tingkat kesopanan yang diharapkan.`;
  } else if (terlalupendek) {
    feedback = `Jawaban terlalu singkat. Coba berikan ungkapan yang lebih lengkap dan bermakna untuk situasi ini.`;
  } else {
    feedback = `Jawaban "${jawaban}" kurang tepat untuk situasi ini. Coba gunakan ungkapan yang lebih sesuai konteks.`;
  }

  return {
    skor,
    rincian: { konteks, kesopanan, keaslian },
    feedback,
    alternatif,
    keyakinan: 0.6,
  };
}

module.exports = { getSoalAcak, evaluasiMock };
