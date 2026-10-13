# BOB_LOG: Bukti Pemanfaatan IBM Bob

Catatan setiap interaksi penting dengan IBM Bob selama membuat LinguaDuel. Tangkapan layar disimpan di `docs/screenshot/` (nama file berformat `Snipaste_2026-10-13_JJ-MM-...`; jam dicantumkan agar mudah dicocokkan).

## Ringkasan penggunaan

| Tahap | Tanggal | Mode/Fitur Bob | Hasil utama | Status |
|---|---|---|---|---|
| Perencanaan | 13 Okt 2026 | Mode perencanaan + pertanyaan verifikasi | PLAN.md berisi 5 Sub-Task | Selesai |
| Sub-Task 1: Scaffold & fondasi | 13 Okt 2026 | Agent (file + terminal + todo list) | 32 file: client, server, 60 soal seed, halaman Home | Selesai |
| Sub-Task 2: Backend & prompt AI | 13 Okt 2026 | Agent (file + terminal + test) | Prompt soal/evaluasi, adapter LLM, validasi JSON, retry + fallback, 24 test | Selesai (diverifikasi manual) |
| Sub-Task 3: Mode Pilihan Situasi | 13 Okt 2026 | Agent (UI + test + build) | Halaman Play dan Result, 5 komponen UI, 14 test client | Selesai setelah perbaikan 3 temuan |
| Sub-Task 4: Duel Nuansa + Susun Kalimat | 13 Okt 2026 | Agent (UI + drag-drop + evaluator mock) | Mode Susun (WordDnD) dan Duel Nuansa (FreeInput, skor 0-100) | Selesai, lalu direview dan diperbaiki |
| Perbaikan & pengayaan data | 13 Okt 2026 | Agent (2 prompt dalam 1 task) | Acak opsi, evaluator mock sadar situasi, 84 soal + kalimat_susun | Selesai; 1 bug Susun ditemukan manusia |
| Sub-Task 5: Review kode + aksesibilitas + test | 13 Okt 2026 | Agent (review, refactor, test, build) | Hardening CORS/body size, keyboard WordDnD, refactor scoring, TODO.md; 46 server + 55 client test | Selesai; bug Susun diperbaiki di task terpisah |

## Entri

### [Perencanaan] Menyusun PLAN.md
- **Tanggal/jam:** 13 Oktober 2026, ±16.39-16.45
- **Mode/fitur Bob yang dipakai:** Mode perencanaan; Bob membaca konteks file (`@PROJECT_BRIEF.md`) dan mengajukan pertanyaan verifikasi sebelum menulis rencana.
- **Prompt:**
  ```
  Baca @PROJECT_BRIEF.md. Buat rencana implementasi LinguaDuel:
  1. Struktur folder final dan alasannya.
  2. Daftar komponen React beserta props dan state-nya.
  3. Daftar endpoint API beserta request/response.
  4. Urutan pengerjaan dalam 5 hari, dengan kriteria selesai tiap hari.
  5. Risiko teknis dan mitigasinya.
  Jangan menulis kode dulu. Simpan hasilnya di PLAN.md.
  ```
- **Hasil dari Bob:** `PLAN.md` dengan 5 Sub-Task: (1) scaffold + 60 soal seed + Home, (2) 3 endpoint backend + prompt + retry/fallback, (3) mode Pilihan Situasi end-to-end, (4) mode Duel Nuansa dan Susun Kalimat, (5) test + review + dokumentasi.
- **Keputusan desain yang diajukan Bob dan jawaban saya:**
  1. *Penyedia LLM?* Saya pilih **mock dulu**: game bisa dibuat dan didemokan tanpa API key; LLM asli disambungkan lewat adapter `services/llm.js`.
  2. *Penyimpanan laporan jawaban keliru?* Saya pilih **append ke file JSON lokal** (`data/reports.json`), cukup untuk MVP dan tanpa kredensial tambahan.
  3. *Halaman Result?* Saya pilih **menampilkan riwayat jawaban per soal**, karena tujuan game adalah edukasi.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_16-39-34.png` (prompt perencanaan dan persetujuan penulisan PLAN.md), `Snipaste_2026-10-13_16-44-40.png` (isi PLAN.md, risiko, persetujuan todo list 5 Sub-Task)
- **Pelajaran:** Bob bertanya dulu sebelum merencanakan, sehingga rencana sesuai kebutuhan dan tidak menebak.

---

### [Sub-Task 1] Scaffold & fondasi proyek
- **Tanggal/jam:** 13 Oktober 2026, ±16.45-17.29
- **Mode/fitur Bob yang dipakai:** Mode Agent (membuat/mengedit file, menjalankan terminal, todo list 9 langkah, kotak persetujuan)
- **Prompt:**
  ```
  Berdasarkan @PLAN.md, implementasi Sub-Task 1: scaffold proyek lengkap.
  ```
- **Hasil dari Bob:** 32 file: struktur folder client dan server, 60 soal seed (10 soal x 6 bahasa), `services/mock.js`, halaman Home dengan `LanguagePicker`, placeholder halaman Play dan Result, `lib/api.js`, `lib/storage.js`, `lib/scoring.js`, `concurrently` di `package.json` root, `.env.example`, `.gitignore`. `npm install` berjalan di semua folder tanpa error.

#### Iterasi dan koreksi selama Sub-Task 1
| # | Masalah | Ditangani oleh | Penyelesaian |
|---|---|---|---|
| 1 | Perintah `node ... &` gagal di PowerShell (karakter `&` tidak didukung) | Bob (otomatis) | Bob membaca error lalu memakai `Start-Process` |
| 2 | Tes endpoint soal gagal: "LLM belum dikonfigurasi" (server di mode LLM tanpa API key) | Bob + keputusan saya | Sesuai pilihan mock di tahap perencanaan: `MOCK_MODE=true` |
| 3 | **Bob macet ±17 menit**: layar tidak berubah ("Waiting on the process...") karena menunggu server di foreground yang tidak pernah selesai | **Saya (manual)** | Saya menghentikan Bob dengan tombol stop (tanpa "Undo all" agar 32 file aman), lalu mengirim instruksi koreksi |
| 4 | npm menyisipkan dependensi tak sengaja `"linguaduel": "file:.."` di dua `package.json` | Bob (setelah koreksi saya) | Bob menghapusnya, mematikan proses lama, memverifikasi `.env`, dan memasang ulang dependensi |
| 5 | npm melaporkan kerentanan pada alat dev (nodemon, vite/esbuild) | Saya (keputusan) | Diabaikan untuk MVP karena hanya memengaruhi tooling pengembangan, bukan runtime |
| 6 | Smoke test endpoint berjalan terlalu lama setelah koreksi pertama | **Saya (manual, intervensi kedua)** | Saya menghentikan Bob lagi dan meminta ia menghentikan server serta menutup Sub-Task dengan ringkasan |
| 7 | Bob menjalankan server secara synchronous sehingga menggantung (server tidak pernah exit) | Saya (mengenali pola yang sama) | Saya menguji sendiri: `npm run dev` di terminal, lalu membuka `localhost:5173` |

- **Prompt koreksi pertama:**
  ```
  Verifikasi server sudah cukup, endpoint merespons. Jangan jalankan server di
  foreground lagi. Hentikan proses node yang masih berjalan (Stop-Process -Id 16272),
  pastikan server/.env berisi MOCK_MODE=true, lalu tutup Sub-Task 1 dengan ringkasan
  singkat: file yang dibuat, cara menjalankan, dan apa yang belum selesai.
  ```
- **Prompt koreksi kedua:**
  ```
  Tes endpoint sudah cukup. Hentikan server dan tutup Sub-Task 1 dengan ringkasan singkat.
  ```
- **Yang saya cek/ubah manual:**
  - Mendeteksi bahwa Bob macet (layar sama selama belasan menit) dan menghentikannya dua kali.
  - Memeriksa dan menyetujui perintah di kotak persetujuan Bob ("Approve once"), bukan "Approve for task".
  - Memastikan `server/.env` berisi `MOCK_MODE=true`.
  - **Verifikasi independen:** menjalankan `npm run dev` sendiri; terminal menampilkan `[server] berjalan di http://localhost:3001 mode=MOCK` dan Vite di `localhost:5173`; halaman Home dan placeholder Play tampil di browser.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_16-45-54.png` (Bob menulis file server), `Snipaste_2026-10-13_16-54-57.png` (npm install dan uji server), `Snipaste_2026-10-13_16-57-42.png` (error PowerShell dan "LLM belum dikonfigurasi"), `Snipaste_2026-10-13_17-23-33.png`, `Snipaste_2026-10-13_17-23-52.png` (todo list dan kotak persetujuan Invoke-RestMethod), `Snipaste_2026-10-13_17-30-29.png` (halaman Play placeholder), `Snipaste_2026-10-13_17-30-35.png` (halaman Home)
- **Pelajaran:**
  - `MOCK_MODE` adalah gerbang terpenting agar demo bisa jalan tanpa API key.
  - Bob bisa membaca error dan memperbaiki dirinya sendiri (kasus 1 dan 4).
  - Bob bisa terjebak menunggu proses yang tidak pernah selesai; manusia perlu memantau dan mengarahkan ulang. Server harus dijalankan di background, bukan ditunggu.

---

### [Sub-Task 2] Backend & Prompt AI
- **Tanggal/jam:** 13 Oktober 2026, ±17.30-17.38
- **Mode/fitur Bob yang dipakai:** Mode Agent (implementasi prompt, adapter LLM, validasi JSON, retry, fallback seed, unit test, todo list 11 langkah)
- **Prompt:**
  ```
  Berdasarkan @PLAN.md dan @PROJECT_BRIEF.md, implementasi Sub-Task 2: backend & prompt AI.
  Syarat:
  - Tiga endpoint (/api/question, /api/evaluate, /api/report) berfungsi penuh di MOCK_MODE=true.
  - Prompt generator soal dan evaluator disimpan terpisah di server/src/prompts/.
  - Validasi JSON hasil AI, retry 1x, lalu fallback ke soal seed.
  - Adapter LLM nyata di services/llm.js siap dipakai, tetapi default tetap mock.
  - Jangan menjalankan server secara foreground. Untuk tes, pakai Start-Process atau
    tes unit, dan hentikan prosesnya setelah selesai.
  ```
- **Hasil dari Bob:**
  - `prompts/question.js`: prompt lengkap dengan petunjuk per mode (pilihan/susun/nuansa) dan contoh skema JSON
  - `prompts/evaluate.js`: prompt evaluasi 3 dimensi (konteks, kesopanan, keaslian) dengan format JSON ketat
  - `services/llm.js`: adapter OpenAI-compatible (konfigurasi `LLM_BASE_URL`, `LLM_MODEL`, `LLM_TIMEOUT`), `extractJSON` (membuang markdown code fence), `validateQuestion`, `validateEvaluasi`
  - `routes/question.js`: validasi input ketat, loop retry, fallback ke soal seed dengan field `fallback: true`
  - `routes/evaluate.js`: validasi jawaban kosong + retry
  - `tests/routes.test.js`: 24 test (Jest + Supertest)
  - `src/index.js` diubah agar `app` bisa di-`require` oleh test tanpa listen
- **Yang saya cek/ubah manual:**
  - Meninjau todo list 11 langkah sebelum menyetujui ("Approve once").
  - **Verifikasi independen:** menjalankan `npm test` sendiri di folder `server`; hasil **24 passed, 0 failed** (bukan hanya klaim Bob).
  - Mencatat peringatan Jest "Force exiting... detectOpenHandles" (kemungkinan timer retry yang menggantung); bukan error, dijadwalkan untuk dirapikan di Sub-Task 5.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_17-31-53.png`, `Snipaste_2026-10-13_17-33-33.png` (todo list Sub-Task 2 dan persetujuan), `Snipaste_2026-10-13_17-36-35.png` (24 test lulus), `Snipaste_2026-10-13_17-39-14.png` (keluaran `npm test`: 24 passed)
- **Pelajaran:** Memisahkan retry/fallback ke layer route membuat `llm.js` tetap murni dan mudah diganti provider. `extractJSON` penting karena beberapa model membungkus JSON dalam markdown code fence meski sudah diminta JSON polos. Konfigurasi `LLM_BASE_URL` dan `LLM_MODEL` membuat penyedia (Gemini, Groq, dll.) bisa diganti tanpa mengubah kode.

---

### [Sub-Task 3] Mode Pilihan Situasi: End-to-End
- **Tanggal/jam:** 13 Oktober 2026, ±17.40-17.47
- **Mode/fitur Bob yang dipakai:** Mode Agent (halaman Play + Result, komponen UI, localStorage, unit test client, `npm run build`)
- **Prompt:**
  ```
  Berdasarkan @PLAN.md dan @PROJECT_BRIEF.md, implementasi Sub-Task 3: Mode Pilihan Situasi end-to-end.
  Syarat:
  - Halaman Play: ambil soal dari /api/question, tampilkan situasi dan 4 opsi.
  - Setelah menjawab: tampilkan benar/salah, penjelasan, Kartu Budaya, dan tombol
    "Laporkan jawaban keliru" (POST /api/report).
  - Skor dan streak tersimpan di localStorage.
  - Satu sesi = 5 soal, lalu halaman Result: total skor, streak, level badge, dan
    riwayat jawaban per soal (situasi, pilihan pemain, benar/salah).
  - Tangani state loading dan error dengan pesan ramah dalam Bahasa Indonesia.
  - Tampilan ramah mobile (Tailwind).
  - Jangan menjalankan server secara foreground. Untuk tes, pakai test otomatis atau
    Start-Process, lalu hentikan prosesnya.
  ```
- **Hasil dari Bob:**
  - `components/SituationCard.jsx`: kartu situasi + badge bahasa dan level
  - `components/OptionList.jsx`: 4 pilihan, highlight hijau/merah setelah menjawab
  - `components/FeedbackPanel.jsx`: benar/salah, penjelasan, Kartu Budaya (toggle)
  - `components/ScoreBar.jsx`: skor, streak, progres soal, level badge
  - `components/ReportButton.jsx`: form laporan, POST `/api/report`, state loading/terkirim/error
  - `pages/Play.jsx`: fetch soal, sesi 5 soal, localStorage, transisi jawab-feedback
  - `pages/Result.jsx`: ringkasan skor/streak/level + riwayat jawaban per soal
  - `client/tests/scoring.test.js` (8 test) dan `storage.test.js` (6 test) via Vitest; `npm run build` nol error; 24 test server tetap hijau
- **Yang saya cek/ubah manual:**
  - Menyetujui pembaruan todo list; tidak ada perintah berisiko.
  - **Uji manual di browser:** halaman Play menampilkan soal dengan 4 opsi, papan Skor/Soal/Streak/Level; saya memainkan sesi sampai halaman Result (riwayat benar/salah per soal tampil).
- **Temuan dari uji manual (perlu perbaikan oleh Bob):**
  1. **Skor dan riwayat tidak di-reset antar sesi.** Papan skor menunjukkan 100 sebelum jawaban pertama, dan Result menampilkan "1/11 Benar" padahal satu sesi hanya 5 soal. Data sesi lama menumpuk di localStorage.
  2. **Soal yang sama muncul dua kali dalam satu sesi** (soal PR pada Soal 2 dan Soal 3). Perlu pencegahan duplikat.
  3. **Teks jawaban benar pada seed Indonesia memuat placeholder "[nama]"** ("Halo, saya [nama]..."). Perlu diganti kalimat utuh.
  - Catatan kualitas: distraktor pada level Pemula terlalu mudah ditebak; diperkaya di Sub-Task 4.
- **Prompt perbaikan (dikirim setelah pencatatan ini):**
  ```
  Perbaiki 3 temuan dari uji manual:
  1. Setiap sesi baru harus reset skor, streak sesi, dan riwayat jawaban ke 0. Result hanya
     menampilkan 5 soal dari sesi ini. Streak/skor tertinggi boleh disimpan terpisah.
  2. Jangan tampilkan soal yang sama dua kali dalam satu sesi.
  3. Hapus placeholder seperti [nama] di data seed; ganti dengan kalimat utuh.
  Tambahkan test untuk ketiganya, jalankan semua test, lalu beri ringkasan singkat.
  ```
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_17-46-01.png`, `Snipaste_2026-10-13_17-46-43.png`, `Snipaste_2026-10-13_17-47-10.png` (Play: soal, 4 opsi, feedback), `Snipaste_2026-10-13_17-47-27.png`, `Snipaste_2026-10-13_17-47-38.png` (Result "1/11 Benar": bukti bug)
- **Pelajaran:** Memisahkan state skor dari state soal membuat logika `jawab()` lebih bersih; `useCallback` pada `ambilSoal` mencegah re-fetch tak perlu. Lolosnya test otomatis tidak menjamin pengalaman bermain benar: ketiga temuan di atas baru terlihat saat dimainkan langsung, jadi uji manual tetap peran manusia.

---

### [Sub-Task 3: Perbaikan] Tiga temuan uji manual
- **Tanggal/jam:** 13 Oktober 2026, sesudah entri Sub-Task 3
- **Prompt:** prompt perbaikan 3 temuan (reset sesi, tanpa soal ganda, hapus placeholder `[nama]`) seperti tertulis di entri di atas.
- **Hasil dari Bob:** skor/riwayat di-reset tiap sesi, soal yang sudah dipakai dikirim sebagai `dipakai` ke server, placeholder diganti kalimat utuh, test bertambah.
- **Yang saya cek manual:** memainkan ulang sesi di browser; Result menampilkan "1/5 Benar" (sebelumnya 1/11). Ketiga temuan terselesaikan.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_17-53-39.png`, `Snipaste_2026-10-13_17-55-20.png` (Bob memperbaiki 3 temuan), `Snipaste_2026-10-13_17-57-04.png` (Result setelah perbaikan: 4/5 Benar, skor 520, level Mahir)
- **Pelajaran:** Siklus uji manual, temuan, prompt perbaikan, uji ulang berjalan efektif dan mudah didokumentasikan.

---

### [Sub-Task 4] Duel Nuansa + Susun Kalimat
- **Tanggal/jam:** 13 Oktober 2026, ±17.55-18.10
- **Mode/fitur Bob yang dipakai:** Mode Agent (komponen UI, drag-and-drop dnd-kit, evaluator mock, test, build)
- **Prompt:** prompt Sub-Task 4 berbasis `@PLAN.md` dan `@PROJECT_BRIEF.md`: mode Susun Kalimat (ketuk/seret kata), mode Duel Nuansa (jawaban bebas dinilai AI skor 0-100 dengan rincian konteks, kesopanan, keaslian), pemilih mode di Home, README. Dengan aturan: server tidak dijalankan foreground.
- **Hasil dari Bob:** `WordDnD.jsx`, `FreeInput.jsx`, panel hasil Nuansa di `FeedbackPanel.jsx`, `evaluasiMock` di server, pemilih mode di Home, label mode di Result.
- **Yang saya cek manual:** mencoba ketiga mode di browser; memastikan skor Nuansa memakai bonus streak hanya bila skor AI >= 70.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_18-03-45.png` (todo list Sub-Task 4: WordDnD, FreeInput, evaluator mock)
- **Bukti hasil akhir (mode mock):** `Snipaste_2026-10-13_18-42-03.png` (Duel Nuansa: skor 60/100 dengan rincian konteks 58, kesopanan 60, keaslian 61, umpan balik, dan alternatif yang lebih natural). Penilaian ini berasal dari evaluator mock, bukan LLM.
- **Pelajaran:** Memecah pekerjaan per Sub-Task menjaga biaya dan membuat setiap hasil bisa diuji sendiri.

---

### [Review & perbaikan Sub-Task 4] Temuan peninjauan manusia
- **Tanggal/jam:** 13 Oktober 2026, ±18.10-18.25
- **Peran saya:** meninjau kode dan data hasil Bob, bukan hanya menerima hasilnya. Temuan:
  1. Posisi jawaban benar di seed condong ke opsi B dan jawaban benar hampir selalu opsi terpanjang, sehingga bisa ditebak tanpa paham bahasanya.
  2. Evaluator mock mengabaikan situasi (skor sama untuk situasi berbeda).
  3. Mode Susun membocorkan jawaban karena kata ditampilkan dalam urutan benar.
  4. Level Mahir hanya punya 4 soal per bahasa, sehingga soal bisa berulang dalam satu sesi 5 soal.
- **Prompt 1 (perbaikan logika):** acak urutan opsi saat soal disajikan dan hitung ulang indeks benar; acak kata Susun (tidak pernah dalam urutan benar); evaluator mock memilih acuan berdasarkan kemiripan situasi dan deterministik; tambah test.
- **Verifikasi independen (skrip Node buatan saya):** 1800 pengundian, posisi jawaban benar tersebar merata; susun tidak pernah muncul dalam urutan benar; evaluator mock memberi skor sama untuk masukan sama dan berbeda antar situasi.
- **Catatan jujur:** evaluator mock berbasis tumpang-tindih kata, jadi belum benar-benar menilai nuansa (jawaban ngawur dan jawaban salah sama-sama ±40). Penilaian nuansa sesungguhnya memerlukan LLM; demo/slide tidak boleh melebih-lebihkan mock.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_18-14-52.png` (todo list perbaikan: acak opsi, evaluator, susun)
- **Pelajaran:** Test otomatis hijau tidak membuktikan kualitas permainan. Peninjauan manusia menemukan masalah yang tidak ditangkap test.

---

### [Perkaya data seed] Prompt 2, 84 soal + kalimat_susun
- **Tanggal/jam:** 13 Oktober 2026, ±18.15-18.25
- **Prompt:** tambah soal sehingga tiap bahasa punya >= 6 soal per level, tambahkan field `kalimat_susun` (kalimat pendek 4-8 kata khusus mode Susun), tandai `perlu_verifikasi` untuk bahasa yang butuh pakar.
- **Hasil dari Bob:** 84 soal (6 bahasa x 14), `kalimat_susun` pada semua soal; ringkasan Bob melaporkan 15/15 todo selesai dan test 44 server / 20 client, build sukses.
- **Yang saya verifikasi:**
  - Bob menyebut 7 Pemula + 7 Mahir untuk semua bahasa. Hasil hitung saya: Indonesia dan Jawa 7/7, tetapi Betawi, Melayu, Sunda, Minang 8 Pemula/6 Mahir. Total tetap 84 dan Mahir >= 6 sehingga tidak ada pengulangan dalam sesi.
  - Aritmetika test dari Bob tidak konsisten (mis. "18+15+1=34" vs 44). Angka resmi diambil dari keluaran `npm test` yang saya jalankan sendiri (lihat entri Sub-Task 5).
  - `perlu_verifikasi` bernilai true hanya untuk Betawi dan Minang; validasi bahasa daerah oleh penutur asli tetap tugas manusia.
- **Catatan proses:** saya mengirim Prompt 1 dan 2 dalam satu task (seharusnya dipisah per task untuk menghemat biaya). Saldo badge Bob menunjukkan 30,07 / 50 terpakai pada titik ini.
- **BUG DITEMUKAN SETELAH ITU (oleh manusia):** `Play.jsx` masih membandingkan jawaban Susun dengan `soal.opsi[soal.benar]` (kalimat panjang), sedangkan server kini mengirim kata dari `kalimat_susun`. Pengecekan skrip: pada 84/84 soal, `kalimat_susun` berbeda dari `opsi[benar]`, sehingga jawaban Susun yang benar akan selalu dinilai salah. Test otomatis tidak menangkapnya karena tidak ada test integrasi mode Susun. Perbaikan diminta ke Bob (lihat entri berikutnya setelah selesai).
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_18-23-54.png` (todo 14/15), `Snipaste_2026-10-13_18-24-48.png` (ringkasan Bob: tabel seed per bahasa, 44 server dan 20 client test)
- **Pelajaran:** Dua bagian yang dibuat dalam prompt berbeda (data dan UI) bisa tidak sinkron; kontrak data antar lapisan perlu dicek lintas-file oleh manusia dan diberi test.

---

### [Sub-Task 5] Code review, aksesibilitas, dan test
- **Tanggal/jam:** 13 Oktober 2026, ±18.20-18.30
- **Mode/fitur Bob yang dipakai:** Mode Agent (review kode, refactor, test, build, todo list 6 item)
- **Prompt:** "Berdasarkan @PLAN.md, kerjakan Sub-Task 5 versi ringkas: 1. Code review (bug, duplikasi, keamanan) 2. Aksesibilitas WordDnD (keyboard) 3. Rapikan peringatan Jest 4. Tambah test client untuk shuffleWords dan poin Duel Nuansa 5. Jalankan semua test dan build 6. Catat temuan yang ditunda di TODO.md." Server tidak dijalankan foreground.
- **Hasil dari Bob:**

  | Area | Perubahan |
  |---|---|
  | Keamanan, CORS | `cors()` dibatasi ke `CORS_ORIGIN` (default `http://localhost:5173`) dan hanya method POST |
  | Keamanan, body | `express.json({ limit: '10kb' })` mencegah payload besar |
  | Aksesibilitas | Chip kata WordDnD: `role="button"`, `tabIndex`, Enter/Spasi memindahkan kata, `focus-ring` terlihat |
  | Jest | `--forceExit` dihapus; server HTTP dibuka di `beforeAll` dan ditutup di `afterAll`, peringatan hilang |
  | Refactor | `shuffleWords` dan `hitungSkorNuansa` dipindah dari `Play.jsx` ke `lib/scoring.js` agar bisa dites |
  | Test | `scoring_nuansa.test.js`, 19 test baru |
  | Dokumentasi | `TODO.md`: rate limiting, batas panjang input, retry duplikat, tulis file async, KeyboardSensor, E2E, coverage |

- **Hasil test (tangkapan layar ringkasan Bob):** server 1 file / 44 test lulus; client 4 file / 39 test lulus; `npm run build` bersih (238 kB JS, 19 kB CSS).
- **Yang saya cek/putuskan manual:**
  - Memilih versi ringkas dan task baru agar biaya terkendali.
  - Menilai bahwa item di `TODO.md` memang berisiko lebih besar (kontrak API, dependensi baru), jadi wajar ditunda dan tidak dikerjakan sekarang.
  - Membuka `Play.jsx` hasil refactor: **bug Susun Kalimat dari entri sebelumnya belum hilang.** `jawabSusun()` dan tampilan "Susunan yang benar" masih memakai `soal.opsi[soal.benar]`, sedangkan kata-kata berasal dari `kalimat_susun`. Review otomatis Bob tidak menemukannya karena tidak diminta mencocokkan kontrak data antara server dan client.
  - Status: diperbaiki di task terpisah, lihat entri berikutnya.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_18-30-52.png` (todo list Sub-Task 5), `Snipaste_2026-10-13_18-31-09.png` (ringkasan Bob: tabel perubahan, hasil test, build)
- **Pelajaran:** Review otomatis menangkap masalah kode (CORS, body size, aksesibilitas, peringatan test), tetapi bug lintas lapisan data-UI hanya terlihat oleh manusia yang memeriksa kedua sisi. Menyimpan temuan yang ditunda ke `TODO.md` lebih jujur daripada memaksakan perubahan berisiko di akhir proyek.

---

### [Perbaikan Susun Kalimat] Dua bug ditemukan lewat uji manual
- **Tanggal/jam:** 13 Oktober 2026, ±18.30-18.38
- **Mode/fitur Bob yang dipakai:** Mode Agent, task baru khusus perbaikan (todo 4/4)
- **Temuan manusia:**
  1. **Kunci jawaban salah.** Jawaban Susun dibandingkan dengan `opsi[benar]` (kalimat panjang), padahal kata-kata berasal dari `kalimat_susun`. Ditemukan lewat pemeriksaan data: 84/84 soal berbeda.
  2. **Kata terbawa dari soal sebelumnya.** Pada uji manual, situasi "warung makan" menampilkan kata soal "lupa mengerjakan PR". Penyebab: `WordDnD` mengisi state dari prop `kata` hanya sekali dan `Play.jsx` tidak memberi `key` per soal. Bug kedua ini tidak ada di prompt perbaikan pertama saya, lalu prompt direvisi.
- **Prompt (revisi):** memuat Bug A (key unik per soal, `useMemo` untuk fallback shuffleWords, reset state per soal) dan Bug B (`kalimatSusunBenar`, `samaSusunan`, dipakai di 5 lokasi), plus test client dan server, `npm test`, `npm run build`, tanpa server foreground, tanpa mengubah dokumen.
- **Hasil dari Bob:**
  - `scoring.js`: `kalimatSusunBenar(soal)` dan `samaSusunan(jawaban, kunci)` (abaikan huruf besar/kecil, spasi ganda, tanda baca akhir).
  - `Play.jsx`: 5 lokasi memakai `kalimatSusunBenar`; `WordDnD` diberi key per soal.
  - Test baru: client `scoring.test.js` +10, `wordDnD_key.test.js` +6; server `routes.test.js` +2.
- **Hasil test (dihitung ulang):** client 39 + 16 = **55**, server 44 + 2 = **46**, `npm run build` sukses. Penjumlahan sesuai dengan angka di layar Bob.
- **Verifikasi manual:** setelah perbaikan, mode Susun diuji di browser; susunan benar dinilai Benar dan kata sesuai situasi.
- **Tangkapan layar** (`docs/screenshot/`): `Snipaste_2026-10-13_18-36-46.png`, `Snipaste_2026-10-13_18-37-28.png` (todo Bug A, Bug B, test), `Snipaste_2026-10-13_18-39-18.png` (selesai: client 55 test, server 46 test, build sukses), `Snipaste_2026-10-13_18-42-22.png` (bukti perbaikan di browser: situasi warung, kata sesuai situasi, susunan "Mau nemenin aku makan nggak" dinilai **Benar**, skor 100, streak 1)
- **Pelajaran:** Dua bug yang tampak satu gejala ("Susun selalu salah") ternyata punya dua penyebab di lapisan berbeda. Prompt pertama saya hanya menutup satu, dan uji manual mengungkap yang kedua. Test otomatis lama tetap hijau selama bug ini ada, jadi test yang mencakup kontrak data server-client dan reset state per soal baru ditambahkan.

---

(Entri berikutnya ditambahkan di sini dengan format yang sama.)

---

## Template entri berikutnya

### [Sub-Task X] Judul singkat
- **Tanggal/jam:**
- **Mode/fitur Bob yang dipakai:**
- **Prompt (salin utuh):**
  ```
  ...
  ```
- **Hasil dari Bob (ringkas):**
- **Iterasi/koreksi (masalah, siapa yang menangani, penyelesaian):**
- **Yang saya cek/ubah manual dan alasannya:**
- **Tangkapan layar:** `docs/screenshot/...`
- **Pelajaran:**

---

## Refleksi akhir (untuk Slide 4 dan 5)

**Bagian yang paling terbantu oleh Bob**
- Perencanaan: satu prompt menghasilkan `PLAN.md` (struktur folder, komponen, endpoint, risiko) dan pertanyaan verifikasi sebelum menulis kode.
- Kerangka kerja: 32 file (client, server, seed, Home) dalam satu Sub-Task, lalu backend, prompt AI, validasi JSON, retry dan fallback.
- Pekerjaan berulang: test otomatis, refactor ke `lib/scoring.js`, review keamanan (CORS, batas body), aksesibilitas keyboard, dan `TODO.md` untuk temuan yang ditunda.
- Hasil akhir: 46 test server dan 55 test client lulus, build bersih, 84 soal seed untuk 6 bahasa, tiga mode permainan.

**Bagian yang tetap butuh keputusan dan pemeriksaan manusia**
- Arah produk: mock dulu, laporan ke JSON, riwayat jawaban, pembatasan 6 bahasa.
- Memantau proses: dua kali Bob macet karena menjalankan server di foreground; saya menghentikannya dan menambahkan aturan "jangan jalankan server foreground" ke semua prompt berikutnya.
- Uji manual: lima bug lolos dari test otomatis, yaitu skor dan riwayat menumpuk, soal ganda, placeholder `[nama]`, kunci jawaban Susun salah, dan kata terbawa antar soal.
- Verifikasi klaim Bob: jumlah soal per level (klaim 7+7, hasil hitung 8+6 untuk empat bahasa) dan aritmetika test yang tidak konsisten, diganti dengan keluaran `npm test` asli.
- Kualitas konten: jawaban benar yang cenderung terpanjang, evaluator mock yang hanya mencocokkan kata, dan validasi bahasa Betawi dan Minang oleh penutur asli (belum dilakukan).
- Pengelolaan biaya: satu Sub-Task per task; menggabungkan dua prompt dalam satu task terbukti lebih boros.

**Pola kerja yang berhasil**
Prompt jelas dengan batasan, Bob mengerjakan, saya menguji sendiri di browser, temuan masuk prompt perbaikan, lalu dicatat di log ini. Test otomatis hijau tidak cukup, jadi uji manual dan peninjauan lintas-file tetap peran manusia.

**Waktu**
Tangkapan layar menunjukkan seluruh pengerjaan berlangsung dari 16.39 sampai 18.39 pada 13 Oktober 2026 (sekitar 2 jam). Perkiraan waktu yang dihemat dibanding tanpa Bob: [isi perkiraan Anda sendiri, misalnya jumlah hari untuk pekerjaan serupa].
