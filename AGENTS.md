# bubi-popcorn

Aplikasi web mobile-first, satu file: `index.html` (HTML + CSS + JS inline, ~2800 baris).
Data: Supabase (tabel `bubi_popcorn` dan `bubi_watchlist`). Info film: TMDB API v3. Deploy: Vercel, otomatis tiap push ke `main`.

## Lingkungan (2 mesin, jangan tertukar)
Repo ini dikerjakan dari dua mesin: macOS (rumah) dan Windows (apartemen).

- **macOS**: `python3` ada dan dipakai untuk verifikasi statis. `node`/`npm` dan `timeout` TIDAK ada. Brave headless tidak dipakai (Crashpad/izin macOS bikin menggantung).
- **Windows**: di PowerShell, GUI app harus lewat `Start-Process -Wait`, dan `.ps1` butuh `-ExecutionPolicy Bypass`.
- Uji perilaku di kedua mesin lewat browser pane bawaan Claude (tool `mcp__Claude_Browser__*`).

## Hemat context
- Guide debug cepat: `DEBUG.md` (peta kode, resep per gejala, jebakan).
- JANGAN baca `index.html` utuh. Cari baris dengan `grep -n`, lalu baca dengan offset/limit ±40–80 baris.
- Jangan ulangi baca file yang sudah dibaca di sesi ini.
- Jangan kirim field filter kosong ke `grep` (bikin error "unrecognized file type"). Cukup `path` + `pattern`.
- `assets/` berisi file biner. Jangan dibaca.
- Edit pakai konteks sependek mungkin yang tetap unik. Hindari menulis ulang seluruh file untuk perubahan kecil.
- Perubahan desain: langsung eksekusi, jangan tulis mockup markdown.

## Orkestrasi model (Opus = otak, Haiku = pekerja utama)
Instruksi ini adalah izin tetap dari user untuk memakai subagent (tool `Agent`) dengan parameter `model`.

Ikuti urutan ini setiap menerima tugas:

1. **Saring dulu: kerjakan sendiri (Opus) bila salah satu benar.** Tugas kecil (satu pertanyaan, satu sampai tiga edit, kurang dari ~5 tool call); butuh browser pane (verifikasi perilaku/visual); butuh keputusan desain, arsitektur, atau copy; atau menyentuh auth/admin. Menulis brief untuk tugas sekecil ini lebih mahal daripada mengerjakannya.
2. **Sisanya delegasikan ke Haiku (`model: "haiku"`), pekerja default.** Implementasi yang lingkupnya jelas, refactor terarah, menulis/memperbarui `README.md`/`DEBUG.md`, pencarian/`grep` luas (`subagent_type: "Explore"`), merangkum file atau log, cek statis, membaca data publik Supabase/TMDB.
3. **Review hasil Haiku.** Cek diff atau hasilnya sendiri; laporan subagent bukan bukti. Bila benar, lanjut ke langkah 6.
4. **Naik ke Sonnet (`model: "sonnet"`) hanya dengan alasan:** hasil Haiku salah/tidak lengkap, Haiku menyerah, atau tugasnya sejak awal jelas di luar kemampuan Haiku (bug multi-langkah, perubahan lintas banyak bagian `index.html`, review kode kedua). Brief Sonnet wajib menyebut apa yang sudah dicoba Haiku dan kenapa gagal.
5. **Bila Sonnet juga gagal, Opus mengerjakan sendiri.** Jangan mengulang model yang sama dengan brief yang sama.
6. **Tutup oleh Opus:** edit akhir, verifikasi (lihat "Verifikasi hemat"), commit, push. Hanya Opus yang commit/push.

Aturan untuk setiap subagent:
- Brief wajib mandiri: file dan anchor `grep` terkait, tujuan, batasan relevan dari dokumen ini (palet, tipografi, `escapeHtml`, larangan secret, larangan tulis Supabase, larangan baca `index.html` utuh), dan bentuk laporan (ringkas: apa yang diubah, di baris mana, apa yang belum yakin; bukan dump file).
- Tugas independen boleh paralel, tetapi hanya satu penulis per file (praktis: satu penulis `index.html` sekaligus).
- Subagent tidak commit/push, tidak membuka browser, dan tidak memanggil fungsi yang menulis ke Supabase.

## Verifikasi hemat
- Perubahan sepele (teks, warna, spasi, label): cukup cek statis (`grep`/python assert). Jangan buka browser.
- Perubahan perilaku (JS, modal, form, auth, fetch): verifikasi SEKALI di browser pane bawaan Claude. Jalankan `python3 -m http.server 4173 --bind 127.0.0.1`, buka dengan `navigate`, satu skrip gabungan lewat `javascript_tool`, error lewat `read_console_messages`. Jangan ulang per kasus.
- Cek visual HP: `resize_window` preset `mobile`, lalu WAJIB kembalikan ke `desktop`.
- Uji hanya yang bisa dilakukan tanpa login admin. Jangan memanggil fungsi yang menulis ke Supabase (`applyTmdbSync`, `importCsv`, `insertWatchlist`, dst). Untuk dry-run boleh set `isAdminUnlocked = true` sementara lalu kembalikan.
- JANGAN buka browser GUI di luar aplikasi atau rebut mouse/keyboard.
- Matikan server dan proses latar setelah selesai.

## Supabase (batas akses agent)
- Baca publik bisa lewat REST dengan publishable key yang sudah ada di `index.html` (`curl` ke `/rest/v1/<tabel>`).
- Agent TIDAK bisa menulis atau mengubah skema (butuh login admin atau `service_role`). Perubahan skema: tulis SQL di `supabase/*.sql`, minta user menjalankannya manual di SQL Editor.
- Fitur yang bergantung pada tabel baru wajib aman bila tabelnya belum ada (sembunyikan fiturnya, jangan merusak halaman). Contoh: `fetchWatchlist` + `watchlistAvailable`.

## Aturan produk (jangan dilanggar)
- DILARANG menaruh password/secret di `index.html` atau `README.md` (bisa dibaca via Inspect Element).
- Auth admin lewat Supabase (`signInWithPassword`). Email admin di-hardcode (`ADMIN_EMAIL`); UI hanya minta password.
- Tulis data dilindungi RLS + akun auth. Jangan pernah kirim `service_role` key ke klien.
- **TMDB:** hanya API Key v3 (`TMDB_API_KEY`, hanya-baca). Jangan pernah memakai atau menulis Read Access Token v4. Jangan mengulang nilai key di balasan, commit message, atau dokumen.
- **Atribusi TMDB wajib tetap ada di footer:** logo `assets/tmdb-logo.svg` (tidak dimodifikasi, lebih kecil dari identitas app) + kalimat resmi, selalu terlihat. Jangan dihapus atau dimasukkan ke bagian yang tertutup.
- Data TMDB tidak disimpan ke database, kecuali kolom `poster` dan ID rujukan `tmdb_id`/`tmdb_media` (opsional, `supabase/tmdb_id.sql`) lewat form atau sinkron admin. Rekomendasi, koleksi, dan daftar season selalu diambil langsung, tidak disimpan (cache `bubi_recs_v6` per minggu dan `bubi_recs_seed_v2` per film seed 30 hari, hanya di localStorage). Detail film diambil langsung saat modal dibuka.
- Semua data dari database atau TMDB yang masuk `innerHTML` wajib lewat `escapeHtml()` — judul bisa berisi `"` atau `<` dan merusak markup.
- Modal buka/tutup wajib lewat `activateModal()`/`deactivateModal()` supaya fokus, trap Tab, dan Escape tetap jalan. Modal baru: daftarkan juga di handler Escape. Modal berbentuk bottom sheet: tambahkan `<div class="sheet-handle sm:hidden" data-sheet-grab>`, beri `data-sheet-grab` pada header-nya, dan panggil `initSheetDrag(contentId, closeFn)` di bootstrap (geser ke bawah untuk menutup).
- Layout mobile-first kolom tunggal: `max-w-md` di HP, melebar `md:max-w-3xl` mulai 768px (iPad; kartu karusel `md:w-44`, antrean 2 kolom, modal jadi kartu tengah `md:max-w-lg/xl`, tab bar `md:max-w-lg`). Tetap satu kolom, jangan dipecah jadi multi-kolom. Navigasi utama = tab bar bawah (`#tab-bar`); JANGAN menambah tombol melayang (FAB) yang menutupi konten. Aksi baru yang global: jadikan item tab bar atau tombol di bagian halaman.
- **Certified Fresh = emas metalik:** kelas `.certified-card` (kartu), `.gold-frame` (tile grid), `.gold-badge` (lencana), `.gold-text` (judul), `.certified-sheet` (modal detail). Pakai kelas ini, jangan mengarang gaya emas baru. Kilau `goldSheen` otomatis mati lewat aturan reduced-motion global.
- **Liquid Glass:** material kaca = kelas `.glass` (blur+saturasi+kilau tepi), dipakai hemat (tab bar, tombol header) karena `backdrop-filter` mahal. Jangan menumpuk elemen kaca di atas kaca. Pembiasan asli (filter SVG di `backdrop-filter`) tidak jalan di Safari, jadi jangan dipakai. Sudah ada fallback untuk browser tanpa `backdrop-filter` dan `prefers-reduced-transparency`.
- Poster film selalu lewat `posterBox()` (ukuran TMDB `w342`, latar `w92` buram, fade-in); jangan `<img>` poster mentah.
- **Palet warna:** dasar hitam (`neutral-950/900/800`) dan putih (teks utama `neutral-50`, sekunder `neutral-200/300`, tersier `neutral-400`; teks tidak boleh lebih gelap dari `neutral-400` demi kontras). Aksen emas = kuning brand `#facc15` (`amber-*` di config sudah disamakan, `.popcorn-gradient`, `.gold-gradient`). Biru (`sky-*`) HANYA untuk Zald, pink (`pink-*`) HANYA untuk Micel. Merah hanya untuk hapus dan error. DILARANG memakai `slate-*`, hijau, oranye, atau warna lain di luar palet ini.
- **Tipografi (target utama iPhone):** pakai hanya skala di `tailwind.config` (`fontSize`): `text-micro` 11px (overline/label), `text-caption` 12px, `text-xs` 13px (sekunder), `text-sm` 15px (isi/ulasan), `text-base` 16px (judul modal, input), lalu `lg`/`xl`/dst bawaan. DILARANG `text-[Npx]` dan ukuran di bawah 11px. Input mobile tetap 16px (cegah zoom otomatis iOS).
- `sw.js`: naikkan `CACHE_NAME` saat `index.html` atau aset berubah; jangan cache respons Supabase maupun `api.themoviedb.org`.
- Menambah pustaka atau aset pihak ketiga: tambahkan ke "Kredit & Lisensi" di footer dan bagian Lisensi di `README.md`.

## Setelah selesai
- Commit + push langsung ke `main` tanpa bertanya. Pesan commit bahasa Indonesia, jelas.
- `git add` hanya file yang kamu ubah, jangan `git add -A`. Folder `.commandcode/` sudah dihapus dan di-ignore.
- README bergaya desain: banner, pembatas, dan palet ada di `assets/readme/*.svg` (buatan sendiri). Bila palet atau nama brand berubah, perbarui `palette.svg` dan `banner.svg`. Gunakan heading tanpa emoji (anchor stabil); emoji hanya di dalam sel tabel.
- Perbarui `README.md` bila fitur atau langkah setup berubah, dan `DEBUG.md` bila peta kode bergeser.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `.claude/skills/antislop/SKILL.md` (core) and then the skill for the task:
- UI / visual: `.claude/skills/antislop-ui/SKILL.md`
- Copy & text: `.claude/skills/antislop-copywriting/SKILL.md`
- People: `.claude/skills/antislop-human/SKILL.md`
- Mobile / responsive: `.claude/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `.claude/skills/antislop-code/SKILL.md`
Bila bentrok, aturan proyek di atas (palet, tipografi, Liquid Glass, Certified Fresh, larangan FAB, dst.) menang atas antislop.
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: download `skills/*` from github.com/miqdadbadjuber/anti-slop again into `.claude/skills/`, or run `npx antislop-ai --update` (needs node).
<!-- antislop:end -->
