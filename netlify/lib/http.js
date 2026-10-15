/**
 * Helper kecil untuk Netlify Functions (padanan req/res Express).
 * Logika bisnis tetap memakai server/src/services dan server/src/prompts.
 */

const HEADERS = { 'Content-Type': 'application/json' };

function json(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

/**
 * Bungkus handler: hanya terima POST, parse JSON body (maks 10kb seperti Express),
 * dan tangkap error tak terduga.
 * `fn(body)` mengembalikan { status, body }.
 */
function postHandler(fn) {
  return async (event) => {
    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Method not allowed' });
    }
    if (Buffer.byteLength(event.body || '') > 10 * 1024) {
      return json(413, { error: 'Payload terlalu besar' });
    }

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Body bukan JSON valid' });
    }

    try {
      const { status, body: out } = await fn(body || {});
      return json(status, out);
    } catch (err) {
      console.error('[function] error tak terduga:', err);
      return json(500, { error: 'Terjadi kesalahan pada server' });
    }
  };
}

module.exports = { json, postHandler };
