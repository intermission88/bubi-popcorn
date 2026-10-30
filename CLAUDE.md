# bubi-popcorn

Web app mobile-first satu file: `index.html` (HTML + CSS + JS inline, ~3800 baris). Data: Supabase (`bubi_popcorn`, `bubi_watchlist`). Info film: TMDB API v3. Deploy: Vercel, otomatis tiap push ke `main`. Peta kode dan resep debug: `DEBUG.md`.

## Lingkungan
- **macOS (rumah):** `python3` ada; `node`/`npm`/`timeout` tidak ada; jangan pakai Brave headless (menggantung).
- **Windows (apartemen):** GUI app lewat `Start-Process -Wait`; `.ps1` butuh `-ExecutionPolicy Bypass`.

## Hemat context
- Jangan baca `index.html` utuh: `grep -n` dulu, lalu baca ±40–80 baris dengan offset/limit. Jangan baca `assets/` (biner).
- Jangan baca ulang file yang sudah dibaca di sesi ini. `grep` cukup `path` + `pattern`, tanpa field filter kosong.
- Edit dengan konteks terpendek yang tetap unik. Perubahan desain langsung dieksekusi, tanpa mockup.

## Orkestrasi model
Izin tetap untuk memakai subagent (`Agent`) dengan `model`. Hierarki: **Haiku** pekerja utama, **Sonnet** cadangan Haiku, **Opus** penentu akhir. Semua subagent, termasuk `Explore`, wajib `model: "haiku"` kecuali saat eskalasi (tanpa `model`, subagent ikut memakai Opus).

1. **Opus** memutuskan (desain, arsitektur, copy) dan menulis brief. Konteks kurang: suruh Haiku `Explore`, jangan cari sendiri.
2. **Haiku** mengerjakan semuanya: cari/`grep`, baca potongan `index.html` atau log, semua edit sekecil apa pun, `README.md`/`DEBUG.md`, `CACHE_NAME`, cek statis, baca data publik, skrip verifikasi `javascript_tool`, draf pesan commit.
3. **Opus** membaca `git diff` (laporan bukan bukti). Salah: kirim balik ke Haiku sekali dengan koreksi spesifik.
4. **Sonnet** hanya bila Haiku tetap salah/menyerah, atau tugas jelas di luar kemampuannya (bug multi-langkah, lintas banyak bagian `index.html`, review kedua). Brief menyebut apa yang dicoba Haiku dan kenapa gagal.
5. **Opus** mengerjakan sendiri hanya bila Sonnet juga gagal, atau tugas menyentuh auth/admin.
6. **Opus** menutup: verifikasi browser bila perilaku berubah, lalu commit dan push.

Brief subagent: file + anchor `grep`, tujuan, batasan relevan (palet, tipografi, `escapeHtml`, secret, tulis Supabase, baca `index.html` utuh), bentuk laporan (yang diubah, di baris mana, yang belum yakin). Satu penulis per file. Subagent tidak commit/push, tidak membuka browser, tidak menulis ke Supabase.

## Verifikasi
- Perubahan sepele (teks, warna, spasi, label): cek statis saja, tanpa browser.
- Perubahan perilaku: sekali di browser pane (`mcp__Claude_Browser__*`). `python3 -m http.server 4173 --bind 127.0.0.1`, `navigate`, satu skrip gabungan `javascript_tool`, error lewat `read_console_messages`. Visual HP: `resize_window` preset `mobile`, lalu kembalikan ke `desktop`.
- Tanpa login admin; jangan panggil fungsi yang menulis ke Supabase (`applyTmdbSync`, `importCsv`, `insertWatchlist`, dst). Dry-run boleh set `isAdminUnlocked = true` sementara.
- Jangan buka browser di luar aplikasi. Matikan server setelah selesai.

## Supabase dan auth
- Agent hanya bisa baca publik (REST + publishable key di `index.html`). Perubahan skema: tulis `supabase/*.sql`, user menjalankannya di SQL Editor.
- Fitur yang bergantung pada tabel/kolom baru wajib aman bila belum ada (contoh `fetchWatchlist` + `watchlistAvailable`).
- Admin: `signInWithPassword`, email `ADMIN_EMAIL` di-hardcode, UI hanya minta password. Tulis dilindungi RLS. Dilarang `service_role` di klien dan password/secret di `index.html`/`README.md`.

## TMDB
- Hanya API Key v3 (`TMDB_API_KEY`). Jangan pakai Read Access Token v4; jangan ulangi nilai key di balasan, commit, atau dokumen.
- Atribusi wajib selalu terlihat di footer: `assets/tmdb-logo.svg` (tidak dimodifikasi, lebih kecil dari identitas app) + kalimat resmi.
- Data TMDB tidak disimpan ke DB kecuali `poster`, `tmdb_id`, `tmdb_media`. Rekomendasi, koleksi, season, dan detail diambil langsung (cache localStorage `bubi_recs_v6` per minggu, `bubi_recs_seed_v2` per seed 30 hari).

## UI dan kode
- Data DB/TMDB yang masuk `innerHTML` wajib lewat `escapeHtml()`.
- Modal lewat `activateModal()`/`deactivateModal()` dan terdaftar di handler Escape. Bottom sheet: `<div class="sheet-handle sm:hidden" data-sheet-grab>`, `data-sheet-grab` di header, `initSheetDrag(contentId, closeFn)` di bootstrap.
- Poster selalu lewat `posterBox()`, jangan `<img>` mentah.
- Layout satu kolom: `max-w-md` di HP, `md:max-w-3xl` mulai 768px (karusel `md:w-44`, antrean 2 kolom, modal `md:max-w-lg/xl`, tab bar `md:max-w-lg`). Navigasi = tab bar `#tab-bar`; dilarang FAB.
- **Palet:** dasar `neutral-950/900/800`; teks `neutral-50`, sekunder `200/300`, paling gelap `neutral-400`. Emas `#facc15` (`amber-*`, `.popcorn-gradient`, `.gold-gradient`). `sky-*` hanya Zald, `pink-*` hanya Micel, merah hanya hapus/error. Dilarang `slate-*`, hijau, oranye, atau warna lain.
- **Tipografi:** hanya skala `tailwind.config`: `text-micro` 11px, `text-caption` 12px, `text-xs` 13px, `text-sm` 15px, `text-base` 16px, lalu bawaan. Dilarang `text-[Npx]` dan ukuran di bawah 11px; input tetap 16px.
- **Certified Fresh:** `.certified-card`, `.gold-frame`, `.gold-badge`, `.gold-text`, `.certified-sheet`. Jangan mengarang gaya emas baru.
- **Liquid Glass:** `.glass` dipakai hemat (tab bar, tombol header). Jangan kaca di atas kaca, jangan filter SVG di `backdrop-filter` (tidak jalan di Safari).
- `sw.js`: naikkan `CACHE_NAME` bila `index.html`/aset berubah; jangan cache Supabase maupun `api.themoviedb.org`.
- Pustaka/aset pihak ketiga: tambahkan ke "Kredit & Lisensi" di footer dan bagian Lisensi `README.md`.

## Setelah selesai
- Commit + push langsung ke `main` tanpa bertanya, pesan bahasa Indonesia. `git add` hanya file yang diubah, jangan `-A`.
- Perbarui `README.md` bila fitur/setup berubah, `DEBUG.md` bila peta kode bergeser. Heading README tanpa emoji; bila palet/brand berubah, perbarui `assets/readme/palette.svg` dan `banner.svg`.

## antislop
- Untuk UI, copy, aksesibilitas, layout mobile, atau komentar kode: baca `.claude/skills/antislop/SKILL.md`, lalu skill turunannya (`-ui`, `-copywriting`, `-human`, `-layoutmobile`, `-code`). Aturan proyek di atas menang bila bentrok.
- Mode mengikuti "Two Usage Modes" di core: instruksi sesi, lalu preferensi global, lalu tanya (during/after) dan tunggu jawaban. Permintaan review atau tanpa edit, maupun mode skill lain, bukan pilihan mode.
- Umumkan sekali `antislop active: <mode> (session override).` atau `(global preference).`: tugas edit sebelum edit pertama, tugas baca-saja di awal jawaban akhir.
- Update: unduh ulang `skills/*` dari github.com/miqdadbadjuber/anti-slop ke `.claude/skills/`.
