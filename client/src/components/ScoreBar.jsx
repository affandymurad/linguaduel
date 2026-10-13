/**
 * ScoreBar — Menampilkan skor total, streak, dan level badge.
 *
 * Props:
 *   skor: number
 *   streak: number
 *   level: 'Pemula' | 'Mahir'
 *   soalKe: number   — soal ke-N dari total
 *   totalSoal: number
 */
export default function ScoreBar({ skor, streak, level, soalKe, totalSoal }) {
  const levelColor = level === 'Mahir'
    ? 'bg-violet-100 text-violet-700'
    : 'bg-sky-100 text-sky-700';

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
      {/* Skor */}
      <div className="text-center">
        <p className="text-xs text-gray-400">Skor</p>
        <p className="text-lg font-bold text-indigo-700">{skor}</p>
      </div>

      {/* Progress soal */}
      <div className="text-center">
        <p className="text-xs text-gray-400">Soal</p>
        <p className="text-base font-semibold text-gray-700">
          {soalKe}/{totalSoal}
        </p>
      </div>

      {/* Streak */}
      <div className="text-center">
        <p className="text-xs text-gray-400">Streak</p>
        <p className="text-lg font-bold text-orange-500">
          {streak > 0 ? `🔥 ${streak}` : '—'}
        </p>
      </div>

      {/* Level badge */}
      <div className="text-center">
        <p className="text-xs text-gray-400">Level</p>
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${levelColor}`}>
          {level}
        </span>
      </div>
    </div>
  );
}
