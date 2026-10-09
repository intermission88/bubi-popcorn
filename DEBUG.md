# 🔍 Guide Debug — bubi-popcorn

Peta untuk debug cepat: ke mana melihat, perintah apa yang jalan, dan jebakan yang sudah pernah terjadi. Baca bagian "Resep Debug" dulu; kalau butuh konteks, barulah baca kode.

## Peta File

| File | Fungsi | Kapan dibuka |
|---|---|---|
| `index.html` | Semua markup, CSS, JS (~2130 baris). JANGAN dibaca utuh. | Saat perbaikan perilaku/tampilan |
| `sw.js` | Service worker: network-first HTML, cache-first aset, Supabase tidak di-cache. | Gejala "perubahan tidak tampil" / offline |
| `manifest.json` | Metadata PWA + ikon (`assets/icon.svg`). | Ikon install salah |
| `assets/` | Biner: 5 slider, 2 foto profil, 2 ikon. Jangan dibaca; pakai `file`/`sips` untuk metadata. | Aset 404 |
| `push.bat` | Alternatif commit+push interaktif (Windows). | — |
| `README.md` | Fitur, skema data, setup. | Referensi |
| `AGENTS.md` | Konvensi kerja + lingkungan per-OS. | Wajib baca dulu |

## Peta `index.html` — cari dengan `grep -n`, jangan hafal baris

Baris bergeser setiap edit. Anchor yang stabil:

| Bagian | Cari dengan |
|---|---|
| Header app bar | `grep -n 'Header App Bar'` |
| Hero slider (5 slide) | `grep -n 'hero-slider'` |
| Kartu "Now Showing" + Hari Bersama + jam ganda | `grep -n 'ticket-card'` |
| Search + filter viewer + Top 9+ | `grep -n 'search-section'` |
| Karusel film per bulan | `grep -n 'months-carousel'` |
| Empty state / error state | `grep -n 'empty-state\|error-state'` |
| Blok total film ditonton | `grep -n 'memory we keep'` |
| Footer + panel admin | `grep -n 'Footer Section'` |
| FAB (konverter, tambah, scroll-top) | `grep -n 'Floating Action'` |
| Modal konverter / login / tambah / detail | `grep -n 'id="time-calc-modal\|password-modal\|add-modal\|detail-modal"'` |
| Konstanta Supabase + ADMIN_EMAIL | `grep -n 'SUPABASE_URL\|ADMIN_EMAIL'` |
| Fungsi JS | `grep -n 'function <nama>'` |

## Fungsi JS per Fitur

- **Modal (semua modal memakai helper ini):** `activateModal` / `deactivateModal` — simpan pemicu, fokus awal, restore fokus. Escape + trap Tab di satu listener `keydown` global. Perubahan perilaku modal di sini saja.
- **Data:** `fetchSupabaseData` (ambil semua, set `hasFetchError`) → `processFilterAndRender` (filter + search + hitung) → `renderMonthsCarousel` → `createMovieCard` (satu-satunya tempat `innerHTML` untuk data; semua data WAJIB lewat `escapeHtml`).
- **Filter:** `setViewerFilter`, `toggleTopRatedFilter`, `onSearchInput` (debounce 250 ms), `clearSearchInput`, `resetSearch`.
- **Form:** `openAddModal`, `handleFormSubmit` (perhatikan alur sukses/gagal), `editCurrentMovie`, `requestCloseAddModal`, `validateRatingInput`, `clampRatingOnBlur`.
- **Admin:** `handleLockClick`, `openPasswordModal`, `handlePasswordSubmit` (`signInWithPassword`, email dari `ADMIN_EMAIL`), `initAdminSession` (`getSession` + `onAuthStateChange`), `updateLockUI`.
- **Waktu:** `updateDualClocks` (Zald `Asia/Colombo`, Micel `Asia/Tokyo`), `updateConvertedTime` + `toggleConverterDirection` (JST ↔ Colombo, beda 3,5 jam), `calculateAgeAndCountdown`.
- **Slider:** `updateSlider`, `startSlideTimer` (hormati reduced motion), `currentSlide`.
- **Bootstrap:** satu `DOMContentLoaded` di akhir file — semuanya dipasang di sini.

## Resep Debug (gejala → ke mana)

| Gejala | Cek dulu | Seringnya penyebab |
|---|---|---|
| Data film tidak muncul / kartu kosong | `error-state` terlihat? Cek tab Network | Fetch Supabase gagal, RLS menolak baca, key salah |
| Simpan/edit gagal | Apakah admin masih login? Probe RLS (bawah) | Sesi habis, RLS `to authenticated`, payload tidak valid |
| Update/hapus "sukses" tapi data tidak berubah | RLS bisa menjawab 204 tanpa baris — cek jumlah baris yang kembali | Sesi tidak valid, RLS senyap |
| Perubahan tidak tampil di situs live | `CACHE_NAME` di `sw.js` vs live | Lupa bump cache; aset cache-first |
| Aset 404 di live tapi jalan di lokal | Huruf besar-kecil nama file | macOS case-insensitive, Vercel case-sensitive |
| Kartu/teks tampil aneh | Apakah data lewat `escapeHtml`? | Data mentah masuk `innerHTML` |
| Modal nyangkut / fokus hilang | `activateModal`/`deactivateModal` + listener Escape | Modal dibuka lewat jalur yang belum memakai helper |
| Ikon install salah | `manifest.json` + `apple-touch-icon` | iOS tidak baca SVG manifest, butuh PNG |
| Waktu/konverter salah | `convDirection`, `formatAmPm` | Offset zona salah, arah tertukar |

## Verifikasi Cepat

**Perubahan sepele (teks, warna, spasi, label):** cek statis saja, jangan buka browser.

```bash
python3 - <<'PY'
from pathlib import Path
h = Path('index.html').read_text()
assert 'teks-lama' not in h      # pastikan hilang
assert 'teks-baru' in h          # pastikan ada
print('ok')
PY
```

**Perubahan perilaku (JS, modal, form, fetch):** verifikasi SEKALI dengan Brave headless + CDP, satu skrip gabungan untuk semua assertion.

```bash
# 1) server (stop setelah selesai)
python3 -m http.server 4173 --bind 127.0.0.1

# 2) Brave headless terisolasi
'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' --headless=new \
  --remote-debugging-port=9229 --user-data-dir=/tmp/bubi-debug --no-first-run --disable-gpu about:blank

# 3) screenshot cepat (cukup untuk cek visual, satu instance saja)
'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' --headless=new \
  --window-size=375,900 --screenshot=/tmp/cek.png --virtual-time-budget=5000 http://127.0.0.1:4173

# 4) assertion DOM/JS lewat CDP: buka tab via PUT /json/new, kirim
#    Runtime.evaluate (returnByValue), kumpulkan Runtime.exceptionThrown
#    untuk menangkap error JS. Simpan trigger fokus dulu sebelum cek.
```

Pola assertion yang sudah terbukti: render kartu uji via `createMovieCard({...})` langsung di halaman; simulasi gagal dengan menimpa `supabaseClient.from` sementara; bandingkan posisi tombol dengan `getBoundingClientRect`.

## Jebakan yang Sudah Pernah Terjadi

1. **`space-y-*` tetap menghitung elemen tersembunyi.** Footer dulu punya `space-y-4` sambil memuat panel admin yang tersembunyi → jarak 16 px bayangan. Solusi: jangan pakai `space-y` di wadah yang memuat elemen `hidden`; beri margin di elemennya sendiri.
2. **Nama `let`/`const` bukan properti `window`.** `let isAdminUnlocked` di scope atas script bisa diakses dari CDP, tapi tidak lewat `window.isAdminUnlocked`.
3. **Skrip CDP tanpa `awaitPromise: true`** mengembalikan `{}` untuk fungsi async — bukan hasilnya.
4. **Toast umur ~2,8 detik.** Membaca isi toast setelah itu kosong. Kalau butuh, pasang `MutationObserver` sebelum memicu.
5. **Edit paralel di file yang sama** bisa saling menimpa snippet — baca ulang area hasil edit sebelum yakin.
6. **`grep` tool: jangan kirim field `type`/filter kosong** → error "unrecognized file type". Cukup `path` + `pattern`.
7. **macOS meneruskan argumen ke instance Brave yang sudah jalan.** Kalau `--screenshot` tidak menghasilkan file, matikan dulu instance lain atau pakai CDP.
8. **iOS butuh PNG.** Ikon SVG di manifest tidak dibaca iPhone; wajib ada `apple-touch-icon.png`.
9. **Jangan taruh password/secret di `index.html` atau README** — bisa dibaca via Inspect Element. Auth lewat `signInWithPassword`, email di `ADMIN_EMAIL`.
10. **Host adalah Vercel, bukan GitHub Pages.** Jangan ikuti klaim lama.

## Probe cepat (read-only)

```bash
# RLS: tulis anonim harus ditolak (401). Aman: filter id yang tidak ada.
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE \
  "https://<project>.supabase.co/rest/v1/bubi_popcorn?id=eq.__probe__" \
  -H "apikey: <publishable-key>" -H "Authorization: Bearer <publishable-key>"

# Pendaftaran publik harus tertutup (disable_signup = true)
curl -s "https://<project>.supabase.co/auth/v1/settings" -H "apikey: <publishable-key>"
```

INSERT dengan `?on_conflict=id` + `Prefer: resolution=ignore-duplicates` pada id yang sudah ada: aman (tidak menulis apa pun) dan menjawab `42501` bila RLS aktif. DELETE/PATCH dengan filter yang tidak cocok TIDAK bisa dipakai membedakan — keduanya tetap 204.

## Aturan kerja (lihat `AGENTS.md`)

- Baca `index.html` hanya dengan grep + `offset`/`limit`.
- Commit + push ke `main` langsung setelah selesai; Vercel deploy otomatis.
- Setelah mengubah aset yang di-cache, naikkan `CACHE_NAME`.
- Bersihkan server/proses latar setelah verifikasi.
