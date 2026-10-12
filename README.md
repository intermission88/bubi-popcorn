# 🍿 Bubi's Popcorn

Aplikasi web mobile-first untuk mengarsipkan film yang ditonton bersama oleh Zald dan Micel: judul, rating, ulasan, dan momen, lengkap dengan penghitung hari bersama dan jam dua zona waktu.

**Live:** [bubi-popcorn.vercel.app](https://bubi-popcorn.vercel.app) · Seluruh aplikasi ada di satu file, [`index.html`](index.html) (HTML, CSS, JS inline), tanpa build step.

## 🚀 Fitur

**Arsip film**
- Catat judul, tahun, poster, bulan menonton, rating dan ulasan terpisah untuk Zald dan Micel, serta badge *Certified Fresh*.
- Filter `Semua`, `Nonton Bareng`, `Zald Picks`, `Micel Picks`, `Top 9+`, dan pencarian judul atau bulan (mendukung nama bulan Indonesia).
- Film dikelompokkan per bulan, bulan terbaru di atas.
- Dua tampilan: karusel per bulan, atau **grid poster** 3 kolom (ala Letterboxd) lewat tombol di samping "Bulan Tayang"; pilihan diingat.
- Detail film: rating, ulasan, bagikan atau salin ringkasan.
- Navigasi **tab bar bawah** (Beranda, Antrean, Statistik, Waktu, dan Tambah untuk admin), judul besar yang mengecil saat scroll, header dan tab bar bergaya **Liquid Glass** (kapsul kaca melayang, pendekatan CSS yang jalan di Safari), dan modal yang bisa **digeser ke bawah untuk menutup** di HP. Poster tampil bertahap (kecil buram lalu tajam).

**Bareng-bareng**
- **Mau Ditonton:** antrean film yang belum ditonton. Tombol "Sudah ditonton" langsung membuka form ulasan.
- **Statistik Kita:** total film, rata-rata rating, favorit berdua, selera paling beda, bulan tersibuk.
- **Roulette Nobar:** pilih film acak dari antrean dan film yang baru ditonton salah satu.
- **Tahun dalam Film:** recap per tahun yang bisa dibagikan.
- **Hari bersama** sejak 5 April 2025, jam Zald (`Asia/Colombo`) dan Micel (`Asia/Tokyo`), konverter waktu, serta hitungan ulang tahun.

**Data dari TMDB**
- Isi otomatis judul, tahun, dan poster di form admin.
- Detail film: genre, durasi, rating TMDB, sinopsis, sutradara, pemeran, streaming di Indonesia, dan trailer (tap play).
- Sinkron poster massal (admin) dengan pratinjau dan centang per film.

**Admin dan data**
- Tambah, edit, hapus film di balik satu password (lihat [Mode Admin](#-mode-admin)).
- Ekspor CSV untuk semua orang, impor CSV khusus admin (format sendiri atau diary Letterboxd).

**Lainnya:** hero slider, tema bioskop (marquee, film-strip, "The End"), PWA yang bisa dipasang dan jalan offline, indikator latensi Supabase.

## 🛠️ Tech Stack

[Tailwind CSS](https://tailwindcss.com/) (CDN) · JavaScript murni · [Supabase](https://supabase.com/) (`supabase-js` v2) · [TMDB API](https://www.themoviedb.org/) v3 · YouTube embed (`youtube-nocookie`) · Font Awesome 6.5.1 · Google Fonts (Anton, Inter, Outfit) · Vercel

## ⚙️ Mulai Cepat

Pakai server lokal (bukan `file://`), karena ada service worker:

```bash
python3 -m http.server 4173
```

Buka <http://localhost:4173>. Konfigurasi ada di `index.html`, cari `SUPABASE_URL`, `SUPABASE_KEY`, `TABLE_NAME`, `ADMIN_EMAIL`, dan `TMDB_API_KEY`.

## 🧰 Setup

<details>
<summary><strong>Supabase: RLS dan akun admin</strong> (sekali saja)</summary>

1. **Matikan pendaftaran publik:** Authentication → Sign In / Providers → Email → nonaktifkan *Allow new users to sign up*. Wajib, kalau tidak siapa pun bisa membuat akun dan mendapat izin tulis.
2. **Buat satu akun admin:** Authentication → Users → Add user.
   - Email harus sama persis dengan `ADMIN_EMAIL` di `index.html` (`admin@bubipopcorn.app`).
   - Password bebas, itu yang diketik di aplikasi.
   - Centang *Auto Confirm User*.
3. **Aktifkan RLS** di SQL Editor:

```sql
alter table public.bubi_popcorn enable row level security;

create policy "Public read" on public.bubi_popcorn
  for select using (true);
create policy "Admin insert" on public.bubi_popcorn
  for insert to authenticated with check (true);
create policy "Admin update" on public.bubi_popcorn
  for update to authenticated using (true) with check (true);
create policy "Admin delete" on public.bubi_popcorn
  for delete to authenticated using (true);
```

> Publishable key di `index.html` memang aman untuk publik, tetapi **tanpa RLS** siapa pun bisa menulis langsung ke tabel. RLS-lah yang menolak permintaan tulis dari pengunjung yang belum login. Tombol admin di UI hanya kenyamanan, bukan pengamanan.

</details>

<details>
<summary><strong>Watchlist (Mau Ditonton)</strong></summary>

Jalankan [`supabase/watchlist.sql`](supabase/watchlist.sql) sekali di SQL Editor. Tabel `bubi_watchlist`: baca publik, tulis hanya admin. Tanpa tabel ini bagian "Mau Ditonton" tersembunyi dan fitur lain tetap normal.

</details>

<details>
<summary><strong>TMDB API key</strong></summary>

1. Daftar gratis di [themoviedb.org](https://www.themoviedb.org/signup), lalu Settings → API → buat aplikasi bertipe Developer.
2. Pakai **API Key (v3)**, string pendek 32 karakter. **Jangan** pakai *API Read Access Token* (v4) yang panjang berawalan `eyJ`.
3. Isi `const TMDB_API_KEY = '<api-key-v3>';` di `index.html`.

Key v3 hanya bisa membaca data publik dan memang terlihat di klien. Kalau bocor, buat ulang di halaman API TMDB lalu ganti nilainya. Dikosongkan = fitur TMDB nonaktif, form manual tetap jalan.

</details>

## 🔐 Mode Admin

- Satu password bersama untuk Zald dan Micel. Email tetap di kode (`ADMIN_EMAIL`), jadi layar hanya meminta password.
- Password **tidak ada** di `index.html`. Diverifikasi di server lewat Supabase Auth (`signInWithPassword`).
- Sesi disimpan Supabase, klik gembok lagi untuk keluar. Ganti password kapan saja lewat dashboard tanpa deploy ulang.
- Setelah masuk muncul tombol tambah, edit, dan hapus film, pengelolaan antrean, impor CSV, dan sinkron poster TMDB.

## 🗄️ Skema Data

**`bubi_popcorn`** (rating `*_aku` milik Zald, `*_dia` milik Micel)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | text | Primary key, `m_<timestamp>` |
| `judul` | text | Judul film |
| `tahun` | int | Tahun rilis |
| `poster` | text | URL poster (opsional) |
| `bulan` | text | Bulan menonton, `YYYY-MM` |
| `watched_by` | text | `both` \| `zald` \| `micel` |
| `is_certified` | bool | Penanda Certified Fresh |
| `rating_aku` / `rating_dia` | text | Rating 0–10 |
| `review_aku` / `review_dia` | text | Ulasan |

**`bubi_watchlist`:** `id` (`w_<timestamp>`), `judul`, `tahun`, `poster`, `created_at`. Skema lengkap di [`supabase/watchlist.sql`](supabase/watchlist.sql).

## 📁 Struktur

| Path | Fungsi |
|---|---|
| `index.html` | Seluruh aplikasi |
| `sw.js` | Service worker (network-first untuk HTML, cache-first untuk aset; Supabase dan TMDB tidak di-cache) |
| `manifest.json` | Metadata PWA |
| `assets/` | Gambar slider, foto profil, ikon PWA, logo TMDB |
| `supabase/watchlist.sql` | Skema tabel watchlist |
| `DEBUG.md`, `AGENTS.md` | Guide debug dan konvensi kerja |
| `LICENSE` | MIT untuk kode |

## 🚢 Deploy dan Pengembangan

- Push ke `main` otomatis dideploy ke Vercel. `push.bat` tersedia untuk Windows.
- Setelah mengubah aset yang di-cache, naikkan `CACHE_NAME` di `sw.js`.
- Semua data dari database yang masuk `innerHTML` wajib lewat `escapeHtml()`, dan modal wajib lewat `activateModal()`/`deactivateModal()`.
- Konvensi dan cara uji: [`AGENTS.md`](AGENTS.md), peta kode dan resep debug: [`DEBUG.md`](DEBUG.md).

## ♿ Aksesibilitas

Palet terbatas: hitam dan putih sebagai dasar, emas sebagai aksen, biru untuk Zald dan pink untuk Micel (merah hanya untuk hapus/error); teks diperiksa minimal kontras 4,5:1. Skala tipografi tunggal untuk iPhone (teks terkecil 11px, isi 15px, input 16px agar tidak memicu zoom otomatis iOS). Kontrol memakai elemen native, kartu film bisa dibuka dengan Enter/Space, modal menahan fokus dan menutup dengan Escape, target sentuh minimal 44×44 px, dan `prefers-reduced-motion` dihormati. Layout kolom tunggal `max-w-md` di semua ukuran layar.

## 📜 Lisensi dan Kredit

- **Kode:** [MIT](LICENSE). Isi arsip pribadi (judul yang dicatat, rating, ulasan) dan foto di `assets/` tidak termasuk dan tetap hak pemiliknya.
- **TMDB:** This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB. Logo resmi dipakai apa adanya di footer. Data streaming dari JustWatch lewat TMDB.
- **Poster, gambar, dan trailer** adalah hak cipta pemilik masing-masing, ditampilkan untuk arsip pribadi nonkomersial. Pemutar trailer tunduk pada Ketentuan Layanan YouTube.
- **Pustaka:** Tailwind CSS (MIT), Font Awesome Free (ikon CC BY 4.0, font SIL OFL 1.1, kode MIT), Google Fonts Anton, Inter, Outfit (SIL OFL 1.1), Supabase JS (MIT).

Daftar yang sama tampil di footer situs, bagian **Kredit & Lisensi**.
