import { useState } from 'react';

/**
 * OptionList — Mode 1: tampilkan 4 pilihan, highlight benar/salah setelah submit.
 *
 * Props:
 *   opsi: string[]          — 4 teks pilihan
 *   indexBenar: number      — indeks jawaban benar
 *   onSubmit(idx): void     — callback setelah jawaban dipilih
 *   disabled: boolean       — lock setelah dijawab
 */
export default function OptionList({ opsi, indexBenar, onSubmit, disabled }) {
  const [pilihan, setPilihan] = useState(null);

  function handlePilih(idx) {
    if (disabled || pilihan !== null) return;
    setPilihan(idx);
    onSubmit(idx);
  }

  function getStyle(idx) {
    const base =
      'w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all';

    if (pilihan === null) {
      // Belum dijawab
      return `${base} border-gray-200 bg-white text-gray-800 active:bg-indigo-50`;
    }

    if (idx === indexBenar) {
      // Jawaban benar — selalu hijau
      return `${base} border-green-500 bg-green-50 text-green-800`;
    }

    if (idx === pilihan) {
      // Jawaban yang dipilih tapi salah — merah
      return `${base} border-red-400 bg-red-50 text-red-700`;
    }

    // Opsi lainnya setelah dijawab — redup
    return `${base} border-gray-200 bg-gray-50 text-gray-400`;
  }

  return (
    <div className="space-y-3">
      {opsi.map((teks, idx) => (
        <button
          key={idx}
          onClick={() => handlePilih(idx)}
          disabled={disabled || pilihan !== null}
          className={getStyle(idx)}
        >
          <span className="mr-3 inline-block w-5 text-center font-bold text-gray-400">
            {String.fromCharCode(65 + idx)}.
          </span>
          {teks}
        </button>
      ))}
    </div>
  );
}
