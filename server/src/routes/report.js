const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const REPORTS_FILE = path.join(__dirname, '../../data/reports.json');

// POST /api/report
router.post('/', (req, res) => {
  const { bahasa, situasi, opsiDilaporkan, alasan } = req.body;

  if (!bahasa || !situasi || !opsiDilaporkan) {
    return res.status(400).json({ error: 'bahasa, situasi, dan opsiDilaporkan wajib diisi' });
  }

  // Baca laporan yang sudah ada, atau mulai array kosong
  let laporan = [];
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      laporan = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'));
    }
  } catch {
    laporan = [];
  }

  laporan.push({
    timestamp: new Date().toISOString(),
    bahasa,
    situasi,
    opsiDilaporkan,
    alasan: alasan || '',
  });

  // Pastikan folder data/ ada
  fs.mkdirSync(path.dirname(REPORTS_FILE), { recursive: true });
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(laporan, null, 2), 'utf-8');

  res.json({ ok: true, pesan: 'Laporan diterima, terima kasih.' });
});

module.exports = router;
