/**
 * Fetch soal dari server.
 * @param {string}   bahasa   - Misal: "Jawa"
 * @param {string}   level    - "Pemula" | "Mahir"
 * @param {string}   mode     - "pilihan" | "susun" | "nuansa"
 * @param {string[]} dipakai  - Daftar situasi yang sudah dipakai sesi ini (hindari duplikat)
 */
export async function fetchQuestion(bahasa, level, mode, dipakai = []) {
  const res = await fetch('/api/question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bahasa, level, mode, dipakai }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengambil soal');
  }
  return res.json();
}

/**
 * Kirim jawaban bebas untuk dievaluasi AI (Mode 3).
 * @param {string} situasi
 * @param {string} jawaban
 * @param {string} bahasa
 */
export async function evaluateAnswer(situasi, jawaban, bahasa) {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situasi, jawaban, bahasa }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengevaluasi jawaban');
  }
  return res.json();
}

/**
 * Kirim laporan soal yang dianggap keliru.
 */
export async function sendReport({ bahasa, situasi, opsiDilaporkan, alasan }) {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bahasa, situasi, opsiDilaporkan, alasan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengirim laporan');
  }
  return res.json();
}
