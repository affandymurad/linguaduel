# TODO.md — Backlog LinguaDuel

Item-item di bawah adalah hasil code review Sub-Task 5 yang dinilai **berisiko sedang–tinggi** untuk
diubah sekarang (memerlukan lebih banyak pengujian, perubahan kontrak API, atau dependensi baru),
sehingga ditunda ke iterasi berikutnya.

---

## Keamanan

### CORS — batasi origin lebih ketat di production
- **File:** `server/src/index.js`
- **Status saat ini:** `CORS_ORIGIN` default ke `http://localhost:5173`. Untuk production harus
  diisi lewat environment variable (misal di `.env.production`).
- **Aksi:** Tambahkan dokumentasi ke `.env.example` tentang `CORS_ORIGIN`. Pastikan deployment
  pipeline mengisi variabel ini sebelum go-live.

### Rate limiting endpoint API
- **File:** `server/src/index.js` (semua route)
- **Masalah:** Tidak ada batas frekuensi permintaan. Endpoint `/api/evaluate` khususnya rentan
  terhadap penyalahgunaan biaya LLM (setiap request bisa memanggil OpenAI).
- **Aksi:** Tambahkan `express-rate-limit` (misal 30 request / menit per IP).
- **Paket:** `npm install express-rate-limit`

### Input sanitasi — panjang maksimum field teks
- **File:** `server/src/routes/evaluate.js`, `server/src/routes/report.js`
- **Masalah:** Field `jawaban`, `situasi`, dan `alasan` diterima tanpa batas panjang karakter.
  Body request sudah dibatasi 10 kB, tetapi string panjang bisa membebani LLM prompt.
- **Aksi:** Tambahkan validasi panjang maksimum (misal `jawaban.length <= 500`).

### HTTPS
- **Masalah:** Tidak ada konfigurasi HTTPS untuk production deployment.
- **Aksi:** Tangani di layer reverse proxy (Nginx / Caddy / Render.com built-in TLS).

---

## Duplikasi Kode

### Pola retry LLM duplikat di dua route
- **File:** `server/src/routes/question.js` dan `server/src/routes/evaluate.js`
- **Masalah:** Kedua file mengimplementasikan loop `for (let attempt = 1; attempt <= 2; attempt++)`
  yang hampir identik.
- **Aksi:** Ekstrak ke helper `retryLLM(fn, maxAttempts)` di `services/llm.js` atau
  `utils/retry.js` agar tidak ada duplikasi.

---

## Persistensi & Data

### `reports.json` — penulisan file sinkron & tidak thread-safe
- **File:** `server/src/routes/report.js`
- **Masalah:** Menggunakan `fs.readFileSync` + `fs.writeFileSync` secara sinkron. Pada beban
  tinggi, dua request bersamaan bisa menyebabkan race condition (data laporan hilang).
- **Aksi:** Gunakan operasi async (`fs.promises`) + antrian tulis sederhana (atau SQLite untuk
  skala yang lebih besar).

---

## Aksesibilitas

### WordDnD — drag keyboard masih belum bisa dipakai sepenuhnya
- **File:** `client/src/components/WordDnD.jsx`
- **Status:** Tap/klik dan Enter/Spasi sudah berfungsi. Namun drag-and-drop via keyboard
  (menggunakan `KeyboardSensor` dari dnd-kit) belum diaktifkan.
- **Aksi:** Tambahkan `KeyboardSensor` ke `useSensors()` agar pemain bisa me-reorder kata di
  Area Jawaban menggunakan keyboard tanpa mouse/sentuh.

### Atribut `aria-label` pada chip kata
- **File:** `client/src/components/WordDnD.jsx`
- **Masalah:** Chip kata di Area Jawaban (`SortableWord`) menggunakan `role="button"` tetapi
  tidak memiliki `aria-label` yang deskriptif (screen reader hanya membaca teks kata).
- **Aksi:** Tambahkan `aria-label={`Hapus kata ${item.teks} dari jawaban`}` pada `SortableWord`.

---

## Testing

### End-to-end test (Playwright / Cypress)
- Belum ada test UI otomatis untuk alur bermain penuh (Home → Play → Result).
- **Aksi:** Tambahkan minimal 1 skenario happy-path di setiap mode menggunakan Playwright.

### Test coverage report
- **Aksi:** Tambahkan `--coverage` ke script vitest dan jest agar coverage bisa dipantau.

---

*Dibuat: Sub-Task 5 — Terakhir diperbarui saat kode review selesai.*
