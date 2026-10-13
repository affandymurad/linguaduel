/**
 * tests/scoring_nuansa.test.js
 *
 * Unit test untuk:
 *   - shuffleWords  (lib/scoring.js)
 *   - hitungSkorNuansa  (lib/scoring.js)
 */
import { describe, test, expect } from 'vitest';
import { shuffleWords, hitungSkorNuansa } from '../src/lib/scoring.js';

// ---------------------------------------------------------------------------
// shuffleWords
// ---------------------------------------------------------------------------
describe('shuffleWords', () => {
  test('mengembalikan array kata yang sama (tersortir) dengan kalimat asal', () => {
    const kalimat = 'Ojo dumeh lantaran sugih bandha donya';
    const hasil = shuffleWords(kalimat);
    expect([...hasil].sort().join(' ')).toBe(kalimat.split(/\s+/).sort().join(' '));
  });

  test('panjang array sama dengan jumlah kata', () => {
    const kalimat = 'alon alon asal kelakon';
    expect(shuffleWords(kalimat)).toHaveLength(4);
  });

  test('kalimat satu kata dikembalikan sebagai array satu elemen', () => {
    expect(shuffleWords('satu')).toEqual(['satu']);
  });

  test('kalimat kosong mengembalikan array kosong', () => {
    expect(shuffleWords('')).toEqual([]);
  });

  test('kalimat hanya spasi mengembalikan array kosong', () => {
    expect(shuffleWords('   ')).toEqual([]);
  });

  test('menghasilkan urutan yang berbeda dari asli dalam 30 percobaan (multi-kata)', () => {
    // Dengan kalimat 5 kata, probabilitas permutasi acak = urutan asli sangat kecil.
    // Pastikan setidaknya 1 dari 30 percobaan menghasilkan urutan berbeda.
    const kalimat = 'satu dua tiga empat lima';
    const asli = kalimat.split(' ').join(' ');
    let adaBeda = false;
    for (let i = 0; i < 30; i++) {
      if (shuffleWords(kalimat).join(' ') !== asli) {
        adaBeda = true;
        break;
      }
    }
    expect(adaBeda).toBe(true);
  });

  test('tidak menambah atau menghapus kata (kata dengan spasi ganda diabaikan)', () => {
    const kalimat = 'kata  dengan   spasi  ganda';
    const hasil = shuffleWords(kalimat);
    expect(hasil).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// hitungSkorNuansa
// ---------------------------------------------------------------------------
describe('hitungSkorNuansa', () => {
  test('skor 80 streak 0 → tambahan 80, streakBaru 1', () => {
    expect(hitungSkorNuansa(80, 0)).toEqual({ tambahan: 80, streakBaru: 1 });
  });

  test('skor 80 streak 1 → tambahan 96 (80 × 1.2), streakBaru 2', () => {
    expect(hitungSkorNuansa(80, 1)).toEqual({ tambahan: 96, streakBaru: 2 });
  });

  test('skor 80 streak 2 → tambahan 112 (80 × 1.4), streakBaru 3', () => {
    expect(hitungSkorNuansa(80, 2)).toEqual({ tambahan: 112, streakBaru: 3 });
  });

  test('skor 80 streak 3 → tambahan 128 (80 × 1.6), streakBaru 4 (bonus maks)', () => {
    expect(hitungSkorNuansa(80, 3)).toEqual({ tambahan: 128, streakBaru: 4 });
  });

  test('skor 80 streak 5 → tambahan 128 (bonus tidak melebihi 60%)', () => {
    expect(hitungSkorNuansa(80, 5)).toEqual({ tambahan: 128, streakBaru: 6 });
  });

  test('skor 69 (di bawah ambang 70) → streakBaru reset ke 0', () => {
    const result = hitungSkorNuansa(69, 3);
    expect(result.streakBaru).toBe(0);
  });

  test('skor 70 (tepat ambang) → streakBaru naik', () => {
    const result = hitungSkorNuansa(70, 2);
    expect(result.streakBaru).toBe(3);
  });

  test('skor 0 streak 0 → tambahan 0, streakBaru 0', () => {
    expect(hitungSkorNuansa(0, 0)).toEqual({ tambahan: 0, streakBaru: 0 });
  });

  test('skor 100 streak 0 → tambahan 100, streakBaru 1', () => {
    expect(hitungSkorNuansa(100, 0)).toEqual({ tambahan: 100, streakBaru: 1 });
  });

  test('skor 100 streak 3 → tambahan 160 (100 × 1.6)', () => {
    expect(hitungSkorNuansa(100, 3)).toEqual({ tambahan: 160, streakBaru: 4 });
  });

  test('pembulatan: skor 75 streak 1 → tambahan dibulatkan ke 90 (75 × 1.2 = 90)', () => {
    expect(hitungSkorNuansa(75, 1)).toEqual({ tambahan: 90, streakBaru: 2 });
  });

  test('pembulatan: skor 33 streak 2 → tambahan dibulatkan ke 46 (33 × 1.4 = 46.2 → 46)', () => {
    expect(hitungSkorNuansa(33, 2)).toEqual({ tambahan: 46, streakBaru: 0 });
  });
});
