const express = require('express');
const router  = express.Router();
const llm     = require('../services/llm');

// POST /api/evaluate
router.post('/', async (req, res) => {
  const { situasi, jawaban, bahasa } = req.body;

  // Validasi input
  if (!situasi || !bahasa) {
    return res.status(400).json({ error: 'situasi dan bahasa wajib diisi' });
  }
  if (!jawaban || !jawaban.trim()) {
    return res.status(400).json({ error: 'Jawaban tidak boleh kosong' });
  }

  // Coba LLM — retry 1x jika gagal (tidak ada seed fallback untuk evaluasi bebas)
  let hasil = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      hasil = await llm.evaluate({ situasi, jawaban, bahasa });
      break; // berhasil
    } catch (err) {
      console.warn(`[evaluate] percobaan ${attempt} gagal: ${err.message}`);
      if (attempt === 2) {
        console.error('[evaluate] semua percobaan gagal');
        return res.status(500).json({ error: 'Gagal mengevaluasi jawaban' });
      }
    }
  }

  res.json(hasil);
});

module.exports = router;
