# LinguaDuel: AI Idiom Battle

## Ringkasan
Game bahasa interaktif. AI membuat situasi sehari-hari yang unik, lalu pemain memilih, menyusun, atau menulis ungkapan/peribahasa/gaul yang paling tepat sesuai konteks. AI memberi feedback soal nuansa (formal/santai, sopan/kasar, keaslian ungkapan).

## Masalah yang diselesaikan
Anak muda sering tahu arti kata daerah tetapi tidak paham kapan dan kepada siapa kata itu pantas dipakai. Aplikasi belajar bahasa umumnya hanya mengajarkan kosakata, bukan konteks dan nuansa.

## Bahasa yang didukung (dibatasi)
Indonesia, Betawi, Jawa, Melayu, Sunda, Minang.

## Mode permainan (MVP)
1. **Pilihan Situasi**: AI beri situasi, pemain pilih 1 dari 4 ungkapan.
2. **Susun Kalimat**: drag-and-drop kata menjadi kalimat/peribahasa.
3. **Duel Nuansa**: pemain menulis bebas, AI menilai skor 0-100 dengan alasan.

Fitur pendukung: skor, streak, level (Pemula/Mahir), "Kartu Budaya" (asal-usul ungkapan setelah tiap ronde), tombol "Laporkan jawaban keliru".

## Tech stack
- Frontend: React + Vite, Tailwind CSS, dnd-kit (drag-and-drop)
- Backend: Node.js + Express sebagai proxy ke API LLM (API key tidak boleh ada di browser)
- Penyimpanan: localStorage (skor, streak, progres)
- Test: Vitest (frontend), Jest/Supertest atau Vitest (backend)

## Struktur folder target
```
linguaduel/
  client/            # React + Vite
    src/components/  # LanguagePicker, SituationCard, OptionList, WordDnD, FeedbackPanel, ScoreBar
    src/pages/       # Home, Play, Result
    src/lib/         # api.js, storage.js, scoring.js
  server/
    src/routes/      # /api/question, /api/evaluate, /api/report
    src/services/    # llm.js (adapter, bisa diganti), mock.js
    src/prompts/     # question.js, evaluate.js
    data/seed/       # soal seed per bahasa (divalidasi manual)
  PROJECT_BRIEF.md
  BOB_PROMPTS.md
  BOB_LOG.md
  README.md
```

## Aturan teknis (wajib diikuti)
- Respons AI selalu JSON valid dengan skema tetap; validasi di server dan tangani JSON rusak (retry 1x, lalu fallback ke soal seed).
- Sediakan MOCK_MODE=true di .env agar game tetap jalan tanpa API key (penting untuk demo).
- API key hanya di `server/.env`, jangan di-commit; sediakan `.env.example`.
- Layer LLM dibuat sebagai adapter di `services/llm.js` agar penyedia model mudah diganti.
- Semua teks UI dalam Bahasa Indonesia.
- Kode ringkas, berkomentar seperlunya, dan mudah dijelaskan saat demo.

## Skema JSON soal
```json
{
  "bahasa": "Jawa",
  "level": "Pemula",
  "situasi": "string",
  "opsi": ["string", "string", "string", "string"],
  "benar": 0,
  "penjelasan": "string",
  "catatan_budaya": "string",
  "keyakinan": 0.0
}
```

## Skema JSON evaluasi
```json
{
  "skor": 0,
  "rincian": { "konteks": 0, "kesopanan": 0, "keaslian": 0 },
  "feedback": "string (maks 2 kalimat)",
  "alternatif": "string",
  "keyakinan": 0.0
}
```

## Definisi selesai (Definition of Done)
- 3 mode berjalan untuk 6 bahasa.
- Minimal 10 soal seed per bahasa.
- Tes dasar lulus, README berisi cara menjalankan.
- BOB_LOG.md terisi untuk setiap tahap, lengkap dengan tangkapan layar.
