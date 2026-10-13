import { useState } from 'react';

/**
 * FeedbackPanel — Tampilkan feedback setelah menjawab.
 *
 * Props (Mode pilihan / susun):
 *   benar: boolean
 *   penjelasan: string
 *   catatan_budaya: string
 *   opsiDipilih?: string      — teks jawaban pemain
 *   opsiBenar?: string        — teks jawaban yang benar
 *
 * Props tambahan untuk Mode nuansa:
 *   mode: 'pilihan' | 'susun' | 'nuansa'
 *   evaluasi?: {
 *     skor: number
 *     rincian: { konteks: number, kesopanan: number, keaslian: number }
 *     feedback: string
 *     alternatif: string
 *   }
 */
export default function FeedbackPanel({
  benar,
  penjelasan,
  catatan_budaya,
  opsiDipilih,
  opsiBenar,
  mode = 'pilihan',
  evaluasi,
}) {
  const [showBudaya, setShowBudaya] = useState(false);
  const isNuansa = mode === 'nuansa';

  return (
    <div className="space-y-3">

      {/* ── Mode Duel Nuansa: tampilkan skor rinci ── */}
      {isNuansa && evaluasi ? (
        <NuansaResult evaluasi={evaluasi} catatan_budaya={catatan_budaya} />
      ) : (
        <>
          {/* Header benar/salah (Mode pilihan & susun) */}
          <div
            className={[
              'flex items-center gap-3 rounded-2xl px-4 py-3',
              benar ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200',
            ].join(' ')}
          >
            <span className="text-2xl">{benar ? '✅' : '❌'}</span>
            <div>
              <p className={`font-bold text-sm ${benar ? 'text-green-700' : 'text-red-700'}`}>
                {benar ? 'Jawaban Benar!' : 'Jawaban Salah'}
              </p>
              {!benar && opsiBenar && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Jawaban benar: <span className="font-semibold text-green-700">{opsiBenar}</span>
                </p>
              )}
            </div>
          </div>

          {/* Penjelasan */}
          {penjelasan && (
            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Penjelasan
              </p>
              <p className="text-sm leading-relaxed text-gray-700">{penjelasan}</p>
            </div>
          )}

          {/* Kartu Budaya — toggle */}
          {catatan_budaya && (
            <KartBudaya catatan_budaya={catatan_budaya} show={showBudaya} onToggle={() => setShowBudaya(v => !v)} />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponen: NuansaResult — tampilkan skor + rincian 3 dimensi + feedback
// ---------------------------------------------------------------------------
function NuansaResult({ evaluasi, catatan_budaya }) {
  const [showBudaya, setShowBudaya] = useState(false);
  const { skor, rincian, feedback, alternatif } = evaluasi;

  // Warna badge skor
  const warnaSkor =
    skor >= 80 ? 'text-green-700 bg-green-50 border-green-200' :
    skor >= 55 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="space-y-3">
      {/* Skor besar */}
      <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${warnaSkor}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Skor Nuansa</p>
          <p className="text-3xl font-extrabold leading-none mt-0.5">{skor}<span className="text-base font-medium opacity-60">/100</span></p>
        </div>
        <span className="text-4xl">
          {skor >= 80 ? '🏆' : skor >= 55 ? '📝' : '💡'}
        </span>
      </div>

      {/* Rincian 3 dimensi */}
      <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Rincian Evaluasi
        </p>
        {[
          { label: 'Konteks',   nilai: rincian.konteks },
          { label: 'Kesopanan', nilai: rincian.kesopanan },
          { label: 'Keaslian',  nilai: rincian.keaslian },
        ].map(({ label, nilai }) => (
          <DimensiBar key={label} label={label} nilai={nilai} />
        ))}
      </div>

      {/* Feedback 2 kalimat */}
      <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Feedback AI
        </p>
        <p className="text-sm leading-relaxed text-gray-700">{feedback}</p>
      </div>

      {/* Alternatif yang lebih natural */}
      {alternatif && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 px-4 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">
            ✨ Alternatif lebih natural
          </p>
          <p className="text-sm leading-relaxed text-indigo-800 font-medium">{alternatif}</p>
        </div>
      )}

      {/* Kartu Budaya */}
      {catatan_budaya && (
        <KartBudaya
          catatan_budaya={catatan_budaya}
          show={showBudaya}
          onToggle={() => setShowBudaya(v => !v)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponen: DimensiBar — progress bar skor dimensi
// ---------------------------------------------------------------------------
function DimensiBar({ label, nilai }) {
  const warna =
    nilai >= 80 ? 'bg-green-400' :
    nilai >= 55 ? 'bg-yellow-400' :
                  'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
        <span>{label}</span>
        <span className="font-semibold">{nilai}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${warna}`}
          style={{ width: `${nilai}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponen: KartBudaya — collapsible cultural note card
// ---------------------------------------------------------------------------
function KartBudaya({ catatan_budaya, show, onToggle }) {
  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-amber-800"
      >
        <span>🏛️ Kartu Budaya</span>
        <span className="text-amber-600">{show ? '▲' : '▼'}</span>
      </button>
      {show && (
        <div className="px-4 pb-4">
          <p className="text-sm leading-relaxed text-amber-900">{catatan_budaya}</p>
        </div>
      )}
    </div>
  );
}
