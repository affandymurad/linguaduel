import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { fetchQuestion, evaluateAnswer } from '../lib/api.js';
import { updateBestScore } from '../lib/storage.js';
import { hitungSkor, hitungLevel, hitungSkorNuansa, shuffleWords, kalimatSusunBenar, samaSusunan } from '../lib/scoring.js';

import ScoreBar      from '../components/ScoreBar.jsx';
import SituationCard from '../components/SituationCard.jsx';
import OptionList    from '../components/OptionList.jsx';
import WordDnD       from '../components/WordDnD.jsx';
import FreeInput     from '../components/FreeInput.jsx';
import FeedbackPanel from '../components/FeedbackPanel.jsx';
import ReportButton  from '../components/ReportButton.jsx';

const TOTAL_SOAL = 5;

// Label tampilan per mode
const LABEL_MODE = {
  pilihan: 'Pilihan Situasi',
  susun:   'Susun Kalimat',
  nuansa:  'Duel Nuansa',
};

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bahasa = 'Indonesia', level = 'Pemula', mode = 'pilihan' } =
    location.state || {};

  // ── State sesi ──────────────────────────────────────────────────────────────
  const [soalKe,   setSoalKe]   = useState(1);
  const [soal,     setSoal]     = useState(null);
  const [fase,     setFase]     = useState('main');  // 'main' | 'feedback'
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [skor,    setSkor]    = useState(0);
  const [streak,  setStreak]  = useState(0);
  const [riwayat, setRiwayat] = useState([]);

  // Jawaban aktif (berbeda tiap mode)
  const [pilihanIdx,  setPilihanIdx]  = useState(null);   // pilihan
  const [hasilBenar,  setHasilBenar]  = useState(false);
  const [evaluasi,    setEvaluasi]    = useState(null);   // nuansa
  const [evalLoading, setEvalLoading] = useState(false);  // nuansa loading
  const [evalError,   setEvalError]   = useState(null);   // nuansa error
  const [jawabanSusun,setJawabanSusun]= useState('');     // susun

  // Situasi yang sudah dipakai sesi ini (anti-duplikat)
  const situasiDipakaiRef = useRef([]);

  // ── Fetch soal baru ──────────────────────────────────────────────────────────
  const ambilSoal = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSoal(null);
    setFase('main');
    setPilihanIdx(null);
    setHasilBenar(false);
    setEvaluasi(null);
    setEvalError(null);
    setJawabanSusun('');

    try {
      const data = await fetchQuestion(bahasa, level, mode, situasiDipakaiRef.current);
      situasiDipakaiRef.current = [...situasiDipakaiRef.current, data.situasi];
      setSoal(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengambil soal.');
    } finally {
      setLoading(false);
    }
  }, [bahasa, level, mode]);

  useEffect(() => { ambilSoal(); }, [ambilSoal]);

  // ── Handler: Mode Pilihan ────────────────────────────────────────────────────
  function jawabPilihan(idx) {
    if (!soal) return;
    const benar = idx === soal.benar;
    const { tambahan, streakBaru } = hitungSkor(benar, streak);

    const entri = {
      nomor: soalKe,
      situasi: soal.situasi,
      pilihanPemain: soal.opsi[idx],
      opsiBenar: soal.opsi[soal.benar],
      benar,
      mode: 'pilihan',
    };

    setSkor(s => s + tambahan);
    setStreak(streakBaru);
    setRiwayat(r => [...r, entri]);
    setPilihanIdx(idx);
    setHasilBenar(benar);
    setFase('feedback');
  }

  // ── Handler: Mode Susun ──────────────────────────────────────────────────────
  function jawabSusun(jawaban) {
    if (!soal) return;
    const kunci = kalimatSusunBenar(soal);
    const benar = samaSusunan(jawaban, kunci);
    const { tambahan, streakBaru } = hitungSkor(benar, streak);

    const entri = {
      nomor: soalKe,
      situasi: soal.situasi,
      pilihanPemain: jawaban,
      opsiBenar: kunci,
      benar,
      mode: 'susun',
    };

    setSkor(s => s + tambahan);
    setStreak(streakBaru);
    setRiwayat(r => [...r, entri]);
    setJawabanSusun(jawaban);
    setHasilBenar(benar);
    setFase('feedback');
  }

  // ── Handler: Mode Nuansa ─────────────────────────────────────────────────────
  async function jawabNuansa(jawaban) {
    if (!soal) return;
    setEvalLoading(true);
    setEvalError(null);

    try {
      const hasil = await evaluateAnswer(soal.situasi, jawaban, bahasa);
      setEvaluasi(hasil);

      const { tambahan: tambahanNuansa, streakBaru: streakBaruNuansa } = hitungSkorNuansa(hasil.skor, streak);
      const benarNuansa = hasil.skor >= 70;

      const entri = {
        nomor: soalKe,
        situasi: soal.situasi,
        pilihanPemain: jawaban,
        opsiBenar: null,
        benar: benarNuansa,
        mode: 'nuansa',
        skor: hasil.skor,
        feedback: hasil.feedback,
      };

      setSkor(s => s + tambahanNuansa);
      setStreak(streakBaruNuansa);
      setRiwayat(r => [...r, entri]);
      setFase('feedback');
    } catch (err) {
      setEvalError(
        err.message === 'Jawaban tidak boleh kosong'
          ? 'Jawaban tidak boleh kosong. Tulis ungkapan terlebih dahulu!'
          : 'Ups, gagal mengevaluasi jawaban. Periksa koneksi dan coba lagi.',
      );
    } finally {
      setEvalLoading(false);
    }
  }

  // ── Lanjut ke soal berikutnya atau halaman Result ────────────────────────────
  function lanjut() {
    if (soalKe >= TOTAL_SOAL) {
      updateBestScore({ skor, streak });
      navigate('/result', {
        state: {
          skor,
          streak,
          level: hitungLevel(skor),
          riwayat,
          bahasa,
          modeSesi: mode,
        },
      });
    } else {
      setSoalKe(k => k + 1);
      ambilSoal();
    }
  }

  // ── Kata acak untuk mode susun — dihitung sekali per soal ───────────────────
  const kataAcak = useMemo(() => {
    if (!soal || mode !== 'susun') return [];
    return soal.kata ?? shuffleWords(kalimatSusunBenar(soal));
  }, [soal, mode]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-sm space-y-4">

        {/* Header navigasi */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-indigo-500 hover:underline"
          >
            ← Beranda
          </button>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {LABEL_MODE[mode] ?? mode}
          </p>
        </div>

        {/* ScoreBar */}
        <ScoreBar
          skor={skor}
          streak={streak}
          level={hitungLevel(skor)}
          soalKe={soalKe}
          totalSoal={TOTAL_SOAL}
        />

        {/* ── Loading soal ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm text-gray-500">Memuat soal…</p>
          </div>
        )}

        {/* ── Error fetch soal ── */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-5 text-center space-y-3">
            <p className="text-2xl">😔</p>
            <p className="text-sm font-semibold text-red-700">Gagal memuat soal</p>
            <p className="text-xs text-red-500">{error}</p>
            <button
              onClick={ambilSoal}
              className="rounded-xl bg-red-500 px-6 py-2 text-sm font-semibold text-white"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── Soal aktif ── */}
        {!loading && !error && soal && (
          <>
            <SituationCard situasi={soal.situasi} bahasa={bahasa} level={level} />

            {/* ─── fase MAIN ─────────────────────────────────────────────── */}
            {fase === 'main' && (
              <>
                {mode === 'pilihan' && (
                  <OptionList
                    opsi={soal.opsi}
                    indexBenar={soal.benar}
                    onSubmit={jawabPilihan}
                    disabled={false}
                  />
                )}

                {mode === 'susun' && (
                  <WordDnD
                    key={`${soalKe}-${soal.situasi}`}
                    kata={kataAcak}
                    onSubmit={jawabSusun}
                    disabled={false}
                  />
                )}

                {mode === 'nuansa' && (
                  <>
                    <FreeInput onSubmit={jawabNuansa} loading={evalLoading} />
                    {evalError && (
                      <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-center space-y-1">
                        <p className="text-sm font-semibold text-red-700">😔 Gagal mengevaluasi</p>
                        <p className="text-xs text-red-500">{evalError}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ─── fase FEEDBACK ─────────────────────────────────────────── */}
            {fase === 'feedback' && (
              <>
                {/* Mode pilihan: tampilkan opsi ter-highlight (disabled) */}
                {mode === 'pilihan' && (
                  <OptionList
                    opsi={soal.opsi}
                    indexBenar={soal.benar}
                    onSubmit={() => {}}
                    disabled={true}
                  />
                )}

                {/* Mode susun: tampilkan jawaban pemain vs jawaban benar */}
                {mode === 'susun' && (
                  <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Jawabanmu</p>
                    <p className="text-sm font-medium text-gray-700">{jawabanSusun}</p>
                    {!hasilBenar && (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-1">Susunan yang benar</p>
                        <p className="text-sm font-medium text-green-700">{kalimatSusunBenar(soal)}</p>
                      </>
                    )}
                  </div>
                )}

                <FeedbackPanel
                  mode={mode}
                  benar={hasilBenar}
                  penjelasan={soal.penjelasan}
                  catatan_budaya={soal.catatan_budaya}
                  opsiDipilih={mode === 'pilihan' ? soal.opsi[pilihanIdx] : jawabanSusun}
                  opsiBenar={mode === 'susun' ? kalimatSusunBenar(soal) : soal.opsi[soal.benar]}
                  evaluasi={evaluasi}
                />

                <ReportButton
                  bahasa={bahasa}
                  situasi={soal.situasi}
                  opsiDilaporkan={
                    mode === 'pilihan'
                      ? soal.opsi[pilihanIdx]
                      : mode === 'susun'
                        ? jawabanSusun
                        : evaluasi?.feedback ?? ''
                  }
                />

                <button
                  onClick={lanjut}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                >
                  {soalKe >= TOTAL_SOAL ? '📊 Lihat Hasil' : 'Soal Berikutnya →'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
