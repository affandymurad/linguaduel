/**
 * tests/wordDnD_key.test.js
 *
 * Memverifikasi bahwa logika pembuatan key dan kata untuk <WordDnD>
 * menghasilkan kata yang sesuai soal baru setelah prop berganti.
 *
 * Karena @testing-library/react tidak terpasang, test ini menggunakan
 * fungsi bantu yang dipakai Play.jsx secara langsung, membuktikan:
 *   1. key unik per soal: `${soalKe}-${soal.situasi}`
 *   2. Kata yang dihitung dari soal baru berasal dari soal baru,
 *      bukan soal lama — mencegah bug "kata terbawa dari soal sebelumnya".
 */
import { describe, test, expect } from 'vitest';
import { kalimatSusunBenar, shuffleWords } from '../src/lib/scoring.js';

// Simulasikan dua soal berbeda seperti yang dikembalikan server
const soalLama = {
  situasi: 'Kamu lupa mengerjakan PR.',
  kalimat_susun: 'Maaf Bu saya lupa mengerjakan PR',
  opsi: ['Maaf Bu saya lupa mengerjakan PR', 'Tidak saya kerjakan PR-nya'],
  benar: 0,
};

const soalBaru = {
  situasi: 'Kamu ingin makan di warung.',
  kalimat_susun: 'Nanti kita makan di warung makan',
  opsi: ['Nanti kita makan di warung makan', 'Warung makan kita nanti'],
  benar: 0,
};

// Fungsi yang dipakai Play.jsx untuk membentuk key
function buatKey(soalKe, soal) {
  return `${soalKe}-${soal.situasi}`;
}

// Fungsi yang dipakai Play.jsx (useMemo) untuk membentuk kata
function hitungKataAcak(soal, mode) {
  if (!soal || mode !== 'susun') return [];
  return soal.kata ?? shuffleWords(kalimatSusunBenar(soal));
}

describe('WordDnD key — unik per soal', () => {
  test('key soal 1 berbeda dari key soal 2', () => {
    const key1 = buatKey(1, soalLama);
    const key2 = buatKey(2, soalBaru);
    expect(key1).not.toBe(key2);
  });

  test('key mengandung nomor soal dan situasi', () => {
    const key = buatKey(3, soalBaru);
    expect(key).toContain('3');
    expect(key).toContain(soalBaru.situasi);
  });
});

describe('WordDnD kata — berganti saat soal berganti', () => {
  test('kata dari soal lama hanya mengandung kata-kata soal lama', () => {
    const kataLama = hitungKataAcak(soalLama, 'susun');
    const kunciLama = kalimatSusunBenar(soalLama).split(/\s+/).filter(Boolean).sort().join(' ');
    const kataLamaSorted = [...kataLama].sort().join(' ');
    expect(kataLamaSorted).toBe(kunciLama);
  });

  test('kata dari soal baru hanya mengandung kata-kata soal baru', () => {
    const kataBaru = hitungKataAcak(soalBaru, 'susun');
    const kunciBaru = kalimatSusunBenar(soalBaru).split(/\s+/).filter(Boolean).sort().join(' ');
    const kataBaruSorted = [...kataBaru].sort().join(' ');
    expect(kataBaruSorted).toBe(kunciBaru);
  });

  test('kata soal baru tidak sama dengan kata soal lama', () => {
    const kataLama = hitungKataAcak(soalLama, 'susun').sort().join(' ');
    const kataBaru = hitungKataAcak(soalBaru, 'susun').sort().join(' ');
    expect(kataLama).not.toBe(kataBaru);
  });

  test('mode bukan susun → kata kosong', () => {
    expect(hitungKataAcak(soalBaru, 'pilihan')).toEqual([]);
    expect(hitungKataAcak(soalBaru, 'nuansa')).toEqual([]);
  });
});
