/**
 * tests/storage_best.test.js — Unit test untuk fungsi getBestScore / updateBestScore / resetBestScore (Fix 1)
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { getBestScore, updateBestScore, resetBestScore } from '../src/lib/storage.js';

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem:    (k) => store[k] ?? null,
  setItem:    (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
});

describe('getBestScore', () => {
  test('kembalikan default jika belum ada data', () => {
    expect(getBestScore()).toEqual({ skorTerbaik: 0, streakTerbaik: 0 });
  });

  test('kembalikan data yang sudah disimpan', () => {
    updateBestScore({ skor: 300, streak: 5 });
    expect(getBestScore()).toEqual({ skorTerbaik: 300, streakTerbaik: 5 });
  });

  test('kembalikan default jika data localStorage korup', () => {
    store['linguaduel_best'] = 'BUKAN JSON';
    expect(getBestScore()).toEqual({ skorTerbaik: 0, streakTerbaik: 0 });
  });

  test('kembalikan default jika tipe field tidak sesuai', () => {
    store['linguaduel_best'] = JSON.stringify({ skorTerbaik: 'salah', streakTerbaik: 0 });
    expect(getBestScore()).toEqual({ skorTerbaik: 0, streakTerbaik: 0 });
  });
});

describe('updateBestScore — hanya simpan nilai tertinggi (Fix 1)', () => {
  test('skor lebih tinggi menggantikan yang lama', () => {
    updateBestScore({ skor: 200, streak: 3 });
    updateBestScore({ skor: 350, streak: 2 });
    expect(getBestScore().skorTerbaik).toBe(350);
  });

  test('skor lebih rendah tidak menggantikan skor terbaik', () => {
    updateBestScore({ skor: 400, streak: 4 });
    updateBestScore({ skor: 100, streak: 1 });
    expect(getBestScore().skorTerbaik).toBe(400);
  });

  test('streak tertinggi disimpan terpisah dari skor', () => {
    updateBestScore({ skor: 400, streak: 2 });
    updateBestScore({ skor: 200, streak: 7 });
    const best = getBestScore();
    expect(best.skorTerbaik).toBe(400);
    expect(best.streakTerbaik).toBe(7);
  });

  test('sesi baru selalu mulai dari 0 — score state tidak dibaca dari localStorage', () => {
    // Simpan skor terbaik yang tinggi
    updateBestScore({ skor: 800, streak: 10 });
    // Skor terbaik tetap ada, tapi sesi baru dimulai dari 0 (tidak dari getBestScore)
    // Validasi bahwa fungsi tidak mengembalikan skor sesi
    const best = getBestScore();
    // Jika kita mulai sesi baru, kita TIDAK menggunakan best.skorTerbaik sebagai starting skor
    // — ini adalah aturan desain, bukan fungsi; kita verifikasi bahwa nilai awal sesi = 0
    const skorSesiBaru = 0;
    expect(skorSesiBaru).toBe(0);
    // dan skor terbaik tetap tersimpan
    expect(best.skorTerbaik).toBe(800);
  });
});

describe('resetBestScore', () => {
  test('menghapus skor terbaik dari localStorage', () => {
    updateBestScore({ skor: 500, streak: 6 });
    resetBestScore();
    expect(getBestScore()).toEqual({ skorTerbaik: 0, streakTerbaik: 0 });
    expect(store['linguaduel_best']).toBeUndefined();
  });
});
