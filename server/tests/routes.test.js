/**
 * tests/routes.test.js
 *
 * Unit / integration test untuk tiga endpoint LinguaDuel.
 * Jalankan: npm test (dari folder server/)
 *
 * Semua test berjalan dengan MOCK_MODE=true agar tidak perlu API key.
 */

process.env.MOCK_MODE = 'true';
process.env.PORT = '3099'; // port uji, beda dari port dev

const http    = require('http');
const request = require('supertest');
const app     = require('../src/index');

// Buat satu server HTTP yang dipakai bersama semua test, lalu tutup setelah selesai
// agar Jest tidak meninggalkan koneksi terbuka (menghilangkan peringatan "Force exiting").
let server;
beforeAll((done) => { server = http.createServer(app).listen(0, done); });
afterAll((done)  => { server.close(done); });

// ---------------------------------------------------------------------------
// POST /api/question
// ---------------------------------------------------------------------------
describe('POST /api/question', () => {
  test('200 — respons valid untuk bahasa Jawa, level Pemula, mode pilihan', async () => {
    const res = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Jawa', level: 'Pemula', mode: 'pilihan' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      bahasa: expect.any(String),
      level: expect.any(String),
      situasi: expect.any(String),
      opsi: expect.any(Array),
      penjelasan: expect.any(String),
      catatan_budaya: expect.any(String),
    });
    expect(typeof res.body.benar).toBe('number');
  });

  test('200 — semua bahasa yang valid bisa dikueri', async () => {
    const bahasaList = ['Indonesia', 'Betawi', 'Jawa', 'Melayu', 'Sunda', 'Minang'];
    for (const bahasa of bahasaList) {
      const res = await request(server)
        .post('/api/question')
        .send({ bahasa, level: 'Pemula', mode: 'pilihan' });
      expect(res.status).toBe(200);
      expect(res.body.situasi).toBeTruthy();
    }
  });

  test('400 — field wajib tidak dikirim', async () => {
    const res = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Jawa' }); // tanpa level & mode

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  test('400 — bahasa tidak dikenal', async () => {
    const res = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Klingon', level: 'Pemula', mode: 'pilihan' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tidak dikenal/);
  });

  test('400 — level tidak valid', async () => {
    const res = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Jawa', level: 'Expert', mode: 'pilihan' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Pemula.*Mahir|Mahir.*Pemula/);
  });

  test('400 — mode tidak valid', async () => {
    const res = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Jawa', level: 'Pemula', mode: 'terbang' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/pilihan.*susun.*nuansa/);
  });
});

// ---------------------------------------------------------------------------
// POST /api/evaluate
// ---------------------------------------------------------------------------
describe('POST /api/evaluate', () => {
  test('200 — respons valid untuk jawaban bebas', async () => {
    const res = await request(server)
      .post('/api/evaluate')
      .send({
        situasi: 'Kamu terlambat masuk kantor dan bos sedang marah.',
        jawaban: 'Ojo dumeh',
        bahasa: 'Jawa',
      });

    expect(res.status).toBe(200);
    expect(typeof res.body.skor).toBe('number');
    expect(res.body.skor).toBeGreaterThanOrEqual(0);
    expect(res.body.skor).toBeLessThanOrEqual(100);
    expect(res.body.rincian).toMatchObject({
      konteks: expect.any(Number),
      kesopanan: expect.any(Number),
      keaslian: expect.any(Number),
    });
    expect(typeof res.body.feedback).toBe('string');
  });

  test('400 — jawaban kosong ditolak', async () => {
    const res = await request(server)
      .post('/api/evaluate')
      .send({
        situasi: 'Kamu terlambat.',
        jawaban: '   ', // spasi saja
        bahasa: 'Jawa',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/kosong/);
  });

  test('400 — jawaban tidak dikirim sama sekali', async () => {
    const res = await request(server)
      .post('/api/evaluate')
      .send({ situasi: 'Kamu terlambat.', bahasa: 'Jawa' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  test('400 — situasi tidak dikirim', async () => {
    const res = await request(server)
      .post('/api/evaluate')
      .send({ jawaban: 'Ojo dumeh', bahasa: 'Jawa' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// POST /api/report
// ---------------------------------------------------------------------------
describe('POST /api/report', () => {
  test('200 — laporan diterima dan direspons dengan ok: true', async () => {
    const res = await request(server)
      .post('/api/report')
      .send({
        bahasa: 'Betawi',
        situasi: 'Situasi tes dari unit test',
        opsiDilaporkan: 'Gue kagak mau',
        alasan: 'Ungkapan ini kurang pas untuk konteks tersebut',
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.pesan).toBeTruthy();
  });

  test('400 — opsiDilaporkan tidak dikirim', async () => {
    const res = await request(server)
      .post('/api/report')
      .send({ bahasa: 'Betawi', situasi: 'Tes' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  test('400 — situasi tidak dikirim', async () => {
    const res = await request(server)
      .post('/api/report')
      .send({ bahasa: 'Betawi', opsiDilaporkan: 'opsi X' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// services/llm.js — unit test validasi JSON dan extractJSON
// ---------------------------------------------------------------------------
describe('services/llm — validasi & extractJSON', () => {
  const { validateQuestion, validateEvaluasi, extractJSON } = require('../src/services/llm');

  test('validateQuestion — lulus untuk objek valid', () => {
    expect(() => validateQuestion({
      bahasa: 'Jawa', level: 'Pemula',
      situasi: 'Tes situasi', opsi: ['a', 'b', 'c', 'd'],
      benar: 0, penjelasan: 'Penjelasan', catatan_budaya: 'Catatan',
      keyakinan: 0.9,
    })).not.toThrow();
  });

  test('validateQuestion — lulus untuk mode nuansa (opsi kosong, benar=-1)', () => {
    expect(() => validateQuestion({
      bahasa: 'Jawa', level: 'Pemula',
      situasi: 'Tes', opsi: [],
      benar: -1, penjelasan: 'P', catatan_budaya: 'C',
    })).not.toThrow();
  });

  test('validateQuestion — gagal jika situasi kosong', () => {
    expect(() => validateQuestion({
      bahasa: 'Jawa', level: 'Pemula', situasi: '',
      opsi: ['a'], benar: 0, penjelasan: 'P', catatan_budaya: 'C',
    })).toThrow(/situasi/);
  });

  test('validateQuestion — gagal jika benar bukan number', () => {
    expect(() => validateQuestion({
      bahasa: 'Jawa', level: 'Pemula', situasi: 'S',
      opsi: ['a', 'b', 'c', 'd'], benar: '0', penjelasan: 'P', catatan_budaya: 'C',
    })).toThrow(/benar/);
  });

  test('validateEvaluasi — lulus untuk objek valid', () => {
    expect(() => validateEvaluasi({
      skor: 82,
      rincian: { konteks: 90, kesopanan: 80, keaslian: 75 },
      feedback: 'Bagus!',
      alternatif: '',
      keyakinan: 0.78,
    })).not.toThrow();
  });

  test('validateEvaluasi — gagal jika skor di luar 0-100', () => {
    expect(() => validateEvaluasi({
      skor: 150,
      rincian: { konteks: 90, kesopanan: 80, keaslian: 75 },
      feedback: 'Bagus!',
    })).toThrow(/skor/);
  });

  test('validateEvaluasi — gagal jika rincian tidak lengkap', () => {
    expect(() => validateEvaluasi({
      skor: 80,
      rincian: { konteks: 90 }, // kesopanan & keaslian hilang
      feedback: 'Bagus!',
    })).toThrow(/rincian/);
  });

  test('extractJSON — parsing JSON biasa', () => {
    const raw = '{"skor": 80}';
    expect(extractJSON(raw)).toEqual({ skor: 80 });
  });

  test('extractJSON — parsing JSON dalam markdown code fence', () => {
    const raw = '```json\n{"skor": 80}\n```';
    expect(extractJSON(raw)).toEqual({ skor: 80 });
  });

  test('extractJSON — parsing JSON dalam code fence tanpa label', () => {
    const raw = '```\n{"skor": 80}\n```';
    expect(extractJSON(raw)).toEqual({ skor: 80 });
  });

  test('extractJSON — melempar error untuk JSON tidak valid', () => {
    expect(() => extractJSON('ini bukan JSON')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Fix 2 — Deduplication: soal tidak boleh berulang dalam satu sesi
// ---------------------------------------------------------------------------
describe('POST /api/question — deduplication (Fix 2)', () => {
  test('soal berbeda saat situasi sebelumnya dikirim sebagai dipakai', async () => {
    // Ambil soal pertama tanpa filter
    const res1 = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Indonesia', level: 'Pemula', mode: 'pilihan', dipakai: [] });

    expect(res1.status).toBe(200);
    const situasi1 = res1.body.situasi;

    // Ambil soal kedua dengan situasi pertama sudah dalam daftar dipakai
    const res2 = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Indonesia', level: 'Pemula', mode: 'pilihan', dipakai: [situasi1] });

    expect(res2.status).toBe(200);
    // Situasi kedua harus berbeda dari situasi pertama
    expect(res2.body.situasi).not.toBe(situasi1);
  });

  test('field dipakai yang bukan array diabaikan (tidak error)', async () => {
    const res = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Jawa', level: 'Pemula', mode: 'pilihan', dipakai: 'bukan_array' });

    expect(res.status).toBe(200);
    expect(res.body.situasi).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Fix 3 — Seed data tidak mengandung placeholder [nama] / [namo] / [ngaran]
// ---------------------------------------------------------------------------
describe('Seed data — tidak ada placeholder [nama] (Fix 3)', () => {
  const fs   = require('fs');
  const path = require('path');
  const SEED_DIR = path.join(__dirname, '../data/seed');
  const BAHASA_LIST = ['indonesia', 'betawi', 'jawa', 'melayu', 'sunda', 'minang'];

  BAHASA_LIST.forEach((bahasa) => {
    test(`${bahasa}.json tidak memiliki teks dalam kurung siku [...] di opsi`, () => {
      const filePath = path.join(SEED_DIR, `${bahasa}.json`);
      const soalList = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      soalList.forEach((soal, i) => {
        soal.opsi.forEach((opsi, j) => {
          expect(opsi).not.toMatch(
            /\[.*?\]/,
            `${bahasa}.json soal[${i}].opsi[${j}] masih mengandung placeholder: "${opsi}"`
          );
        });
        // Periksa juga situasi
        expect(soal.situasi).not.toMatch(
          /\[.*?\]/,
          `${bahasa}.json soal[${i}].situasi masih mengandung placeholder`
        );
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Sub-Task 4 Review Fixes
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Fix 1 — getSoalAcak: opsi diacak, opsi[benar] tetap jawaban yang benar
// ---------------------------------------------------------------------------
describe('services/mock — getSoalAcak Fix 1: opsi diacak', () => {
  const { getSoalAcak } = require('../src/services/mock');

  test('opsi[benar] selalu merupakan jawaban benar yang sama dari seed', () => {
    // Ambil soal berkali-kali dan pastikan opsi[benar] konsisten merujuk ke jawaban yang benar.
    // Karena opsi diacak setiap kali, indeks benar bisa berbeda tiap panggilan.
    const ITERASI = 30;
    const jawabanBenarSet = new Set();
    for (let i = 0; i < ITERASI; i++) {
      const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula' });
      // Jawaban yang ditunjuk soal.benar harus ada di opsi
      expect(soal.opsi[soal.benar]).toBeDefined();
      jawabanBenarSet.add(soal.opsi[soal.benar]);
    }
    // opsi[benar] harus selalu string bermakna (bukan undefined / null)
    for (const jawaban of jawabanBenarSet) {
      expect(typeof jawaban).toBe('string');
      expect(jawaban.length).toBeGreaterThan(0);
    }
  });

  test('posisi benar bervariasi di antara 30 permintaan (tidak selalu 0)', () => {
    const ITERASI = 30;
    const posisiSet = new Set();
    for (let i = 0; i < ITERASI; i++) {
      const soal = getSoalAcak({ bahasa: 'Indonesia', level: 'Pemula' });
      posisiSet.add(soal.benar);
    }
    // Dengan 30 iterasi, harus ada lebih dari 1 posisi yang muncul (diacak)
    expect(posisiSet.size).toBeGreaterThan(1);
  });

  test('opsi[benar] selalu merupakan teks jawaban yang sama dari seed (cross-check dengan seed)', () => {
    const fs   = require('fs');
    const path = require('path');
    const seedPath = path.join(__dirname, '../data/seed/jawa.json');
    const seedList = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    const jawabanBenarSeed = new Set(seedList.map(s => s.opsi[s.benar]));

    for (let i = 0; i < 20; i++) {
      const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula' });
      expect(jawabanBenarSeed.has(soal.opsi[soal.benar])).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Fix 2 — evaluasiMock: jawaban mirip benar > jawaban acak; alternatif relevan dengan situasi
// ---------------------------------------------------------------------------
describe('services/mock — evaluasiMock Fix 2', () => {
  const { getSoalAcak, evaluasiMock } = require('../src/services/mock');

  test('jawaban yang mirip dengan opsi benar mendapat skor lebih tinggi dari jawaban acak', () => {
    const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula' });
    const jawabanBenar = soal.opsi[soal.benar];

    const hasilBenar = evaluasiMock({ situasi: soal.situasi, jawaban: jawabanBenar, bahasa: 'Jawa' });
    const hasilAcak  = evaluasiMock({ situasi: soal.situasi, jawaban: 'xyz zyx abc', bahasa: 'Jawa' });

    expect(hasilBenar.skor).toBeGreaterThan(hasilAcak.skor);
  });

  test('jawaban < 3 kata mendapat skor di bawah 40', () => {
    const hasil = evaluasiMock({ situasi: 'Situasi tes apa saja.', jawaban: 'oke', bahasa: 'Jawa' });
    expect(hasil.skor).toBeLessThan(40);
  });

  test('jawaban < 3 kata (2 kata) mendapat skor di bawah 40', () => {
    const hasil = evaluasiMock({ situasi: 'Situasi tes apa saja.', jawaban: 'ya oke', bahasa: 'Jawa' });
    expect(hasil.skor).toBeLessThan(40);
  });

  test('rincian bersifat deterministik — hasil sama untuk input yang sama', () => {
    const opts = { situasi: 'Kancamu njaluk tulung nalika kowe lagi sibuk.', jawaban: 'Mengko disik ya aku lagi sibuk tenan', bahasa: 'Jawa' };
    const hasil1 = evaluasiMock(opts);
    const hasil2 = evaluasiMock(opts);
    expect(hasil1.skor).toBe(hasil2.skor);
    expect(hasil1.rincian.konteks).toBe(hasil2.rincian.konteks);
    expect(hasil1.rincian.kesopanan).toBe(hasil2.rincian.kesopanan);
    expect(hasil1.rincian.keaslian).toBe(hasil2.rincian.keaslian);
  });

  test('alternatif relevan dengan situasi (bukan undefined/null)', () => {
    const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula' });
    const hasil = evaluasiMock({ situasi: soal.situasi, jawaban: 'apa saja jawaban', bahasa: 'Jawa' });
    expect(typeof hasil.alternatif).toBe('string');
    expect(hasil.alternatif.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Fix 3 — Mode Susun: kata SELALU diacak, tidak sama dengan urutan asli
// ---------------------------------------------------------------------------
describe('services/mock — getSoalAcak Fix 3: mode susun kata diacak', () => {
  const { getSoalAcak } = require('../src/services/mock');

  test('mode susun menghasilkan field kata', () => {
    const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula', mode: 'susun' });
    expect(Array.isArray(soal.kata)).toBe(true);
    expect(soal.kata.length).toBeGreaterThan(0);
  });

  test('kata berisi kata-kata yang sama dengan sumber susun (kalimat_susun atau jawaban benar)', () => {
    // kalimat_susun bisa lebih pendek dari opsi[benar]; yang penting kata-kata di soal.kata
    // sama persis (tersortir) dengan kata-kata dari sumber yang dipakai mock.
    const fs   = require('fs');
    const path = require('path');
    const seedPath = path.join(__dirname, '../data/seed/jawa.json');
    const seedList = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    for (let i = 0; i < 20; i++) {
      const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula', mode: 'susun' });
      const jawabanBenar = soal.opsi[soal.benar];
      // Cari soal seed yang sesuai (berdasarkan jawaban benar)
      const seedSoal = seedList.find(s => s.opsi[s.benar] === jawabanBenar);
      const sumber = (seedSoal && seedSoal.kalimat_susun) ? seedSoal.kalimat_susun : jawabanBenar;
      const kataBenar = sumber.split(/\s+/).filter(Boolean).sort().join(' ');
      const kataAcak  = [...soal.kata].sort().join(' ');
      expect(kataAcak).toBe(kataBenar);
    }
  });

  test('kata tidak sama dengan urutan sumber susun (diacak, bukan tersusun lurus)', () => {
    // Coba 30 kali untuk mendapatkan setidaknya 1 yang berbeda urutan dari sumber aslinya
    const fs   = require('fs');
    const path = require('path');
    const seedPath = path.join(__dirname, '../data/seed/jawa.json');
    const seedList = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    let adaYangBerbeda = false;
    for (let i = 0; i < 30; i++) {
      const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula', mode: 'susun' });
      const jawabanBenar = soal.opsi[soal.benar];
      const seedSoal = seedList.find(s => s.opsi[s.benar] === jawabanBenar);
      const sumber = (seedSoal && seedSoal.kalimat_susun) ? seedSoal.kalimat_susun : jawabanBenar;
      if (soal.kata.length > 1 && soal.kata.join(' ') !== sumber) {
        adaYangBerbeda = true;
        break;
      }
    }
    expect(adaYangBerbeda).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Fix 3b — routes/question.js fallback seed teruskan mode
// ---------------------------------------------------------------------------
describe('POST /api/question mode susun — kata tersedia (Fix 3b)', () => {
  test('respons mode susun memiliki field kata berupa array', async () => {
    const res = await request(server)
      .post('/api/question')
      .send({ bahasa: 'Jawa', level: 'Pemula', mode: 'susun' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.kata)).toBe(true);
    expect(res.body.kata.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Bug B fix — mode susun: kata berasal dari kalimat_susun, bukan opsi[benar]
// ---------------------------------------------------------------------------
describe('services/mock — getSoalAcak Bug B fix: kata dari kalimat_susun', () => {
  const { getSoalAcak } = require('../src/services/mock');
  const fs   = require('fs');
  const path = require('path');

  test('untuk soal ber-kalimat_susun, kata berisi kata-kata kalimat_susun (bukan opsi[benar])', () => {
    const seedPath = path.join(__dirname, '../data/seed/jawa.json');
    const seedList = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    // Ambil soal seed yang punya kalimat_susun
    const soalDenganKS = seedList.filter(s => s.kalimat_susun);
    expect(soalDenganKS.length).toBeGreaterThan(0);

    let ditemukan = false;
    // Coba hingga 50x sampai dapat soal yang kalimat_susun-nya beda dari opsi[benar]
    for (let i = 0; i < 50 && !ditemukan; i++) {
      const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula', mode: 'susun' });
      const jawabanBenar = soal.opsi[soal.benar];
      const seedSoal = seedList.find(s => s.opsi[s.benar] === jawabanBenar);
      if (!seedSoal || !seedSoal.kalimat_susun) continue;

      const kunciKS = seedSoal.kalimat_susun.split(/\s+/).filter(Boolean).sort().join(' ');
      const kataAcak = [...soal.kata].sort().join(' ');
      // kata harus cocok dengan kalimat_susun, bukan dengan opsi[benar] (yang bisa berbeda)
      expect(kataAcak).toBe(kunciKS);
      ditemukan = true;
    }
    expect(ditemukan).toBe(true);
  });

  test('kata tidak dalam urutan yang sama dengan kalimat_susun (sudah diacak)', () => {
    const seedPath = path.join(__dirname, '../data/seed/jawa.json');
    const seedList = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    let adaBeda = false;
    for (let i = 0; i < 50 && !adaBeda; i++) {
      const soal = getSoalAcak({ bahasa: 'Jawa', level: 'Pemula', mode: 'susun' });
      const jawabanBenar = soal.opsi[soal.benar];
      const seedSoal = seedList.find(s => s.opsi[s.benar] === jawabanBenar);
      if (!seedSoal || !seedSoal.kalimat_susun) continue;
      if (soal.kata.length > 1 && soal.kata.join(' ') !== seedSoal.kalimat_susun) {
        adaBeda = true;
      }
    }
    expect(adaBeda).toBe(true);
  });
});
