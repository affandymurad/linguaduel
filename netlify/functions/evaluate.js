// Padanan Netlify dari server/src/routes/evaluate.js (POST /api/evaluate)
const llm = require('../../server/src/services/llm');
const { postHandler } = require('../lib/http');

exports.handler = postHandler(async ({ situasi, jawaban, bahasa }) => {
  if (!situasi || !bahasa) {
    return { status: 400, body: { error: 'situasi dan bahasa wajib diisi' } };
  }
  if (!jawaban || typeof jawaban !== 'string' || !jawaban.trim()) {
    return { status: 400, body: { error: 'Jawaban tidak boleh kosong' } };
  }

  // Retry 1x jika gagal (tidak ada seed fallback untuk evaluasi bebas)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const hasil = await llm.evaluate({ situasi, jawaban, bahasa });
      return { status: 200, body: hasil };
    } catch (err) {
      console.warn(`[evaluate] percobaan ${attempt} gagal: ${err.message}`);
    }
  }

  console.error('[evaluate] semua percobaan gagal');
  return { status: 500, body: { error: 'Gagal mengevaluasi jawaban' } };
});
