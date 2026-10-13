# Prompt siap pakai untuk IBM Bob

Cara pakai: buka folder proyek di Bob, ketik `@PROJECT_BRIEF.md` di kolom chat agar Bob membaca konteks, lalu tempel prompt tiap tahap secara berurutan. Setelah setiap tahap: periksa hasil, jalankan, lalu catat di `BOB_LOG.md` dengan tangkapan layar.

---

## Tahap 1: Perencanaan (gunakan mode/skill perencanaan, mis. create-plan)

```
Baca @PROJECT_BRIEF.md. Buat rencana implementasi LinguaDuel:
1. Struktur folder final dan alasannya.
2. Daftar komponen React beserta props dan state-nya.
3. Daftar endpoint API beserta request/response.
4. Urutan pengerjaan dalam 5 hari, dengan kriteria selesai tiap hari.
5. Risiko teknis dan mitigasinya.
Jangan menulis kode dulu. Simpan hasilnya di PLAN.md.
```

## Tahap 2: Scaffold proyek

```
Berdasarkan @PLAN.md, buat kerangka proyek: client (React + Vite + Tailwind + dnd-kit)
dan server (Express). Tambahkan skrip npm untuk menjalankan keduanya sekaligus,
file .env.example, .gitignore, dan halaman Home berisi pemilih bahasa (6 bahasa)
serta pemilih level. Jelaskan perintah untuk menjalankannya.
```

## Tahap 3: Backend dan rekayasa prompt AI

```
Buat server Express dengan endpoint:
- POST /api/question  -> input {bahasa, level, mode}, output JSON sesuai skema di @PROJECT_BRIEF.md
- POST /api/evaluate  -> input {situasi, jawaban, bahasa}, output JSON evaluasi
- POST /api/report    -> menyimpan laporan jawaban keliru ke file JSON

Syarat:
- services/llm.js sebagai adapter; sediakan implementasi mock (MOCK_MODE=true) yang memakai soal dari data/seed.
- Prompt disimpan terpisah di src/prompts/question.js dan evaluate.js.
- Validasi JSON hasil AI; jika rusak, retry 1x lalu fallback ke soal seed.
- Buat 10 soal seed per bahasa (6 bahasa) di data/seed/ dengan variasi situasi.
Tandai soal Betawi dan Minang sebagai "perlu verifikasi penutur asli".
```

## Tahap 4: Mode Pilihan Situasi

```
Buat halaman Play untuk mode Pilihan Situasi: tampilkan situasi, 4 opsi, tombol jawab,
lalu panel feedback berisi penjelasan, Kartu Budaya, dan tombol "Laporkan jawaban keliru".
Tambahkan skor, streak, dan penyimpanan di localStorage. Gunakan Tailwind, tampilan
ramah mobile, dan animasi benar/salah yang sederhana.
```

## Tahap 5: Mode Duel Nuansa

```
Tambahkan mode Duel Nuansa: pemain mengetik jawaban bebas, kirim ke /api/evaluate,
tampilkan skor 0-100, rincian (konteks, kesopanan, keaslian), feedback, dan alternatif
yang lebih natural. Tangani state loading, error, dan jawaban kosong.
```

## Tahap 6: Mode Susun Kalimat

```
Tambahkan mode Susun Kalimat dengan dnd-kit: kata-kata acak diseret ke area jawaban,
bisa diurutkan ulang dan dihapus, lalu dicek terhadap jawaban benar. Pastikan bisa
dipakai di layar sentuh. Tampilkan penjelasan dan Kartu Budaya setelah dijawab.
```

## Tahap 7: Pengujian

```
Buat unit test untuk: validasi JSON AI (termasuk JSON rusak dan field hilang),
logika skor dan streak, fallback ke soal seed, dan jawaban kosong di Duel Nuansa.
Jalankan semua tes, perbaiki kegagalan, dan ringkas cakupan tes.
```

## Tahap 8: Review dan refactor

```
Lakukan code review seluruh proyek: cari bug, duplikasi kode, masalah keamanan
(API key, input pengguna, CORS), dan masalah aksesibilitas. Usulkan perbaikan,
lalu terapkan yang berisiko rendah. Daftarkan sisanya di TODO.md.
```

## Tahap 9: Dokumentasi

```
Buat README.md: deskripsi, fitur, cara instal dan menjalankan (termasuk MOCK_MODE),
variabel environment, struktur folder, daftar prompt AI yang dipakai, dan batasan
yang diketahui (akurasi bahasa daerah). Tambahkan juga ringkasan cara kerja untuk presentasi.
```

---

## Tips menulis prompt ke Bob
- Beri konteks dengan `@namafile` supaya Bob tidak menebak.
- Satu tahap = satu tujuan. Jika hasilnya terlalu besar, pecah menjadi beberapa prompt.
- Minta Bob menjelaskan perubahan yang dibuat; kalimat itu berguna untuk BOB_LOG.md.
- Jika hasil salah, jelaskan kesalahannya spesifik (pesan error, perilaku yang diharapkan).
