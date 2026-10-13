const express = require('express');
const router  = express.Router();
const llm     = require('../services/llm');
const mock    = require('../services/mock');

const BAHASA_VALID = ['indonesia', 'betawi', 'jawa', 'melayu', 'sunda', 'minang'];

// POST /api/question
router.post('/', async (req, res) => {
  const { bahasa, level, mode, dipakai } = req.body;

  // Validasi input
  if (!bahasa || !level || !mode) {
    return res.status(400).json({ error: 'bahasa, level, dan mode wajib diisi' });
  }
  if (!BAHASA_VALID.includes(bahasa.toLowerCase())) {
    return res.status(400).json({ error: `bahasa tidak dikenal. Pilih: ${BAHASA_VALID.join(', ')}` });
  }
  if (!['Pemula', 'Mahir'].includes(level)) {
    return res.status(400).json({ error: 'level harus "Pemula" atau "Mahir"' });
  }
  if (!['pilihan', 'susun', 'nuansa'].includes(mode)) {
    return res.status(400).json({ error: 'mode harus "pilihan", "susun", atau "nuansa"' });
  }

  // Daftar situasi yang sudah dipakai sesi ini (untuk deduplication)
  const situasiDipakai = Array.isArray(dipakai) ? dipakai : [];

  // Coba LLM — retry 1x jika gagal — fallback ke soal seed
  let soal = null;
  let usedFallback = false;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      soal = await llm.getQuestion({ bahasa, level, mode, situasiDipakai });
      break; // berhasil
    } catch (err) {
      console.warn(`[question] percobaan ${attempt} gagal: ${err.message}`);
      if (attempt === 2) {
        // Setelah 2 kali gagal, gunakan soal seed
        try {
          soal = mock.getSoalAcak({ bahasa, level, situasiDipakai, mode });
          usedFallback = true;
        } catch (seedErr) {
          console.error('[question] fallback seed juga gagal:', seedErr.message);
          return res.status(500).json({ error: 'Gagal menghasilkan soal', fallback: true });
        }
      }
    }
  }

  if (usedFallback) {
    soal = { ...soal, fallback: true };
  }

  res.json(soal);
});

module.exports = router;
