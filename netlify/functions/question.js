// Padanan Netlify dari server/src/routes/question.js (POST /api/question)
const llm  = require('../../server/src/services/llm');
const mock = require('../../server/src/services/mock');
const { postHandler } = require('../lib/http');

const BAHASA_VALID = ['indonesia', 'betawi', 'jawa', 'melayu', 'sunda', 'minang'];

exports.handler = postHandler(async ({ bahasa, level, mode, dipakai }) => {
  if (!bahasa || !level || !mode) {
    return { status: 400, body: { error: 'bahasa, level, dan mode wajib diisi' } };
  }
  if (!BAHASA_VALID.includes(String(bahasa).toLowerCase())) {
    return { status: 400, body: { error: `bahasa tidak dikenal. Pilih: ${BAHASA_VALID.join(', ')}` } };
  }
  if (!['Pemula', 'Mahir'].includes(level)) {
    return { status: 400, body: { error: 'level harus "Pemula" atau "Mahir"' } };
  }
  if (!['pilihan', 'susun', 'nuansa'].includes(mode)) {
    return { status: 400, body: { error: 'mode harus "pilihan", "susun", atau "nuansa"' } };
  }

  const situasiDipakai = Array.isArray(dipakai) ? dipakai : [];

  // Coba LLM — retry 1x jika gagal — fallback ke soal seed
  let soal = null;
  let usedFallback = false;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      soal = await llm.getQuestion({ bahasa, level, mode, situasiDipakai });
      break;
    } catch (err) {
      console.warn(`[question] percobaan ${attempt} gagal: ${err.message}`);
      if (attempt === 2) {
        try {
          soal = mock.getSoalAcak({ bahasa, level, situasiDipakai, mode });
          usedFallback = true;
        } catch (seedErr) {
          console.error('[question] fallback seed juga gagal:', seedErr.message);
          return { status: 500, body: { error: 'Gagal menghasilkan soal', fallback: true } };
        }
      }
    }
  }

  return { status: 200, body: usedFallback ? { ...soal, fallback: true } : soal };
});
