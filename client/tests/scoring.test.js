/**
 * tests/scoring.test.js — Unit test untuk lib/scoring.js
 */
import { describe, test, expect } from 'vitest';
import { hitungSkor, hitungLevel, kalimatSusunBenar, samaSusunan } from '../src/lib/scoring.js';

describe('hitungSkor', () => {
  test('jawaban salah → tambahan 0, streakBaru 0', () => {
    expect(hitungSkor(false, 3)).toEqual({ tambahan: 0, streakBaru: 0 });
  });

  test('jawaban benar dengan streak 0 → 100 poin', () => {
    expect(hitungSkor(true, 0)).toEqual({ tambahan: 100, streakBaru: 1 });
  });

  test('jawaban benar dengan streak 1 → 120 poin', () => {
    expect(hitungSkor(true, 1)).toEqual({ tambahan: 120, streakBaru: 2 });
  });

  test('jawaban benar dengan streak 2 → 140 poin', () => {
    expect(hitungSkor(true, 2)).toEqual({ tambahan: 140, streakBaru: 3 });
  });

  test('jawaban benar dengan streak 3 → 160 poin (maks bonus 60%)', () => {
    expect(hitungSkor(true, 3)).toEqual({ tambahan: 160, streakBaru: 4 });
  });

  test('streak > 3 tidak menambah bonus di atas 60%', () => {
    // streak 5 → bonus masih max 3 * 0.2 = 0.6
    expect(hitungSkor(true, 5)).toEqual({ tambahan: 160, streakBaru: 6 });
  });
});

describe('hitungLevel', () => {
  test('skor < 500 → Pemula', () => {
    expect(hitungLevel(0)).toBe('Pemula');
    expect(hitungLevel(499)).toBe('Pemula');
  });

  test('skor >= 500 → Mahir', () => {
    expect(hitungLevel(500)).toBe('Mahir');
    expect(hitungLevel(1000)).toBe('Mahir');
  });
});

describe('kalimatSusunBenar', () => {
  test('memakai kalimat_susun bila ada', () => {
    const soal = { kalimat_susun: 'Aku pergi ke pasar', opsi: ['Aku ke pasar pergi', 'X'], benar: 0 };
    expect(kalimatSusunBenar(soal)).toBe('Aku pergi ke pasar');
  });

  test('fallback ke opsi[benar] bila kalimat_susun tidak ada', () => {
    const soal = { opsi: ['Dia makan nasi', 'Makan nasi dia'], benar: 0 };
    expect(kalimatSusunBenar(soal)).toBe('Dia makan nasi');
  });

  test('fallback ke opsi[benar] bila kalimat_susun null', () => {
    const soal = { kalimat_susun: null, opsi: ['Pergi ke sekolah', 'X'], benar: 0 };
    expect(kalimatSusunBenar(soal)).toBe('Pergi ke sekolah');
  });
});

describe('samaSusunan', () => {
  test('sama persis → true', () => {
    expect(samaSusunan('Aku pergi ke pasar', 'Aku pergi ke pasar')).toBe(true);
  });

  test('huruf besar/kecil diabaikan', () => {
    expect(samaSusunan('AKU PERGI KE PASAR', 'aku pergi ke pasar')).toBe(true);
  });

  test('spasi ganda di tengah diabaikan', () => {
    expect(samaSusunan('Aku  pergi  ke pasar', 'Aku pergi ke pasar')).toBe(true);
  });

  test('tanda baca di ujung diabaikan', () => {
    expect(samaSusunan('Aku pergi ke pasar.', 'Aku pergi ke pasar')).toBe(true);
  });

  test('tanda tanya di ujung diabaikan', () => {
    expect(samaSusunan('Aku pergi ke pasar?', 'Aku pergi ke pasar')).toBe(true);
  });

  test('urutan kata berbeda → false', () => {
    expect(samaSusunan('pasar ke pergi Aku', 'Aku pergi ke pasar')).toBe(false);
  });

  test('kata berbeda → false', () => {
    expect(samaSusunan('Aku pulang ke rumah', 'Aku pergi ke pasar')).toBe(false);
  });
});
