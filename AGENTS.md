# bubi-popcorn

Aplikasi web mobile-first, satu file: `index.html` (HTML + CSS + JS inline, ~2130 baris).
Data film: Supabase (tabel `bubi_popcorn`). Deploy: Vercel, otomatis tiap push ke `main`.

## Lingkungan (2 mesin, jangan tertukar)
Repo ini dikerjakan dari dua mesin: macOS (rumah) dan Windows (apartemen).

- **macOS**: `python3` ada dan dipakai untuk verifikasi statis. Uji perilaku lewat browser pane bawaan Claude (tool `mcp__Claude_Browser__*`). Brave headless tidak dipakai lagi (Crashpad/izin macOS bikin menggantung). `node`/`npm` TIDAK ada.
- **Windows**: uji perilaku juga lewat browser pane bawaan Claude. Di PowerShell, GUI app harus lewat `Start-Process -Wait`, dan `.ps1` butuh `-ExecutionPolicy Bypass`.

## Hemat context
- Guide debug cepat: lihat `DEBUG.md` (peta kode, resep per gejala, jebakan).
- JANGAN baca `index.html` utuh. Cari baris dengan `grep -n`, lalu `read_file` offset/limit ±40–80 baris.
- Jangan ulangi baca file yang sudah dibaca di sesi ini.
- Jangan kirim field filter kosong ke `grep` (bikin error "unrecognized file type"). Cukup `path` + `pattern`.
- `assets/` berisi file biner. Jangan dibaca.
- `edit_file` pakai konteks sependek mungkin yang tetap unik. Hindari `write_file` untuk perubahan kecil.
- Perubahan desain: langsung eksekusi, jangan tulis mockup markdown.

## Verifikasi hemat
- Perubahan sepele (teks, warna, spasi, label): cukup cek statis (`grep`/python assert). Jangan buka browser.
- Perubahan perilaku (JS, modal, form, auth, fetch): verifikasi SEKALI dengan browser pane bawaan Claude (`preview_start`/`navigate` ke server lokal, assertion lewat `javascript_tool`, error lewat `read_console_messages`), satu skrip gabungan. Jangan ulang per kasus.
- JANGAN buka browser GUI di luar aplikasi atau rebut mouse/keyboard. Hanya browser pane bawaan Claude.
- Bersihkan server/proses latar setelah selesai.

## Aturan produk (jangan dilanggar)
- DILARANG menaruh password/secret di `index.html` atau `README.md` (bisa dibaca via Inspect Element).
- Auth admin lewat Supabase (`signInWithPassword`). Email admin di-hardcode (`ADMIN_EMAIL`); UI hanya minta password.
- Tulis data dilindungi RLS + akun auth. Jangan pernah kirim `service_role` key ke klien.
- Semua data dari database yang masuk `innerHTML` wajib lewat `escapeHtml()` — judul bisa berisi `"` atau `<` dan merusak markup.
- Modal buka/tutup wajib lewat `activateModal()`/`deactivateModal()` supaya fokus, trap Tab, dan Escape tetap jalan.
- Layout mobile-first kolom tunggal (`max-w-md`) di semua ukuran layar.
- `sw.js`: naikkan `CACHE_NAME` saat aset berubah; jangan cache respons Supabase.

## Setelah selesai
- Commit + push langsung ke `main` tanpa bertanya. Pesan commit bahasa Indonesia, jelas.
- Perbarui `README.md` bila fitur atau langkah setup berubah.
