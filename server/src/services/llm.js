/**
 * services/llm.js — Adapter LLM untuk LinguaDuel.
 *
 * MOCK_MODE=true  → langsung ke mock.js, tanpa HTTP ke LLM
 * MOCK_MODE=false → kirim prompt ke OpenAI-compatible API
 *
 * Untuk mengganti provider (Gemini, Anthropic, dsb.), ubah hanya fungsi
 * _callLLM() di bawah — interface getQuestion/evaluate tetap sama.
 *
 * Variabel .env yang relevan:
 *   LLM_API_KEY   — API key provider
 *   LLM_BASE_URL  — Base URL (default: https://api.openai.com/v1)
 *   LLM_MODEL     — Nama model (default: gpt-4o-mini)
 *   LLM_TIMEOUT   — Timeout ms (default: 10000)
 */

const mock                  = require('./mock');
const { buildQuestionPrompt } = require('../prompts/question');
const { buildEvaluatePrompt } = require('../prompts/evaluate');

// ---------------------------------------------------------------------------
// Skema validasi manual (tanpa Zod agar tidak perlu dependensi tambahan)
// ---------------------------------------------------------------------------

/**
 * Validasi skema soal yang dikembalikan LLM.
 * Melempar Error jika skema tidak sesuai.
 */
function validateQuestion(obj) {
  if (typeof obj !== 'object' || obj === null) throw new Error('Bukan objek');

  const { bahasa, level, situasi, opsi, benar, penjelasan, catatan_budaya } = obj;

  if (typeof bahasa !== 'string' || !bahasa.trim())
    throw new Error('Field "bahasa" harus string non-kosong');
  if (typeof level !== 'string' || !level.trim())
    throw new Error('Field "level" harus string non-kosong');
  if (typeof situasi !== 'string' || !situasi.trim())
    throw new Error('Field "situasi" harus string non-kosong');
  if (!Array.isArray(opsi))
    throw new Error('Field "opsi" harus array');
  // nuansa mode boleh opsi kosong, pilihan/susun harus ada isi
  if (opsi.length !== 0 && opsi.length < 2)
    throw new Error('Field "opsi" harus memiliki minimal 2 item');
  if (typeof benar !== 'number')
    throw new Error('Field "benar" harus number');
  if (typeof penjelasan !== 'string' || !penjelasan.trim())
    throw new Error('Field "penjelasan" harus string non-kosong');
  if (typeof catatan_budaya !== 'string' || !catatan_budaya.trim())
    throw new Error('Field "catatan_budaya" harus string non-kosong');
}

/**
 * Validasi skema evaluasi yang dikembalikan LLM.
 * Melempar Error jika skema tidak sesuai.
 */
function validateEvaluasi(obj) {
  if (typeof obj !== 'object' || obj === null) throw new Error('Bukan objek');

  const { skor, rincian, feedback } = obj;

  if (typeof skor !== 'number' || skor < 0 || skor > 100)
    throw new Error('Field "skor" harus number 0-100');
  if (typeof rincian !== 'object' || rincian === null)
    throw new Error('Field "rincian" harus objek');
  for (const k of ['konteks', 'kesopanan', 'keaslian']) {
    if (typeof rincian[k] !== 'number')
      throw new Error(`Field "rincian.${k}" harus number`);
  }
  if (typeof feedback !== 'string' || !feedback.trim())
    throw new Error('Field "feedback" harus string non-kosong');
}

// ---------------------------------------------------------------------------
// Helper: ekstrak JSON dari teks LLM (kadang ada markdown code fence)
// ---------------------------------------------------------------------------
function extractJSON(text) {
  // Hapus markdown code fence jika ada: ```json ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.trim());
}

// ---------------------------------------------------------------------------
// HTTP call ke LLM (OpenAI-compatible)
// ---------------------------------------------------------------------------
async function _callLLM(prompt) {
  const apiKey  = process.env.LLM_API_KEY;
  const baseURL = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model   = process.env.LLM_MODEL || 'gpt-4o-mini';
  const timeout = parseInt(process.env.LLM_TIMEOUT || '10000', 10);

  if (!apiKey) throw new Error('LLM_API_KEY tidak diset di .env');

  // Node 18+ punya fetch bawaan; untuk versi lama tambahkan node-fetch
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }, // tersedia di GPT-4o / GPT-4o-mini
      }),
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`LLM HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('LLM mengembalikan respons kosong');
  return content;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Dapatkan satu soal dari LLM atau mock.
 * Tidak ada retry/fallback di sini — itu tanggung jawab route layer.
 */
async function getQuestion({ bahasa, level, mode, situasiDipakai = [] }) {
  if (process.env.MOCK_MODE === 'true') {
    return mock.getSoalAcak({ bahasa, level, mode, situasiDipakai });
  }

  const prompt = buildQuestionPrompt({ bahasa, level, mode });
  const raw    = await _callLLM(prompt);
  const obj    = extractJSON(raw);
  validateQuestion(obj);

  // Pastikan bahasa & level sesuai request (LLM kadang mengubahnya)
  obj.bahasa = bahasa;
  obj.level  = level;

  return obj;
}

/**
 * Evaluasi jawaban bebas dari pemain (Mode 3).
 * Tidak ada retry/fallback di sini — itu tanggung jawab route layer.
 */
async function evaluate({ situasi, jawaban, bahasa }) {
  if (process.env.MOCK_MODE === 'true') {
    return mock.evaluasiMock({ situasi, jawaban, bahasa });
  }

  const prompt = buildEvaluatePrompt({ situasi, jawaban, bahasa });
  const raw    = await _callLLM(prompt);
  const obj    = extractJSON(raw);
  validateEvaluasi(obj);

  return obj;
}

module.exports = { getQuestion, evaluate, validateQuestion, validateEvaluasi, extractJSON };
