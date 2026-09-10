# 🍿 Bubi's Popcorn

**Bubi's Popcorn** adalah aplikasi web mobile-first untuk mengarsipkan film yang ditonton bersama (*nonton bareng*) oleh Zald dan Micel. Semua judul, rating, ulasan, dan momen tersimpan sebagai buku harian digital, lengkap dengan penghitung hari hubungan dan jam dua zona waktu.

Seluruh aplikasi berada dalam satu file: [`index.html`](index.html) (HTML, CSS, dan JavaScript inline).

## 🚀 Fitur Utama

- **Pencatatan Film:** judul, tahun rilis, URL poster, dan bulan menonton (`YYYY-MM`).
- **Review Personal:** rating (0–10) dan ulasan terpisah untuk Zald dan Micel, dengan validasi input dan tombol rating cepat.
- **Sistem Kategori:** filter `Semua`, `Nonton Bareng`, `Zald Picks`, `Micel Picks`, serta filter `Top 9+` untuk rata-rata rating ≥ 9.
- **Pencarian:** cari berdasarkan judul atau bulan (dengan debounce 250 ms, mendukung nama bulan Indonesia).
- **Arsip per Bulan:** film dikelompokkan per bulan, bulan terbaru di atas, bisa digeser horizontal di mobile dan membungkus di desktop.
- **Mode Admin:** tambah, edit, dan hapus film di balik password, dengan konfirmasi untuk aksi hapus.
- **Detail Film:** modal detail berisi banner, rating kedua pihak, ulasan, salin ringkasan ke clipboard, dan tombol bagikan (`navigator.share`, fallback ke clipboard).
- **Ping Indicator:** indikator latensi ke Supabase, bisa ditekan untuk cek ulang.

### Fitur Khusus

- **Hero Slider:** 5 slide otomatis (interval 3,5 detik) dengan indikator yang bisa dipilih.
- **Relationship Tracker:** penghitung hari sejak 5 April 2025, diperbarui tiap detik.
- **Dual Timezone Clock:** waktu Zald (`Asia/Colombo`) dan Micel (`Asia/Tokyo`).
- **Konverter Waktu:** modal konversi waktu dua arah antara JST dan waktu Zald.
- **Certified Fresh:** badge khusus untuk film favorit, membawa gaya dan animasi tersendiri.
- **Perayaan Ulang Tahun:** usia dan hitungan hari menuju ulang tahun berikutnya.
- **PWA:** dapat dipasang ke layar utama, dengan service worker dan fallback offline.

## 🛠️ Tech Stack

- **Frontend:** HTML5 + [Tailwind CSS](https://tailwindcss.com/) (CDN), tanpa build step.
- **Interaksi:** Vanilla JavaScript.
- **Backend/Data:** [Supabase](https://supabase.com/) (`@supabase/supabase-js` v2 via CDN), tabel `bubi_popcorn`.
- **Ikon & Font:** Font Awesome 6.5.1, Google Fonts (Anton, Inter, Outfit).

## 📁 Struktur Proyek

| Path | Fungsi |
|---|---|
| `index.html` | Seluruh aplikasi: markup, gaya, dan logika. |
| `sw.js` | Service worker: network-first untuk HTML, cache-first untuk aset, Supabase selalu langsung ke jaringan. |
| `manifest.json` | Metadata PWA (standalone, portrait, theme `#000000`). |
| `assets/` | Gambar slider dan foto profil. |
| `push.bat` | Skrip commit + push ke GitHub. |
| `AGENTS.md` | Catatan konvensi kerja di repositori ini. |

## 🗄️ Skema Data

Tabel Supabase: **`bubi_popcorn`**. Rating `*_aku` milik Zald, `*_dia` milik Micel.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | text | Primary key, dibuat sebagai `m_<timestamp>` saat insert. |
| `judul` | text | Judul film. |
| `tahun` | int | Tahun rilis. |
| `poster` | text | URL poster (opsional, ada fallback SVG "NO POSTER"). |
| `bulan` | text | Bulan menonton, format `YYYY-MM`. |
| `watched_by` | text | `both` \| `zald` \| `micel`. |
| `is_certified` | bool | Penanda Certified Fresh. |
| `rating_aku` / `rating_dia` | text | Rating Zald / Micel (0–10). |
| `review_aku` / `review_dia` | text | Ulasan Zald / Micel. |

## ⚙️ Menjalankan Secara Lokal

Aplikasi ini murni *client-side* dan tidak butuh proses build. Karena memakai service worker, jalankan lewat server lokal (bukan `file://`):

```bash
python3 -m http.server 4173
```

Lalu buka <http://localhost:4173>.

Konfigurasi Supabase ada di bagian `<script>` paling bawah `index.html`:

```js
const SUPABASE_URL = 'https://<project>.supabase.co';
const SUPABASE_KEY = '<publishable-key>';
const TABLE_NAME = 'bubi_popcorn';
```

## 🔐 Mode Admin (satu password, tanpa email)

- Admin memakai **satu password bersama**, jadi kamu dan Micel memakai password yang sama.
- Di layar cuma ada kotak password. Email tidak ditampilkan karena sudah tetap di kode (`const ADMIN_EMAIL`).
- Password **tidak ada** di dalam `index.html`, jadi tidak bisa dibaca lewat Inspect Element.
- Sesi disimpan otomatis oleh Supabase, jadi admin tetap masuk setelah reload.
- Klik gembok lagi saat sedang masuk untuk **keluar** (*sign out*).
- Setelah masuk: FAB tambah film, tombol edit, dan tombol hapus muncul.

### Setup (sekali saja)

1. **Matikan pendaftaran publik.** Supabase Dashboard → **Authentication → Sign In / Providers → Email** → nonaktifkan **Allow new users to sign up**.
   Ini wajib: kalau pendaftaran terbuka, siapa pun bisa membuat akun sendiri dan otomatis mendapat izin tulis.

2. **Buat satu akun admin.** **Authentication → Users → Add user**:
   - Email: `admin@bubipopcorn.app` (harus sama persis dengan `ADMIN_EMAIL` di `index.html`)
   - Password: bebas, ini yang kalian ketik di aplikasi.
   - Centang **Auto Confirm User** (kalau tidak, login akan gagal).

3. **Aktifkan RLS** di **SQL Editor**:

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

Ganti password kapan saja lewat dashboard (Authentication → Users), tanpa mengubah kode dan tanpa deploy ulang. Kalau mau ganti emailnya, ubah `ADMIN_EMAIL` di `index.html` **dan** di dashboard.

> **Kenapa harus ada akun di server?** Karena password yang dicek di browser selalu bisa dibaca lewat Inspect Element. Satu-satunya cara agar tidak terbaca adalah memverifikasinya di server. Akun ini tidak pernah kamu lihat sebagai "login email" — yang kamu ketik tetap cuma password.
>
> Publishable key di `index.html` memang aman untuk publik, tetapi **tanpa RLS** siapa pun yang membacanya dari source bisa `insert`/`update`/`delete` langsung ke tabel. RLS inilah yang benar-benar menolak permintaan tulis dari pengunjung yang tidak login. Tombol admin di UI hanya kenyamanan, bukan pengamanan.

## ♿ Aksesibilitas & Responsif

- Semua kontrol memakai elemen native (`<button>`, `<a>`, `<label for>`) dan memiliki nama yang dapat dibaca pembaca layar.
- Kartu film bisa dibuka dengan **Enter/Space**, bukan hanya klik atau sentuh.
- Modal memakai `role="dialog"` + `aria-modal`, menahan fokus (Tab), menutup dengan **Escape**, dan mengembalikan fokus ke pemicunya.
- Target sentuh minimal 44×44 px, ada focus ring `:focus-visible`, dan zoom halaman tidak dikunci.
- Menghormati `prefers-reduced-motion`: animasi dimatikan dan autoplay hero berhenti.
- Layout: kolom tunggal `max-w-md` di mobile; mulai lebar 1024 px shell melebar (72rem) dan kartu film membungkus ke beberapa baris.
- Ada `loading` (skeleton), `empty state`, dan `error state` terpisah dengan tombol *Coba lagi*.

## 🚢 Deploy

Repositori ini dideploy sebagai situs statis melalui **GitHub Pages**, jadi cukup push perubahan:

```bash
./push.bat
```

Skrip itu melakukan `git add .`, commit (dengan pesan dari input, default `Update`), lalu `git push origin main`.

## 📝 Catatan Pengembangan

- Konvensi di repositori ini (lihat [`AGENTS.md`](AGENTS.md)): baca `index.html` hanya dengan pencarian + `offset`/`limit`, jangan dibaca utuh.
- Setelah menambah atau mengubah aset yang di-cache, naikkan `CACHE_NAME` di `sw.js` supaya pengguna lama menerima versi baru.
- Data film selalu diambil langsung dari Supabase; jangan cache respons Supabase di service worker.
