const KEY_BEST = 'linguaduel_best'; // skor tertinggi sepanjang waktu

/**
 * Baca skor tertinggi yang pernah dicapai.
 * @returns {{ skorTerbaik: number, streakTerbaik: number }}
 */
export function getBestScore() {
  try {
    const raw = localStorage.getItem(KEY_BEST);
    if (!raw) return { skorTerbaik: 0, streakTerbaik: 0 };
    const data = JSON.parse(raw);
    if (
      typeof data.skorTerbaik   !== 'number' ||
      typeof data.streakTerbaik !== 'number'
    ) {
      return { skorTerbaik: 0, streakTerbaik: 0 };
    }
    return data;
  } catch {
    return { skorTerbaik: 0, streakTerbaik: 0 };
  }
}

/**
 * Perbarui skor tertinggi jika sesi ini lebih tinggi.
 * @param {{ skor: number, streak: number }} sesiIni
 */
export function updateBestScore({ skor, streak }) {
  const current = getBestScore();
  const updated = {
    skorTerbaik:   Math.max(current.skorTerbaik,   skor),
    streakTerbaik: Math.max(current.streakTerbaik, streak),
  };
  localStorage.setItem(KEY_BEST, JSON.stringify(updated));
}

/**
 * Reset skor tertinggi (misalnya saat pemain ingin memulai dari awal total).
 */
export function resetBestScore() {
  localStorage.removeItem(KEY_BEST);
}
