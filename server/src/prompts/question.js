/**
 * Template prompt untuk pembuatan soal bahasa daerah.
 * Digunakan oleh services/llm.js saat MOCK_MODE=false.
 */

/**
 * Bangun teks prompt pembuatan soal untuk dikirim ke LLM.
 *
 * @param {object} params
 * @param {string} params.bahasa  - Nama bahasa (misal: "Jawa")
 * @param {string} params.level   - "Pemula" atau "Mahir"
 * @param {string} params.mode    - "pilihan" | "susun" | "nuansa"
 * @returns {string} Teks prompt
 */
function buildQuestionPrompt({ bahasa, level, mode }) {
  // Petunjuk khusus per mode
  const modeHint = {
    pilihan:
      'Sertakan array "opsi" berisi tepat 4 ungkapan/pilihan jawaban dan "benar" (index 0-3) menunjuk jawaban yang paling tepat.',
    susun:
      'Sertakan array "opsi" berisi kata-kata yang harus disusun menjadi ungkapan/peribahasa yang benar, dan "benar" sebagai index 0 (urutan pertama selalu benar). Acak urutan kata dalam "opsi".',
    nuansa:
      'Kosongkan array "opsi" menjadi [] dan set "benar" ke -1 karena pemain akan menulis jawaban bebas.',
  }[mode] || '';

  return `Kamu adalah ahli bahasa ${bahasa} yang berpengalaman mengajar nuansa ungkapan, peribahasa, dan bahasa gaul daerah.

Buat SATU soal interaktif untuk pemain dengan kriteria:
- Bahasa: ${bahasa}
- Level: ${level} (${level === 'Pemula' ? 'situasi sehari-hari sederhana, kosakata umum' : 'situasi kompleks, nuansa budaya mendalam'})
- Mode: ${mode}
${modeHint}

Situasi harus nyata dan dekat dengan kehidupan (kerja, keluarga, teman, pasar, dsb.).
Penjelasan harus mengajarkan kapan dan kepada siapa ungkapan itu pantas dipakai.
Catatan budaya harus informatif dan singkat (1-2 kalimat).

Kembalikan HANYA JSON valid berikut — tanpa komentar, tanpa markdown, tanpa teks lain:
{
  "bahasa": "${bahasa}",
  "level": "${level}",
  "situasi": "<deskripsi situasi dalam bahasa ${bahasa} atau Indonesia, maks 3 kalimat>",
  "opsi": ["<opsi1>","<opsi2>","<opsi3>","<opsi4>"],
  "benar": <0|1|2|3>,
  "penjelasan": "<penjelasan mengapa jawaban tersebut paling tepat, maks 3 kalimat>",
  "catatan_budaya": "<asal-usul atau konteks budaya ungkapan, maks 2 kalimat>",
  "keyakinan": <0.0-1.0>
}`;
}

module.exports = { buildQuestionPrompt };
