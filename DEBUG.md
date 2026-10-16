# 🔍 Guide Debug — bubi-popcorn

Peta untuk debug cepat: ke mana melihat, perintah apa yang jalan, dan jebakan yang sudah pernah terjadi. Baca bagian "Resep Debug" dulu; kalau butuh konteks, barulah baca kode.

## Peta File

| File | Fungsi | Kapan dibuka |
|---|---|---|
| `index.html` | Semua markup, CSS, JS (~2800 baris). JANGAN dibaca utuh. | Saat perbaikan perilaku/tampilan |
| `sw.js` | Service worker: network-first HTML, cache-first aset, Supabase dan TMDB tidak di-cache. | Gejala "perubahan tidak tampil" / offline |
| `manifest.json` | Metadata PWA + ikon (`assets/icon.svg`). | Ikon install salah |
| `assets/` | Biner: 5 slider, 2 foto profil, ikon PWA, `tmdb-logo.svg`. Jangan dibaca; pakai `file`/`sips` untuk metadata. | Aset 404 |
| `supabase/watchlist.sql` | Skema tabel `bubi_watchlist` + RLS. Dijalankan user manual. | Watchlist tidak muncul |
| (tanpa SQL) logo judul | `fetchTmdbExtra` mengambil `images.logos` (en/tanpa teks dulu, suara terbanyak) -> `renderTmdbExtra` mengisi `#detail-logo` dan menyembunyikan `#detail-title` (`sr-only`, tetap untuk aksesibilitas). Tidak disimpan di DB; judul teks jadi cadangan. | Logo tidak muncul / judul hilang |
| `supabase/backdrop.sql` | Kolom `backdrop` di `bubi_popcorn`. `backdropAvailable()`; diisi `applyTmdbResult` (form) dan `planTmdbSync`/`applyTmdbSync`. `createLandscapeCard` memakai `posterBox(..., 'w780', 'w300')`. Mode tampilan: `viewMode` carousel/grid/landscape (`toggleViewMode`). | Kartu landscape pakai poster, bukan backdrop |
| `supabase/season.sql` | Kolom `season` di `bubi_popcorn`. Aktif lewat `seasonAvailable()`; `seasonNum(m)` = nomor valid atau null. Picker: `loadSeasonPicker`/`pickSeason`; `fetchTmdbExtra` melonggarkan aturan tahun untuk series bersesi. | Pemilih season / lencana S2 tidak muncul |
| `supabase/kutipan.sql` | Kolom `kutipan` di `bubi_popcorn`. Fitur aktif otomatis lewat `kutipanAvailable()` (cek key `kutipan` di baris data). | Kolom kutipan tidak muncul di form |
| `LICENSE` | MIT untuk kode (isi arsip dan foto dikecualikan). | Soal lisensi |
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
| Mau Ditonton (watchlist, di atas pencarian) | `grep -n 'watchlist-section'` |
| Modal Statistik + Roulette + Recap + CSV + sinkron TMDB | `grep -n 'id="stats-modal"'` |
| Kotak info TMDB + trailer di modal detail | `grep -n 'id="detail-tmdb"'` |
| Footer: logo TMDB + Kredit & Lisensi | `grep -n 'tmdb-logo\|Kredit'` |
| Search + filter viewer + Top 9+ | `grep -n 'search-section'` |
| Karusel film per bulan | `grep -n 'months-carousel'` |
| Empty state / error state | `grep -n 'empty-state\|error-state'` |
| Blok total film ditonton | `grep -n 'memory we keep'` |
| Footer + panel admin | `grep -n 'Footer Section'` |
| FAB (konverter, tambah, scroll-top) | `grep -n 'Floating Action'` |
| Modal konverter / login / tambah / detail | `grep -n 'id="time-calc-modal\|password-modal\|add-modal\|detail-modal"'` |
| Konstanta Supabase + ADMIN_EMAIL + watchlist | `grep -n 'SUPABASE_URL\|ADMIN_EMAIL\|WATCHLIST_TABLE'` |
| Konstanta TMDB | `grep -n 'TMDB_API_KEY\|TMDB_IMG'` |
| Blok JS per fitur | `grep -n '// --- '` |
| Fungsi JS | `grep -n 'function <nama>'` |

## Fungsi JS per Fitur

- **Modal (semua modal memakai helper ini):** `activateModal` / `deactivateModal` — simpan pemicu, fokus awal, restore fokus. Escape + trap Tab di satu listener `keydown` global. Perubahan perilaku modal di sini saja.
- **Data:** `fetchSupabaseData` (ambil semua, set `hasFetchError`) → `processFilterAndRender` (filter + search + hitung) → `renderMonthsCarousel` → `createMovieCard` (satu-satunya tempat `innerHTML` untuk data; semua data WAJIB lewat `escapeHtml`).
- **Filter:** `setViewerFilter`, `toggleTopRatedFilter`, `onSearchInput` (debounce 250 ms), `clearSearchInput`, `resetSearch`.
- **Form:** `openAddModal`, `handleFormSubmit` (perhatikan alur sukses/gagal), `editCurrentMovie`, `requestCloseAddModal`, `validateRatingInput`, `clampRatingOnBlur`.
- **Admin:** `handleLockClick`, `openPasswordModal`, `handlePasswordSubmit` (`signInWithPassword`, email dari `ADMIN_EMAIL`), `initAdminSession` (`getSession` + `onAuthStateChange`), `updateLockUI`.
- **Waktu:** `updateDualClocks` (Zald `Asia/Colombo`, Micel `Asia/Tokyo`), `updateConvertedTime` + `toggleConverterDirection` (JST ↔ Colombo, beda 3,5 jam), `calculateAgeAndCountdown`.
- **Slider:** `updateSlider`, `startSlideTimer` (hormati reduced motion), `currentSlide`.
- **Statistik + Roulette:** `openStatsModal` / `closeStatsModal`, `renderStats`, `getRoulettePool` (antrean + film yang baru ditonton satu orang), `spinRoulette` (hormati reduced motion).
- **Recap tahunan:** `initRecap`, `renderRecap`, `shareRecap`.
- **TMDB (form):** `searchTmdb(inputId, boxId, handler)` → `applyTmdbResult` / `applyTmdbToWatchlist`. Kunci di `TMDB_API_KEY`; kosong = fitur nonaktif.
- **TMDB (detail):** `loadTmdbExtra` → `fetchTmdbExtra` (search lalu detail dengan `append_to_response`, cache di `tmdbExtraCache`) → `renderTmdbExtra`; `showTrailer` / `stopTrailer` (iframe `youtube-nocookie`, tanpa autoplay), `toggleOverview` (potong 3 baris).
- **Sinkron poster (admin):** `planTmdbSync` (pratinjau, tidak menulis) → `applyTmdbSync` (satu-satunya yang menulis kolom `poster`).
- **Watchlist:** `fetchWatchlist` (set `watchlistAvailable`, tabel hilang = bagian disembunyikan), `renderWatchlist`, `insertWatchlist`, `deleteWatchlistItem`, `markWatchlistWatched` (set `pendingWatchlistId`; dihapus di `handleFormSubmit` setelah simpan sukses).
- **CSV:** `exportCsv`, `importCsv` (admin; dedup judul+bulan; format sendiri atau Letterboxd), `parseCsv`, `csvCell` (awalan `'` untuk cegah formula injection).
- **Navigasi dan tampilan:** tab bar bawah `#tab-bar` (`scrollToTop`, `scrollToWatchlist`; tab Antrean ikut visibilitas section watchlist; `#fab-container` = tombol tambah admin di tengah tab bar). `updateScrollUI` (judul header muncul setelah large title keluar layar, tab aktif). Mode tampilan: `toggleViewMode` / `applyViewModeUI` (`bubi_view_mode` di localStorage), `createMovieCard` (karusel) vs `createPosterTile` (grid 3 kolom). Poster: `posterBox`, `tmdbSized`. Bottom sheet: `initSheetDrag` (pointer events; zona `[data-sheet-grab]`).
- **Bootstrap:** satu `DOMContentLoaded` di akhir file — semuanya dipasang di sini.

## Cek Kesehatan 30 Detik (mulai dari sini kalau "website rusak")

```bash
# 1) commit terakhir yang ter-deploy (bandingkan dengan HEAD lokal)
curl -s "https://api.github.com/repos/intermission88/bubi-popcorn/deployments?per_page=1" \
  | grep '"sha"'

# 2) konten live terbaru? CACHE_NAME harus sama dengan lokal
curl -s https://bubi-popcorn.vercel.app/sw.js | grep CACHE_NAME

# 3) tulis anonim harus ditolak 401 (RLS aktif)
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE \
  "https://<project>.supabase.co/rest/v1/bubi_popcorn?id=eq.__probe__" \
  -H "apikey: <publishable-key>" -H "Authorization: Bearer <publishable-key>"

# 4) pendaftaran publik harus tertutup (disable_signup = true)
curl -s https://<project>.supabase.co/auth/v1/settings -H "apikey: <publishable-key>" \
  | grep disable_signup
```

Keempatnya normal → masalahnya di kode/perangkat, lanjut ke tabel resep di bawah.
Status sukses/gagal detail: `.../deployments/<id>/statuses` (ikuti `statuses_url` dari langkah 1).

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
| Bagian "Mau Ditonton" tidak muncul | `watchlistAvailable`; probe `bubi_watchlist` (bawah) | Tabel belum dibuat (jalankan `supabase/watchlist.sql`), atau antrean kosong dan belum login admin |
| Kotak info TMDB tidak muncul di detail | `TMDB_API_KEY` terisi? Tab Network ke `api.themoviedb.org` | Key kosong/salah; film tidak cocok judul+tahun (±1) |
| Film series "Season N" tidak dapat poster/info | Tahun TMDB = tayang perdana, bukan musim | Normal; isi poster manual lewat form edit |
| Trailer tidak muncul / hitam | Ada `trailerKey`? Tautan cadangan "Buka di YouTube" | Video melarang embed, atau tidak ada trailer YouTube |

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

**Perubahan perilaku (JS, modal, form, fetch):** verifikasi SEKALI dengan browser pane bawaan Claude, satu skrip gabungan untuk semua assertion.

```bash
# 1) server (stop setelah selesai)
python3 -m http.server 4173 --bind 127.0.0.1
```

2. Buka `http://127.0.0.1:4173` dengan `preview_start` (parameter `url`) atau `navigate`.
3. Assertion DOM/JS: `javascript_tool` (REPL, `await` boleh). Error JS: `read_console_messages` dengan `onlyErrors`.
4. Cek visual: `resize_window` preset `mobile`, lalu `screenshot`. Kembalikan ke `desktop` setelah selesai.

Pola assertion yang sudah terbukti: render kartu uji via `createMovieCard({...})` langsung di halaman; simulasi gagal dengan menimpa `supabaseClient.from` sementara; bandingkan posisi tombol dengan `getBoundingClientRect`.

## Jebakan yang Sudah Pernah Terjadi

1. **`space-y-*` tetap menghitung elemen tersembunyi.** Footer dulu punya `space-y-4` sambil memuat panel admin yang tersembunyi → jarak 16 px bayangan. Solusi: jangan pakai `space-y` di wadah yang memuat elemen `hidden`; beri margin di elemennya sendiri.
2. **Nama `let`/`const` bukan properti `window`.** `let isAdminUnlocked` di scope atas script bisa diakses dari `javascript_tool`, tapi tidak lewat `window.isAdminUnlocked`.
3. **Fungsi async di `javascript_tool`** harus di-`await` di ekspresi akhir; kalau tidak, yang kembali hanya Promise.
4. **Toast umur ~2,8 detik.** Membaca isi toast setelah itu kosong. Kalau butuh, pasang `MutationObserver` sebelum memicu.
5. **Edit paralel di file yang sama** bisa saling menimpa snippet — baca ulang area hasil edit sebelum yakin.
6. **`grep` tool: jangan kirim field `type`/filter kosong** → error "unrecognized file type". Cukup `path` + `pattern`.
7. **Brave headless tidak dipakai lagi.** Di macOS ia menggantung (izin Crashpad); jangan dicoba ulang.
8. **iOS butuh PNG.** Ikon SVG di manifest tidak dibaca iPhone; wajib ada `apple-touch-icon.png`.
9. **Jangan taruh password/secret di `index.html` atau README** — bisa dibaca via Inspect Element. Auth lewat `signInWithPassword`, email di `ADMIN_EMAIL`.
10. **Host adalah Vercel, bukan GitHub Pages.** Jangan ikuti klaim lama.

11. **`javascript_tool` terpotong saat halaman navigasi.** `location.reload()` di skrip yang sama membuang hasilnya; reload di panggilan terpisah, lalu tunggu `DOMContentLoaded` sebelum assertion.
12. **Service worker bisa menyajikan versi lama saat uji.** Cek dulu `typeof namaFungsiBaru === 'function'` sebelum assertion; kalau `stale`, muat ulang.
13. **Console menampilkan "An unknown error occurred when fetching the script" dan 404 `bubi_watchlist`.** Yang pertama tidak menyebut skrip mana dan tidak mengganggu fitur; yang kedua normal bila tabel watchlist belum dibuat.
14. **Pane browser tidak menampilkan konten YouTube.** Pemutaran trailer tidak bisa diverifikasi di sana; cukup cek elemen iframe-nya. Pemutaran harus dicek user di browser sungguhan.
15. **Rating bisa `null` atau string.** Selalu lewat `parseRating()` sebelum menghitung; film yang ditonton satu orang tidak punya rating pihak lain.
16. **Detail TMDB punya penjaga balapan.** `loadTmdbExtra` membandingkan `currentDetailMovieId`; kalau modal berpindah film sebelum fetch selesai, hasil lama dibuang.
17. **`requestAnimationFrame` bisa dijeda di browser pane**, jadi efek scroll (`updateScrollUI`) tidak terpicu saat uji. Panggil `updateScrollUI()` manual setelah `scrollTo`.
18. **Uji geser-tutup** lewat `PointerEvent` sintetis di `[data-sheet-grab]` (`pointerdown` lalu beberapa `pointermove` lalu `pointerup`, `pointerType: 'touch'`). Geser >120px (atau >30px dengan kecepatan terkini >0.5 px/ms; tahan sebentar sebelum lepas = bukan lemparan) menutup; tarik ke atas memakai efek karet 0.25x; kurang dari itu kembali. Animasi `animate-slideUp` dilepas saat drag dan dipasang lagi saat modal dibuka.
19. **Pull-to-refresh** (touchend di `DOMContentLoaded`) dimatikan saat `activeModal` ada, supaya geser-tutup tidak memicu refresh data.
20. **Kaca tidak terlihat?** `backdrop-filter` hanya tampak bila ada konten berwarna di belakangnya (di atas latar hitam polos hasilnya gelap). Cek dengan scroll ke area poster. Header memakai pseudo-elemen `::before` untuk blur bermasker agar tombol di dalamnya tidak ikut memudar.
21. **`.certified-card` memakai tiga lapis `background` (`padding-box` + `border-box`) untuk bingkai gradien.** Jangan tambahkan `border-color` atau `background-color` Tailwind pada kartu itu; akan menimpa bingkai. Lencana emas memakai `!important` agar tidak kalah oleh utilitas `shadow-*`.

## Probe cepat (read-only)

```bash
# RLS: tulis anonim harus ditolak (401). Aman: filter id yang tidak ada.
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE \
  "https://<project>.supabase.co/rest/v1/bubi_popcorn?id=eq.__probe__" \
  -H "apikey: <publishable-key>" -H "Authorization: Bearer <publishable-key>"

# Pendaftaran publik harus tertutup (disable_signup = true)
curl -s "https://<project>.supabase.co/auth/v1/settings" -H "apikey: <publishable-key>"

# Watchlist ada dan bisa dibaca publik? 200 + [] atau isi = ya; 404 = tabel belum dibuat
curl -s -w '\nHTTP %{http_code}\n' "https://<project>.supabase.co/rest/v1/bubi_watchlist?select=*" \
  -H "apikey: <publishable-key>" -H "Authorization: Bearer <publishable-key>"
```

INSERT dengan `?on_conflict=id` + `Prefer: resolution=ignore-duplicates` pada id yang sudah ada: aman (tidak menulis apa pun) dan menjawab `42501` bila RLS aktif. DELETE/PATCH dengan filter yang tidak cocok TIDAK bisa dipakai membedakan — keduanya tetap 204.

## Aturan kerja (lihat `AGENTS.md`)

- Baca `index.html` hanya dengan grep + `offset`/`limit`.
- Commit + push ke `main` langsung setelah selesai; Vercel deploy otomatis.
- Setelah mengubah `index.html` atau aset yang di-cache, naikkan `CACHE_NAME`.
- Uji perilaku lewat browser pane bawaan Claude, jangan fungsi yang menulis ke Supabase.
- Bersihkan server/proses latar setelah verifikasi.
