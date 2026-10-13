import { useState } from 'react';

/**
 * FreeInput — Textarea bebas untuk Mode Duel Nuansa.
 *
 * Props:
 *   onSubmit(teks: string): void  — dipanggil saat pemain menekan Kirim
 *   loading: boolean              — nonaktifkan tombol saat menunggu AI
 */
export default function FreeInput({ onSubmit, loading }) {
  const [teks, setTeks] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!teks.trim()) {
      setError('Jawaban tidak boleh kosong. Tulis ungkapan yang menurutmu paling tepat!');
      return;
    }
    setError('');
    onSubmit(teks.trim());
  }

  function handleKeyDown(e) {
    // Ctrl/Cmd + Enter = kirim
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
        Tulis jawabanmu
      </label>

      <textarea
        value={teks}
        onChange={(e) => {
          setTeks(e.target.value);
          if (error) setError('');
        }}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={4}
        placeholder="Tulis ungkapan atau kalimat yang paling tepat untuk situasi ini…"
        className={[
          'w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm leading-relaxed text-gray-800',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-indigo-400',
          'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
          error ? 'border-red-300' : 'border-gray-200',
        ].join(' ')}
      />

      {/* Pesan error jawaban kosong */}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}

      {/* Hint keyboard shortcut */}
      {!loading && !error && (
        <p className="text-xs text-gray-400">
          Tekan <kbd className="rounded border border-gray-200 bg-gray-100 px-1 py-0.5 text-xs">Ctrl+Enter</kbd> atau tombol di bawah untuk mengirim.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={[
          'w-full rounded-xl py-3 text-base font-semibold text-white shadow-sm transition-colors',
          loading
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
        ].join(' ')}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Mengevaluasi…
          </span>
        ) : (
          'Kirim Jawaban →'
        )}
      </button>
    </div>
  );
}
