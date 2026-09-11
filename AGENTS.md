# bubi-popcorn

Aplikasi web mobile-first, satu file: `index.html` (HTML + CSS + JS inline, ~2240 baris).
Data film: Supabase (tabel `bubi_popcorn`). Deploy: GitHub Pages.

## Lingkungan (2 mesin, jangan tertukar)
Repo ini dikerjakan dari dua mesin: macOS (rumah) dan Windows (apartemen).

- **macOS**: `python3` ada dan dipakai untuk verifikasi statis. Brave headless (`--headless=new` + CDP) jalan normal. `node`/`npm` TIDAK ada.
- **Windows**: kalau Brave headless gagal, pakai Edge headless. Di PowerShell, GUI app harus lewat `Start-Process -Wait`, dan `.ps1` butuh `-ExecutionPolicy Bypass`.

## Hemat context
- JANGAN baca `index.html` utuh. Cari baris dengan `grep -n`, lalu `read_file` offset/limit ±40–80 baris.
- Jangan ulangi baca file yang sudah dibaca di sesi ini.
- Jangan kirim field filter kosong ke `grep` (bikin error "unrecognized file type"). Cukup `path` + `pattern`.
- `assets/` berisi file biner. Jangan dibaca.
- `edit_file` pakai konteks sependek mungkin yang tetap unik. Hindari `write_file` untuk perubahan kecil.
- Perubahan desain: langsung eksekusi, jangan tulis mockup markdown.

## Verifikasi hemat
- Perubahan sepele (teks, warna, spasi, label): cukup cek statis (`grep`/python assert). Jangan buka browser.
- Perubahan perilaku (JS, modal, form, auth, fetch): verifikasi SEKALI dengan Brave **headless** via CDP, satu skrip gabungan untuk semua assertion. Jangan ulang per kasus.
- JANGAN buka browser GUI atau rebut mouse/keyboard. Hanya headless.
- Bersihkan server/proses latar setelah selesai.

## Aturan produk (jangan dilanggar)
- DILARANG menaruh password/secret di `index.html` atau `README.md` (bisa dibaca via Inspect Element).
- Auth admin lewat Supabase (`signInWithPassword`). Email admin di-hardcode (`ADMIN_EMAIL`); UI hanya minta password.
- Tulis data dilindungi RLS + akun auth. Jangan pernah kirim `service_role` key ke klien.
- Layout mobile-first kolom tunggal (`max-w-md`) di semua ukuran layar.
- `sw.js`: naikkan `CACHE_NAME` saat aset berubah; jangan cache respons Supabase.

## Setelah selesai
- Commit + push langsung ke `main` tanpa bertanya. Pesan commit bahasa Indonesia, jelas.
- Perbarui `README.md` bila fitur atau langkah setup berubah.
