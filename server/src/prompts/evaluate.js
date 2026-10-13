/**
 * Template prompt untuk evaluasi jawaban bebas (Mode 3 — Duel Nuansa).
 * Digunakan oleh services/llm.js saat MOCK_MODE=false.
 */

/**
 * Bangun teks prompt evaluasi untuk dikirim ke LLM.
 *
 * @param {object} params
 * @param {string} params.situasi  - Deskripsi situasi yang diberikan ke pemain
 * @param {string} params.jawaban  - Jawaban bebas yang ditulis pemain
 * @param {string} params.bahasa   - Nama bahasa (misal: "Jawa")
 * @returns {string} Teks prompt
 */
function buildEvaluatePrompt({ situasi, jawaban, bahasa }) {
  return `Kamu adalah ahli bahasa ${bahasa} yang menilai ketepatan penggunaan ungkapan dan peribahasa dalam konteks sehari-hari.

Situasi yang diberikan kepada pemain:
"${situasi}"

Jawaban pemain:
"${jawaban}"

Evaluasi jawaban tersebut berdasarkan tiga dimensi:
1. konteks (0-100): seberapa tepat ungkapan dipakai dalam situasi ini
2. kesopanan (0-100): apakah register bahasa (formal/kasual/sopan/kasar) sesuai
3. keaslian (0-100): seberapa autentik ungkapan dalam bahasa ${bahasa} (bukan terjemahan harfiah)

Skor akhir = rata-rata ketiga dimensi (0-100).
Feedback harus konkret dan edukatif, maks 2 kalimat.
Alternatif boleh kosong ("") jika jawaban sudah sangat baik (skor ≥ 90).

Kembalikan HANYA JSON valid berikut — tanpa komentar, tanpa markdown, tanpa teks lain:
{
  "skor": <0-100>,
  "rincian": { "konteks": <0-100>, "kesopanan": <0-100>, "keaslian": <0-100> },
  "feedback": "<penjelasan singkat, maks 2 kalimat>",
  "alternatif": "<ungkapan alternatif yang lebih baik, atau string kosong jika tidak perlu>",
  "keyakinan": <0.0-1.0>
}`;
}

module.exports = { buildEvaluatePrompt };
