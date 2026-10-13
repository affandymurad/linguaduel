/**
 * Kembalikan kalimat kunci untuk mode susun.
 * Gunakan kalimat_susun jika ada; fallback ke opsi[benar].
 *
 * @param {{ kalimat_susun?: string, opsi: string[], benar: number }} soal
 * @returns {string}
 */
export function kalimatSusunBenar(soal) {
  return soal.kalimat_susun ?? soal.opsi[soal.benar];
}

/**
 * Bandingkan dua susunan kalimat secara fleksibel:
 * huruf dikecilkan, spasi dirapikan, tanda baca di ujung dibuang.
 *
 * @param {string} jawaban
 * @param {string} kunci
 * @returns {boolean}
 */
export function samaSusunan(jawaban, kunci) {
  const bersihkan = (s) =>
    s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?;:]+$/, '').trim();
  return bersihkan(jawaban) === bersihkan(kunci);
}

/**
 * Hitung skor satu soal berdasarkan apakah benar dan streak saat ini.
 * Bonus 20% per streak (max 3x), minimal 10 poin untuk jawaban salah.
 *
 * @param {boolean} benar
 * @param {number}  streak - streak SEBELUM soal ini
 * @returns {{ tambahan: number, streakBaru: number }}
 */
export function hitungSkor(benar, streak) {
  if (!benar) {
    return { tambahan: 0, streakBaru: 0 };
  }
  const bonus      = Math.min(streak, 3) * 0.2; // maks 60% bonus
  const tambahan   = Math.round(100 * (1 + bonus));
  const streakBaru = streak + 1;
  return { tambahan, streakBaru };
}

/**
 * Tentukan level berdasarkan total skor.
 *
 * @param {number} totalSkor
 * @returns {'Pemula'|'Mahir'}
 */
export function hitungLevel(totalSkor) {
  return totalSkor >= 500 ? 'Mahir' : 'Pemula';
}

/**
 * Hitung poin untuk Mode Duel Nuansa berdasarkan skor AI dan streak saat ini.
 * Rumus: skor AI × (1 + bonus streak), dibulatkan ke integer.
 * Bonus streak: 20% per streak, maksimum 3 streak (max +60%).
 * Streak naik hanya jika skor AI ≥ 70.
 *
 * @param {number} skorAI   - Skor evaluasi AI (0–100)
 * @param {number} streak   - Streak SEBELUM soal ini
 * @returns {{ tambahan: number, streakBaru: number }}
 */
export function hitungSkorNuansa(skorAI, streak) {
  const bonusStreak = Math.min(streak, 3) * 0.2;
  const tambahan    = Math.round(skorAI * (1 + bonusStreak));
  const streakBaru  = skorAI >= 70 ? streak + 1 : 0;
  return { tambahan, streakBaru };
}

/**
 * Acak urutan kata dalam sebuah kalimat (Fisher-Yates).
 * Menjamin urutan hasil berbeda dari urutan asli (hingga 10 percobaan).
 *
 * @param {string} kalimat
 * @returns {string[]} Array kata dalam urutan acak
 */
export function shuffleWords(kalimat) {
  const kata = kalimat.split(/\s+/).filter(Boolean);
  const asli = kata.join(' ');
  let attempts = 0;
  do {
    for (let i = kata.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [kata[i], kata[j]] = [kata[j], kata[i]];
    }
    attempts++;
  } while (kata.length > 1 && kata.join(' ') === asli && attempts < 10);
  return kata;
}
