// Padanan Netlify dari server/src/routes/report.js (POST /api/report)
// Filesystem Netlify Functions bersifat read-only/ephemeral, jadi laporan dicatat
// ke log function (Netlify dashboard → Logs → Functions) alih-alih reports.json.
const { postHandler } = require('../lib/http');

exports.handler = postHandler(async ({ bahasa, situasi, opsiDilaporkan, alasan }) => {
  if (!bahasa || !situasi || !opsiDilaporkan) {
    return { status: 400, body: { error: 'bahasa, situasi, dan opsiDilaporkan wajib diisi' } };
  }

  console.log('[report]', JSON.stringify({
    timestamp: new Date().toISOString(),
    bahasa,
    situasi,
    opsiDilaporkan,
    alasan: alasan || '',
  }));

  return { status: 200, body: { ok: true, pesan: 'Laporan diterima, terima kasih.' } };
});
