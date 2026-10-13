import { useState } from 'react';
import { sendReport } from '../lib/api.js';

/**
 * ReportButton — Tombol "Laporkan jawaban keliru" yang mengirim ke /api/report.
 *
 * Props:
 *   bahasa: string
 *   situasi: string
 *   opsiDilaporkan: string  — teks opsi yang dianggap keliru
 */
export default function ReportButton({ bahasa, situasi, opsiDilaporkan }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'sent' | 'error'
  const [showForm, setShowForm] = useState(false);
  const [alasan, setAlasan] = useState('');

  async function kirimLaporan() {
    setStatus('loading');
    try {
      await sendReport({ bahasa, situasi, opsiDilaporkan, alasan });
      setStatus('sent');
      setShowForm(false);
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <p className="text-center text-xs text-green-600 font-medium py-2">
        ✅ Laporan terkirim. Terima kasih!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl border border-gray-300 py-2 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
        >
          🚩 Laporkan jawaban keliru
        </button>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-red-700">Laporkan Soal / Jawaban</p>
          <textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Alasan pelaporan (opsional)…"
            rows={2}
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={kirimLaporan}
              disabled={status === 'loading'}
              className="flex-1 rounded-xl bg-red-500 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {status === 'loading' ? 'Mengirim…' : 'Kirim Laporan'}
            </button>
            <button
              onClick={() => { setShowForm(false); setStatus('idle'); }}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs text-gray-600"
            >
              Batal
            </button>
          </div>
          {status === 'error' && (
            <p className="text-xs text-red-600">Gagal mengirim laporan. Coba lagi.</p>
          )}
        </div>
      )}
    </div>
  );
}
