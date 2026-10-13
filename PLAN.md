# PLAN.md — Rencana Implementasi LinguaDuel

## Ringkasan

LinguaDuel adalah game bahasa interaktif berbasis web yang mengajarkan **nuansa penggunaan** ungkapan/peribahasa/gaul dalam 6 bahasa (Indonesia, Betawi, Jawa, Melayu, Sunda, Minang). Pemain menghadapi situasi sehari-hari dan memilih, menyusun, atau menulis ungkapan yang paling tepat; AI memberi feedback kontekstual.

**Pendekatan:** Frontend React + Vite, backend Express sebagai proxy LLM, localStorage untuk persistensi ringan, dnd-kit untuk drag-and-drop, MOCK_MODE agar game jalan tanpa API key.

---

## 1. Struktur Folder Final

```
linguaduel/
├── client/                        # React + Vite SPA
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx               # Entry point
│   │   ├── App.jsx                # Router utama
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Pilih bahasa, level, mode
│   │   │   ├── Play.jsx           # Orchestrator sesi bermain
│   │   │   └── Result.jsx         # Ringkasan skor akhir
│   │   ├── components/
│   │   │   ├── LanguagePicker.jsx # Pilih 1 dari 6 bahasa
│   │   │   ├── SituationCard.jsx  # Kartu deskripsi situasi
│   │   │   ├── OptionList.jsx     # Mode 1: 4 pilihan ganda
│   │   │   ├── WordDnD.jsx        # Mode 2: drag-and-drop kata
│   │   │   ├── FreeInput.jsx      # Mode 3: textarea bebas
│   │   │   ├── FeedbackPanel.jsx  # Penjelasan + Kartu Budaya
│   │   │   ├── ScoreBar.jsx       # Skor + streak + level badge
│   │   │   └── ReportButton.jsx   # Tombol laporkan jawaban keliru
│   │   ├── lib/
│   │   │   ├── api.js             # fetch wrapper ke server
│   │   │   ├── storage.js         # get/set localStorage
│   │   │   └── scoring.js         # kalkulasi skor & streak lokal
│   │   └── styles/
│   │       └── index.css          # Tailwind base/components/utilities
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js               # Express app + listen
│   │   ├── routes/
│   │   │   ├── question.js        # POST /api/question
│   │   │   ├── evaluate.js        # POST /api/evaluate
│   │   │   └── report.js          # POST /api/report
│   │   ├── services/
│   │   │   ├── llm.js             # Adapter LLM (ganti penyedia di sini)
│   │   │   └── mock.js            # Implementasi mock dari data/seed
│   │   └── prompts/
│   │       ├── question.js        # Template prompt pembuatan soal
│   │       └── evaluate.js        # Template prompt evaluasi jawaban
│   └── data/
│       └── seed/
│           ├── indonesia.json
│           ├── betawi.json        # ⚠ perlu verifikasi penutur asli
│           ├── jawa.json
│           ├── melayu.json
│           ├── sunda.json
│           └── minang.json        # ⚠ perlu verifikasi penutur asli
├── PROJECT_BRIEF.md
├── BOB_PROMPTS.md
├── BOB_LOG.md
├── PLAN.md
└── README.md
```

**Catatan implementasi awal:** `services/llm.js` mengimplementasikan mock (MOCK_MODE selalu aktif) terlebih dahulu. Adapter LLM nyata ditambahkan di iterasi berikutnya tanpa mengubah interface.

**Alasan struktur:**
- `client/` dan `server/` dipisah agar bisa di-deploy independen dan API key tidak bocor ke browser.
- `services/llm.js` sebagai adapter memungkinkan penggantian penyedia LLM (OpenAI → Gemini, dsb.) tanpa menyentuh route.
- `data/seed/` di server — bukan di client — agar soal seed tidak bisa di-scrape dari bundle frontend.
- `lib/` di client berisi utilitas murni (non-UI) yang mudah di-unit-test.
- `prompts/` dipisah dari route agar prompt bisa diiterasi tanpa mengubah logika bisnis.

---

## 2. Komponen React

### `LanguagePicker`
| Props | State | Keterangan |
|---|---|---|
| `selected: string` | — | Bahasa yang sedang aktif |
| `onChange(lang): void` | — | Callback ke parent |

### `SituationCard`
| Props | State | Keterangan |
|---|---|---|
| `situasi: string` | — | Teks situasi dari AI/seed |
| `bahasa: string` | — | Label bahasa (badge) |
| `level: string` | — | Label level (badge) |

### `OptionList` *(Mode 1)*
| Props | State | Keterangan |
|---|---|---|
| `opsi: string[]` | `pilihan: number\|null` | 4 pilihan ganda |
| `onSubmit(idx): void` | `submitted: boolean` | Highlight benar/salah setelah submit |
| `disabled: boolean` | — | Lock setelah dijawab |

### `WordDnD` *(Mode 2)*
| Props | State | Keterangan |
|---|---|---|
| `kata: string[]` | `urutan: string[]` | Kata-kata acak awal |
| `onSubmit(jawaban): void` | `area: string[]` | Kata yang sudah disusun di area jawaban |
| — | — | Gunakan dnd-kit DndContext + SortableContext |

### `FreeInput` *(Mode 3)*
| Props | State | Keterangan |
|---|---|---|
| `onSubmit(teks): void` | `teks: string` | Textarea bebas |
| `loading: boolean` | — | Disable tombol saat menunggu AI |

### `FeedbackPanel`
| Props | State | Keterangan |
|---|---|---|
| `penjelasan: string` | `showBudaya: boolean` | Toggle Kartu Budaya |
| `catatan_budaya: string` | — | Muncul setelah klik tombol |
| `evaluasi?: object` | — | Opsional untuk Mode 3 (skor rinci) |
| `mode: 'pilihan'\|'susun'\|'nuansa'` | — | Menentukan tampilan feedback |

### `ScoreBar`
| Props | State | Keterangan |
|---|---|---|
| `skor: number` | — | Total skor dari localStorage |
| `streak: number` | — | Streak dari localStorage |
| `level: string` | — | 'Pemula' atau 'Mahir' |

### `ReportButton`
| Props | State | Keterangan |
|---|---|---|
| `soalId: string` | `status: 'idle'\|'loading'\|'sent'\|'error'` | State pengiriman laporan |
| `jawaban: string` | — | Jawaban yang dilaporkan |

### `Play` *(halaman/orchestrator)*
| State lokal | Keterangan |
|---|---|
| `soal: object\|null` | Data soal aktif |
| `fase: 'main'\|'feedback'` | Menentukan tampilan |
| `loading: boolean` | Saat fetch soal baru |
| `error: string\|null` | Tampil jika fetch gagal |
| `mode: string` | Dari URL params atau props |

---

## 3. Endpoint API

### `POST /api/question`
**Request:**
```json
{ "bahasa": "Jawa", "level": "Pemula", "mode": "pilihan" }
```
**Response (sukses):**
```json
{
  "bahasa": "Jawa",
  "level": "Pemula",
  "situasi": "...",
  "opsi": ["...", "...", "...", "..."],
  "benar": 0,
  "penjelasan": "...",
  "catatan_budaya": "...",
  "keyakinan": 0.85
}
```
**Response (error):**
```json
{ "error": "Gagal menghasilkan soal", "fallback": true }
```
**Catatan:** Jika AI gagal atau JSON rusak → retry 1x → fallback ke soal seed acak dari `data/seed/{bahasa}.json`. Field `mode` menentukan apakah field `opsi`/`benar` diisi (pilihan, susun) atau dikosongkan (nuansa).

---

### `POST /api/evaluate`
**Request:**
```json
{ "situasi": "...", "jawaban": "Ojo dumeh", "bahasa": "Jawa" }
```
**Response (sukses):**
```json
{
  "skor": 82,
  "rincian": { "konteks": 90, "kesopanan": 80, "keaslian": 75 },
  "feedback": "Ungkapan tepat untuk situasi ini. Namun sedikit bernuansa menggurui.",
  "alternatif": "Alon-alon asal kelakon",
  "keyakinan": 0.78
}
```
**Catatan:** Dipakai eksklusif oleh Mode 3 (Duel Nuansa). Validasi: `jawaban` tidak boleh kosong.

---

### `POST /api/report`
**Request:**
```json
{
  "bahasa": "Betawi",
  "situasi": "...",
  "opsiDilaporkan": "Gue kagak mau",
  "alasan": "Ungkapan ini kurang pas"
}
```
**Response:**
```json
{ "ok": true, "pesan": "Laporan diterima, terima kasih." }
```
**Catatan:** Laporan disimpan ke file `server/data/reports.json` (append ke array JSON: baca file → parse → push → tulis ulang). Tidak perlu database untuk MVP.

---

## 4. Urutan Pengerjaan 5 Hari

### Hari 1 — Fondasi & Scaffold
**Kriteria selesai:**
- Folder `client/` dan `server/` terbentuk dengan dependensi terinstal.
- `npm run dev` (dari root) menjalankan client (port 5173) dan server (port 3001) sekaligus.
- Halaman `Home` tampil dengan `LanguagePicker` (6 bahasa) dan pemilih level.
- File `.env.example`, `.gitignore`, dan `README.md` tersedia.
- MOCK_MODE=true berfungsi (server merespons tanpa API key).

**Lingkup:**
- Scaffold client: Vite + React + Tailwind + dnd-kit
- Scaffold server: Express + dotenv + cors
- Struktur folder lengkap (file kosong/placeholder boleh)
- `concurrently` di root `package.json`
- `services/mock.js` dan 10 soal seed per bahasa (60 soal total)

---

### Hari 2 — Backend & Rekayasa Prompt
**Kriteria selesai:**
- Ketiga endpoint (`/api/question`, `/api/evaluate`, `/api/report`) merespons dengan benar di Postman/curl.
- Validasi JSON AI + retry + fallback seed berjalan (bisa diuji dengan MOCK_MODE=false + API key yang sengaja salah).
- Prompt tersimpan di `prompts/question.js` dan `prompts/evaluate.js`.
- Laporan tersimpan ke `data/reports.json`.

**Lingkup:**
- Implementasi `services/llm.js` (adapter ke OpenAI atau setara)
- Implementasi ketiga route
- Skema validasi JSON (Zod atau validasi manual)
- Logika retry + fallback

---

### Hari 3 — Mode Pilihan Situasi (Mode 1)
**Kriteria selesai:**
- Pemain bisa memilih jawaban dari 4 opsi, mendapat feedback benar/salah, melihat Kartu Budaya.
- Skor dan streak tersimpan di localStorage dan tampil di `ScoreBar`.
- Tombol "Laporkan jawaban keliru" mengirim ke `/api/report`.
- Animasi sederhana benar (hijau) / salah (merah) berfungsi.
- Tampilan responsif di mobile (≤ 375px).

**Lingkup:**
- Halaman `Play` + komponen `SituationCard`, `OptionList`, `FeedbackPanel`, `ScoreBar`, `ReportButton`
- `lib/storage.js` dan `lib/scoring.js`
- `lib/api.js` dengan fetch ke `/api/question`
- Routing Home → Play → Result

---

### Hari 4 — Mode Duel Nuansa (Mode 3) + Mode Susun Kalimat (Mode 2)
**Kriteria selesai:**
- Mode Duel Nuansa: pemain mengetik jawaban, menerima skor 0-100 + rincian + feedback + alternatif.
- Mode Susun Kalimat: kata-kata bisa diseret/dilepas ke area jawaban, bekerja di layar sentuh.
- State loading dan error ditangani di semua mode.
- Halaman `Result` menampilkan ringkasan skor sesi + **riwayat jawaban per soal** (situasi, pilihan pemain, benar/salah).

**Lingkup:**
- Komponen `FreeInput` + integrasi `/api/evaluate`
- Komponen `WordDnD` dengan dnd-kit
- Update `FeedbackPanel` untuk menampilkan rincian evaluasi Mode 3
- Halaman `Result`

---

### Hari 5 — Pengujian, Review & Dokumentasi
**Kriteria selesai:**
- Unit test lulus untuk: validasi JSON AI, logika skor/streak, fallback seed, jawaban kosong di Mode 3.
- `npm test` (client + server) hijau tanpa error.
- `README.md` berisi cara instal, cara menjalankan (MOCK_MODE), dan daftar variabel env.
- `BOB_LOG.md` terisi untuk semua tahap.
- Tidak ada API key di kode atau Git history.

**Lingkup:**
- Vitest untuk `lib/scoring.js`, `lib/storage.js`
- Vitest/Jest + Supertest untuk route server dan validasi JSON
- Code review: keamanan CORS, input sanitasi, tidak ada secret hardcoded
- `TODO.md` untuk item yang ditunda

---

## 5. Risiko Teknis & Mitigasi

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| 1 | **AI menghasilkan JSON tidak valid** | Soal tidak bisa ditampilkan | Validasi skema di server; retry 1x; fallback ke soal seed. |
| 2 | **Akurasi bahasa daerah rendah** (terutama Betawi, Minang) | Konten salah/menyesatkan | Tandai soal AI sebagai `"perlu_verifikasi": true`; seed manual divalidasi manusia; `ReportButton` sebagai safety net komunitas. |
| 3 | **API key bocor ke frontend** | Keamanan & biaya | API key hanya di `server/.env`; `.gitignore` wajib; tidak ada fetch LLM dari `client/`. |
| 4 | **dnd-kit tidak berfungsi di iOS Safari / layar sentuh** | Mode Susun Kalimat tidak bisa dipakai | Uji di iOS sedini mungkin (Hari 4); gunakan sensor pointer dnd-kit yang mendukung touch. |
| 5 | **Latency AI tinggi (> 5 detik)** | UX buruk | Tampilkan skeleton/spinner; batasi timeout 10 detik di server; MOCK_MODE untuk demo tanpa latensi. |
| 6 | **Soal seed kurang variatif** | Pemain cepat bosan saat MOCK_MODE | Buat minimal 10 soal per bahasa dengan variasi situasi (kerja, keluarga, teman, pasar); acak urutan. |
| 7 | **Kompleksitas dnd-kit di Mode 2** melebihi estimasi | Hari 4 terlambat | Implementasi `WordDnD` di Hari 4 bisa disederhanakan dulu (click-to-place) jika drag belum siap, lalu ditingkatkan. |
| 8 | **State skor korup di localStorage** | Progress pemain hilang/salah | Validasi saat baca (`storage.js`); sediakan fungsi reset di UI. |

---

## Sub-Tasks untuk Implementasi

### Sub-Task 1 — Scaffold & Fondasi [x] selesai
**Intent:** Membuat kerangka proyek yang langsung bisa dijalankan dengan MOCK_MODE.
**Expected Outcomes:** `npm run dev` berjalan, halaman Home tampil, 60 soal seed tersedia.
**Todo:**
- [x] Init `client/` dengan Vite + React + Tailwind + dnd-kit
- [x] Init `server/` dengan Express + dotenv + cors
- [x] Tambah `concurrently` di root `package.json`
- [x] Buat `.env.example` dan `.gitignore`
- [x] Buat 10 soal seed per bahasa (60 total) di `data/seed/`
- [x] Implementasi `services/mock.js` (ambil soal acak dari seed)
- [x] Buat halaman `Home` dengan `LanguagePicker` dan pemilih level
**Status:** [x] selesai

### Sub-Task 2 — Backend & Prompt AI [ ] pending
**Intent:** Server siap dipakai sebagai proxy LLM dengan fallback yang robust.
**Expected Outcomes:** Ketiga endpoint merespons benar; retry + fallback teruji.
**Todo:**
- [ ] Implementasi `services/llm.js` (adapter OpenAI/setara)
- [ ] Buat `prompts/question.js` dan `prompts/evaluate.js`
- [ ] Implementasi route `/api/question` dengan validasi + retry + fallback
- [ ] Implementasi route `/api/evaluate`
- [ ] Implementasi route `/api/report` (simpan ke `data/reports.json`)
**Status:** [ ] pending

### Sub-Task 3 — Mode Pilihan Situasi [ ] pending
**Intent:** Mode 1 fully playable end-to-end.
**Expected Outcomes:** Pemain bisa bermain Mode 1, skor tersimpan, laporan bisa dikirim.
**Todo:**
- [ ] Buat `lib/api.js`, `lib/storage.js`, `lib/scoring.js`
- [ ] Buat komponen `SituationCard`, `OptionList`, `FeedbackPanel`, `ScoreBar`, `ReportButton`
- [ ] Buat halaman `Play` (orchestrator) dan `Result`
- [ ] Tambah routing React Router: Home → Play → Result
- [ ] Animasi benar/salah + Kartu Budaya toggle
**Status:** [ ] pending

### Sub-Task 4 — Mode Duel Nuansa & Susun Kalimat [ ] pending
**Intent:** Melengkapi dua mode permainan tersisa.
**Expected Outcomes:** Mode 2 dan 3 fully playable; loading/error state ditangani.
**Todo:**
- [ ] Buat komponen `FreeInput` + integrasi `/api/evaluate`
- [ ] Update `FeedbackPanel` untuk rincian evaluasi (skor rinci Mode 3)
- [ ] Buat komponen `WordDnD` dengan dnd-kit (touch support)
- [ ] Uji dnd-kit di layar sentuh
**Status:** [ ] pending

### Sub-Task 5 — Pengujian, Review & Dokumentasi [ ] pending
**Intent:** Memastikan kualitas dan kelengkapan proyek sebelum demo.
**Expected Outcomes:** Semua test hijau, README lengkap, BOB_LOG.md terisi.
**Todo:**
- [ ] Unit test `lib/scoring.js` dan `lib/storage.js` (Vitest)
- [ ] Unit test validasi JSON AI + fallback (Vitest/Jest + Supertest)
- [ ] Test jawaban kosong Mode 3
- [ ] Code review: CORS, secret hardcoded, input sanitasi
- [ ] Tulis `README.md`
- [ ] Isi `BOB_LOG.md`
- [ ] Buat `TODO.md` untuk item yang ditunda
**Status:** [ ] pending
