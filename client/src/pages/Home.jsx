import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguagePicker from '../components/LanguagePicker.jsx';

const LEVEL_LIST = ['Pemula', 'Mahir'];

const MODE_LIST = [
  { kode: 'pilihan', label: 'Pilihan Situasi',  deskripsi: 'Pilih jawaban yang paling tepat dari 4 opsi.' },
  { kode: 'susun',   label: 'Susun Kalimat',    deskripsi: 'Susun kata-kata menjadi ungkapan yang benar.' },
  { kode: 'nuansa',  label: 'Duel Nuansa',      deskripsi: 'Tulis ungkapan bebas; AI akan menilai nuansanya.' },
];

export default function Home() {
  const navigate = useNavigate();

  const [bahasa, setBahasa] = useState('Indonesia');
  const [level,  setLevel]  = useState('Pemula');
  const [mode,   setMode]   = useState('pilihan');

  function mulai() {
    navigate('/play', { state: { bahasa, level, mode } });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">LinguaDuel 🎯</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kuasai nuansa bahasa daerah Indonesia
          </p>
        </div>

        {/* Pilih Bahasa */}
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Pilih Bahasa
          </h2>
          <LanguagePicker selected={bahasa} onChange={setBahasa} />
        </section>

        {/* Pilih Level */}
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Level
          </h2>
          <div className="flex gap-3">
            {LEVEL_LIST.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={[
                  'flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-all',
                  level === l
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300',
                ].join(' ')}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        {/* Pilih Mode */}
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Mode Permainan
          </h2>
          <div className="space-y-2">
            {MODE_LIST.map((m) => (
              <button
                key={m.kode}
                onClick={() => setMode(m.kode)}
                className={[
                  'w-full rounded-xl border-2 px-4 py-3 text-left transition-all',
                  mode === m.kode
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50',
                ].join(' ')}
              >
                <p className={`text-sm font-semibold ${mode === m.kode ? 'text-indigo-700' : 'text-gray-800'}`}>
                  {m.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{m.deskripsi}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Tombol Mulai */}
        <button
          onClick={mulai}
          className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800"
        >
          Mulai Bermain →
        </button>
      </div>
    </div>
  );
}
