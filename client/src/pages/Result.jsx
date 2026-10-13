import { useLocation, useNavigate } from 'react-router-dom';
import { hitungLevel } from '../lib/scoring.js';
import { resetBestScore } from '../lib/storage.js';

const TOTAL_SOAL = 5;

const LABEL_MODE = {
  pilihan: 'Pilihan Situasi',
  susun:   'Susun Kalimat',
  nuansa:  'Duel Nuansa',
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    skor       = 0,
    streak     = 0,
    level,
    riwayat    = [],
    bahasa     = '',
    modeSesi   = 'pilihan',
  } = location.state || {};

  const levelAkhir = level || hitungLevel(skor);
  const jumlahBenar = riwayat.filter((r) => r.benar).length;

  function mainLagi() {
    // Simpan skor tetapi reset riwayat sesi
    navigate('/');
  }

  function resetDanMainLagi() {
    resetBestScore();
    navigate('/');
  }

  function getLevelBadgeClass(lvl) {
    return lvl === 'Mahir'
      ? 'bg-violet-100 text-violet-700 border border-violet-300'
      : 'bg-sky-100 text-sky-700 border border-sky-300';
  }

  function getEmoji() {
    const pct = jumlahBenar / Math.max(riwayat.length, 1);
    if (pct === 1)   return '🏆';
    if (pct >= 0.6)  return '🎉';
    if (pct >= 0.4)  return '😊';
    return '💪';
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-sm space-y-5">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-5xl">{getEmoji()}</p>
          <h1 className="text-2xl font-bold text-gray-800">Sesi Selesai!</h1>
          {bahasa && (
            <p className="text-sm text-gray-500">{bahasa} · {LABEL_MODE[modeSesi] ?? modeSesi}</p>
          )}
        </div>

        {/* Ringkasan skor */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div className="px-2">
              <p className="text-2xl font-bold text-indigo-700">{skor}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Skor</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-bold text-orange-500">
                {streak > 0 ? `🔥 ${streak}` : streak}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Streak</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-bold text-green-600">
                {jumlahBenar}/{riwayat.length || TOTAL_SOAL}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Benar</p>
            </div>
          </div>

          {/* Peringkat badge */}
          <div className="mt-4 text-center">
            <span className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${getLevelBadgeClass(levelAkhir)}`}>
              {levelAkhir === 'Mahir' ? '⭐ ' : ''}Peringkat: {levelAkhir}
            </span>
          </div>
        </div>

        {/* Riwayat jawaban per soal */}
        {riwayat.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Riwayat Jawaban
            </h2>
            <div className="space-y-3">
              {riwayat.map((entri, i) => (
                <EntriRiwayat key={i} entri={entri} nomor={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Tombol aksi */}
        <div className="space-y-2 pb-6">
          <button
            onClick={mainLagi}
            className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Main Lagi →
          </button>
          <button
            onClick={resetDanMainLagi}
            className="w-full rounded-xl border border-gray-300 py-2.5 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
          >
            Reset Skor &amp; Mulai dari Awal
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponen: EntriRiwayat — satu kartu riwayat, mendukung semua mode
// ---------------------------------------------------------------------------
function EntriRiwayat({ entri, nomor }) {
  const isNuansa = entri.mode === 'nuansa';

  // Warna border/background
  const warnaKartu = isNuansa
    ? entri.skor >= 70
      ? 'border-green-200 bg-green-50'
      : entri.skor >= 45
        ? 'border-yellow-200 bg-yellow-50'
        : 'border-red-200 bg-red-50'
    : entri.benar
      ? 'border-green-200 bg-green-50'
      : 'border-red-200 bg-red-50';

  return (
    <div className={`rounded-2xl border px-4 py-3 space-y-1 ${warnaKartu}`}>
      {/* Nomor & status */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">
          Soal {entri.nomor ?? nomor}
        </p>
        {isNuansa ? (
          <span className="text-xs font-bold text-indigo-700">
            🎯 Skor: {entri.skor ?? '–'}/100
          </span>
        ) : (
          <span className={`text-xs font-bold ${entri.benar ? 'text-green-700' : 'text-red-600'}`}>
            {entri.benar ? '✅ Benar' : '❌ Salah'}
          </span>
        )}
      </div>

      {/* Situasi (singkat) */}
      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
        {entri.situasi}
      </p>

      {/* Jawaban pemain */}
      <p className="text-xs text-gray-500">
        Jawabanmu:{' '}
        <span className={`font-semibold ${
          isNuansa
            ? 'text-indigo-700'
            : entri.benar ? 'text-green-700' : 'text-red-600'
        }`}>
          {entri.pilihanPemain}
        </span>
      </p>

      {/* Feedback singkat untuk nuansa */}
      {isNuansa && entri.feedback && (
        <p className="text-xs text-gray-500 italic line-clamp-2">
          {entri.feedback}
        </p>
      )}

      {/* Jawaban benar untuk pilihan/susun */}
      {!isNuansa && !entri.benar && entri.opsiBenar && (
        <p className="text-xs text-gray-500">
          Jawaban benar:{' '}
          <span className="font-semibold text-green-700">{entri.opsiBenar}</span>
        </p>
      )}
    </div>
  );
}
