/**
 * tests/storage.test.js — Unit test untuk lib/storage.js
 * (getBestScore, updateBestScore, resetBestScore)
 *
 * Catatan: getProgress/saveProgress/resetProgress dihapus pada Fix 1.
 * Semua tes yang relevan dipindah ke storage_best.test.js.
 * File ini dipertahankan untuk memastikan import dari storage.js tetap
 * berjalan dan fungsi-fungsi yang diekspor tersedia.
 */
import { describe, test, expect } from 'vitest';
import { getBestScore, updateBestScore, resetBestScore } from '../src/lib/storage.js';

describe('storage.js — exports tersedia', () => {
  test('getBestScore adalah fungsi', () => {
    expect(typeof getBestScore).toBe('function');
  });

  test('updateBestScore adalah fungsi', () => {
    expect(typeof updateBestScore).toBe('function');
  });

  test('resetBestScore adalah fungsi', () => {
    expect(typeof resetBestScore).toBe('function');
  });
});
