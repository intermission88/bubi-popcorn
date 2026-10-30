# 🔍 Guide Debug — bubi-popcorn

Peta untuk debug cepat: ke mana melihat, perintah yang jalan, dan jebakan yang pernah terjadi. Aturan kerja ada di `CLAUDE.md`. Gejala sudah jelas? Mulai dari "Resep Debug".

## Peta File

| File | Isi | Dibuka saat |
|---|---|---|
| `index.html` | Markup, CSS, JS (~3800 baris). JANGAN dibaca utuh. | Perbaikan perilaku/tampilan |
| `sw.js` | Service worker. `CACHE_NAME` (naikkan bila aset berubah), `IMG_CACHE` (gambar TMDB). Network-first HTML, cache-first aset. | "Perubahan tidak tampil", offline |
| `manifest.json` | Metadata PWA, ikon `assets/icon.svg`. | Ikon install salah |
| `assets/` | Biner. Jangan dibaca; pakai `file`/`sips`. | Aset 404 |
| `supabase/*.sql` | `watchlist.sql` (tabel + RLS), `tmdb_id.sql`, `season.sql`, `kutipan.sql` (kolom opsional). Dijalankan user manual. | Lihat Resep |
| `README.md` / `LICENSE` / `push.bat` | Fitur, skema, setup / MIT untuk kode / commit+push interaktif (Windows). | Referensi |

## Peta `index.html` — cari dengan `grep -n`

Baris bergeser tiap edit; pakai pola ini, jangan hafal baris.

| Bagian | Cari dengan |
|---|---|
| Header app bar | `grep -n 'Header App Bar'` |
| Judul besar + dinding poster (`renderPosterWall`, `.poster-row`) | `grep -n 'poster-wall'` |
| Hero slider (5 slide) + Hari Bersama | `grep -n 'hero-slider\|relationship-days'` |
| Tiket jam + jarak Colombo-Tokyo (`.ticket-notch`, `.flight-runner`) | `grep -n 'zald-clock\|ticket-notch'` |
| Mau Ditonton (maks 5 + `showMoreWatchlist`) | `grep -n 'watchlist-section'` |
| Modal Statistik + Roulette + Recap + CSV + sinkron TMDB | `grep -n 'id="stats-modal"'` |
| Kotak info TMDB + trailer di modal detail | `grep -n 'id="detail-tmdb"'` |
| Search + filter viewer + Top 9+ | `grep -n 'search-section'` |
| Karusel per bulan (maks 4 + `showMoreMonths`, `loadMoreBtn`) | `grep -n 'months-carousel\|MONTHS_PAGE'` |
| Empty state / error state | `grep -n 'empty-state\|error-state'` |
| Baru & Sudah Streaming (`#rekomendasi-section`, `#rec-track`) | `grep -n 'rekomendasi-section'` |
| Tab bar `#tab-bar` + `#fab-container` (tombol tambah admin) | `grep -n 'id="tab-bar"\|fab-container'` |
| Footer: identitas, atribusi TMDB, Kredit & Lisensi | `grep -n 'Footer Section'`, `grep -n 'tmdb-logo\|Kredit'` |
| Modal konverter / login / tambah / detail | `grep -n 'id="time-calc-modal\|password-modal\|add-modal\|detail-modal"'` |
| Konstanta Supabase, admin, watchlist, TMDB | `grep -n 'SUPABASE_URL\|ADMIN_EMAIL\|WATCHLIST_TABLE\|TMDB_API_KEY\|TMDB_IMG'` |
| Blok JS per fitur / fungsi | `grep -n '// --- '`, `grep -n 'function <nama>'` |

## Fungsi JS per Fitur

- **Modal:** `activateModal` / `deactivateModal` (simpan pemicu, fokus awal, restore fokus). Escape dan trap Tab di satu listener `keydown` global; modal baru wajib didaftarkan di Escape.
- **Bottom sheet:** `initSheetDrag` (pointer events, zona `[data-sheet-grab]`). `body.sheet-open` + `--sheet-oy` diatur helper modal.
- **Data:** `fetchSupabaseData` (set `hasFetchError`) → `processFilterAndRender` → `renderMonthsCarousel` (+ `renderPosterWall`, isi sekali) → `createMovieCard` (satu-satunya `innerHTML` data). Salinan offline: `bubi_movies_cache_v1`.
- **Filter:** `setViewerFilter`, `toggleTopRatedFilter`, `onSearchInput` (debounce 250 ms), `clearSearchInput`, `resetSearch`, `syncViewerSeg` (`#seg-thumb`).
- **Form:** `openAddModal`, `handleFormSubmit` (tombol dikunci sebelum `resolveYearIfMissing` agar tidak tersimpan dobel; `pendingWatchlistId` dihapus setelah sukses), `editCurrentMovie`, `requestCloseAddModal`, `validateRatingInput`, `clampRatingOnBlur`. Rating selalu lewat `parseRating()`.
- **Admin:** `handleLockClick`, `openPasswordModal`, `handlePasswordSubmit` (`signInWithPassword`, email `ADMIN_EMAIL`), `initAdminSession` (`getSession` + `onAuthStateChange`), `updateLockUI`.
- **Waktu dan slider:** `updateDualClocks` (Zald `Asia/Colombo`, Micel `Asia/Tokyo`), `updateConvertedTime` + `toggleConverterDirection` (JST ↔ Colombo, beda 3,5 jam; `convDirection`, `formatAmPm`), `calculateAgeAndCountdown`, `initFlightDistance`, `updateSlider`, `startSlideTimer` (hormati reduced motion), `currentSlide`.
- **Statistik, Roulette, Recap:** `openStatsModal` / `closeStatsModal`, `renderStats`, `getRoulettePool` (antrean + film yang baru ditonton satu orang), `spinRoulette`, `initRecap`, `renderRecap`, `shareRecap`.
- **TMDB (form):** `searchTmdb(inputId, boxId, handler)` → `applyTmdbResult` / `applyTmdbToWatchlist`. Hasil per kotak di `tmdbItemsByBox[boxId]`, penjaga balapan `tmdbSearchSeq`. `tmdbPick` + `onFormTitleInput`: judul diubah setelah memilih hasil → ID, poster, season dikosongkan. Kunci `TMDB_API_KEY`; kosong = nonaktif.
- **TMDB (detail):** `loadTmdbExtra` → `fetchTmdbExtra` (lewati search bila `tmdb_id` ada; `append_to_response`; cache `tmdbExtraCache`; logo dari `images.logos`, en/tanpa teks dulu, suara terbanyak; aturan tahun dilonggarkan untuk series bersesi) → `renderTmdbExtra` (isi `#detail-logo`; `#detail-title` jadi `sr-only`). Penjaga balapan: `currentDetailMovieId`. Season: `loadSeasonPicker` / `pickSeason`. `toggleOverview` (potong 3 baris).
- **Trailer:** `showTrailer` / `stopTrailer`, `mountYouTube` (iframe `youtube-nocookie`, `enablejsapi=1`, tanpa autoplay; saat `onError` pindah kandidat `ytTrailerKeys`: resmi → trailer → teaser, maks 6; status per bingkai di `ytPlayers`).
- **Sinkron poster (admin):** `planTmdbSync` (pratinjau, tidak menulis) → `applyTmdbSync` (satu-satunya penulis kolom `poster`).
- **Rekomendasi:** `loadHomeRecs` / `renderHomeRecs`: rilisan `NEW_WINDOW_DAYS` hari terakhir via `/discover` (`watch_region=STREAM_REGION`, flatrate), genre dari seed (`seedRecs`), nama layanan dari `/watch/providers`. Ganti tiap Senin: `weekKey` / `pickSeeds`. Cache: `bubi_recs_v6` (per minggu), `bubi_recs_seed_v2` (per seed, 30 hari). Pendukung: `tmdbItem`, `rowMatches` / `isWatched` / `isQueued`, `initRecSlider`, `fillRecLogos`, `renderDetailRelated` (`#detail-lanjut`: hanya sebelumnya/lanjutan), `addRelated` (+ Antrean via `insertWatchlist`), `pickTvForSeason`.
- **Watchlist:** trailer lewat poster (`openQueueTrailer` → `resolveQueueTmdb` cari ID dari judul+tahun, cache `queueTmdbCache` → `openTrailerFor`, modal `#rec-trailer-modal`). `fetchWatchlist` (set `watchlistAvailable`; tabel hilang = bagian disembunyikan), `renderWatchlist`, `insertWatchlist`, `deleteWatchlistItem`, `markWatchlistWatched`, `fillWatchlistDurations`.
- **CSV:** `CSV_COLUMNS` (termasuk `kutipan`, `tmdb_id`, `tmdb_media`), `exportCsv`, `importCsv` (admin; dedup judul+bulan; format sendiri atau Letterboxd), `parseCsv`, `csvCell` (awalan `'` cegah formula injection).
- **Navigasi dan sentuhan:** `scrollToTop`, `scrollToWatchlist`, `updateScrollUI` (judul header muncul setelah large title keluar layar; tab aktif), `updateTabIndicator` + `is-min`, `setThemeColor`, `posterBox`, `tmdbSized`. Haptic: `triggerHaptic` (Android `vibrate`; iOS lewat `<input switch>`, iOS 17.4+), `bindCarouselHaptics`. Gesture: `initPullToRefresh` (`#ptr`, mati saat `body.modal-lock`), `initSwipeRows` (`.swipe-row`, admin), `initA2hs` (`#a2hs`, `bubi_a2hs_dismissed`), `initContextMenu` / `openCtxMenu` / `ctxAction` (`#ctx-menu`, tekan-tahan 450 ms atau klik kanan).
- **Bootstrap:** satu `DOMContentLoaded` di akhir file; semua init ada di sini.

## Cek Kesehatan 30 Detik (mulai dari sini kalau "website rusak")

```bash
curl -s "https://api.github.com/repos/intermission88/bubi-popcorn/deployments?per_page=1" | grep '"sha"'   # 1) commit terakhir ter-deploy vs HEAD; status: statuses_url
curl -s https://bubi-popcorn.vercel.app/sw.js | grep CACHE_NAME                                             # 2) harus sama dengan lokal
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE "https://<project>.supabase.co/rest/v1/bubi_popcorn?id=eq.__probe__" -H "apikey: <publishable-key>" -H "Authorization: Bearer <publishable-key>"   # 3) harus 401 (RLS aktif)
curl -s https://<project>.supabase.co/auth/v1/settings -H "apikey: <publishable-key>" | grep disable_signup   # 4) harus true
curl -s -w '\nHTTP %{http_code}\n' "https://<project>.supabase.co/rest/v1/bubi_watchlist?select=*" -H "apikey: <publishable-key>" -H "Authorization: Bearer <publishable-key>"   # 200 = ada; 404 = tabel belum dibuat
```

Keempat langkah pertama normal berarti masalahnya di kode/perangkat; lanjut ke resep. Uji INSERT RLS: `?on_conflict=id` + `Prefer: resolution=ignore-duplicates` pada id yang ada (aman, menjawab `42501` bila RLS aktif). DELETE/PATCH tak cocok TIDAK bisa dipakai membedakan (tetap 204).

## Resep Debug (gejala → ke mana)

| Gejala | Cek dulu | Penyebab yang sering |
|---|---|---|
| Data film tidak muncul / kartu kosong | `error-state` terlihat? Tab Network | Fetch Supabase gagal, RLS menolak baca, key salah |
| Simpan/edit gagal | Admin masih login? Probe RLS | Sesi habis, RLS `to authenticated`, payload tidak valid |
| Update/hapus "sukses" tapi data tidak berubah | Jumlah baris yang kembali | RLS menjawab 204 tanpa baris; sesi tidak valid |
| Perubahan tidak tampil di live | `CACHE_NAME` di `sw.js` vs live | Lupa naikkan cache; aset cache-first |
| Aset 404 di live, jalan di lokal | Huruf besar-kecil nama file | macOS case-insensitive, Vercel case-sensitive |
| Kartu/teks tampil aneh | Data lewat `escapeHtml`? | Data mentah masuk `innerHTML` |
| Modal nyangkut / fokus hilang | `activateModal`/`deactivateModal`, Escape | Modal dibuka lewat jalur tanpa helper |
| Ikon install salah | `manifest.json`, `apple-touch-icon` | iOS tidak membaca SVG di manifest; butuh PNG |
| Waktu/konverter salah | `convDirection`, `formatAmPm` | Offset zona salah, arah tertukar |
| "Mau Ditonton" tidak muncul | `watchlistAvailable`; probe `bubi_watchlist` | Tabel belum dibuat (`supabase/watchlist.sql`), atau antrean kosong / belum login admin |
| Kotak info TMDB / logo judul tidak muncul | `TMDB_API_KEY` terisi? Network ke `api.themoviedb.org`; `images.logos` | Key kosong/salah; judul+tahun tidak cocok (±1); film tanpa logo (judul teks jadi cadangan) |
| Rekomendasi kosong / Lanjut nonton hilang | `/discover` di Network; cache `bubi_recs_v6` | Cache minggu ini kosong/rusak; hapus key lalu muat ulang |
| Rekomendasi salah menandai ditonton | `tmdbIdAvailable()` | `supabase/tmdb_id.sql` belum dijalankan; cocok memakai judul |
| Pemilih season / lencana S2 / kutipan tidak muncul | `seasonAvailable()`, `kutipanAvailable()` | `supabase/season.sql` atau `kutipan.sql` belum dijalankan |
| Film series "Season N" tanpa poster/info | Tahun TMDB = tayang perdana, bukan musim | Normal; isi poster manual lewat form edit |
| Trailer tidak muncul / hitam | Ada `trailerKey`? Tautan "Buka di YouTube" | Embed diblokir (error 150, per negara), atau tidak ada trailer |

## Verifikasi Cepat

Alur lengkap di `CLAUDE.md`. Untuk perubahan sepele, cek statis:

```bash
python3 -c "from pathlib import Path; h=Path('index.html').read_text(); assert 'teks-lama' not in h and 'teks-baru' in h; print('ok')"
```

Pola browser yang terbukti: render kartu uji lewat `createMovieCard({...})`; simulasi gagal dengan menimpa `supabaseClient.from` sementara; bandingkan posisi dengan `getBoundingClientRect`; geser sheet lewat `PointerEvent` sintetis (jebakan 16).

## Jebakan yang Sudah Pernah Terjadi

1. **`space-y-*` tetap menghitung elemen `hidden`.** Footer dulu jarak 16 px dari panel admin tersembunyi. Beri margin di elemennya sendiri.
2. **`let`/`const` bukan properti `window`.** `isAdminUnlocked` bisa diakses dari `javascript_tool`, tapi tidak lewat `window.isAdminUnlocked`.
3. **Fungsi async di `javascript_tool`** harus di-`await` di ekspresi akhir; kalau tidak, yang kembali hanya Promise.
4. **Toast hanya ~2,8 detik.** Pasang `MutationObserver` sebelum memicu bila ingin membaca isinya.
5. **Edit paralel di file yang sama** bisa saling menimpa. Baca ulang area hasil edit.
6. **Brave headless tidak dipakai.** Di macOS ia menggantung (izin Crashpad).
7. **iOS butuh PNG.** Ikon SVG di manifest tidak dibaca iPhone; wajib `apple-touch-icon.png`.
8. **Password/secret jangan di `index.html` atau README.** Bisa dibaca lewat Inspect Element.
9. **Host adalah Vercel, bukan GitHub Pages.** Jangan ikuti klaim lama.
10. **`javascript_tool` terpotong saat navigasi.** `location.reload()` di skrip yang sama membuang hasilnya; reload di panggilan terpisah, tunggu `DOMContentLoaded`. Service worker bisa menyajikan versi lama: cek `typeof namaFungsiBaru === 'function'` dulu.
11. **Console berisi "An unknown error occurred when fetching the script" dan 404 `bubi_watchlist`.** Yang pertama tidak mengganggu; yang kedua normal bila tabel belum dibuat.
12. **Trailer diblokir per negara (error 150).** `mountYouTube` pindah ke kandidat berikutnya. Browser pane bisa memutar YouTube; uji lewat log `message` dari origin youtube.
13. **Rating bisa `null` atau string.** Selalu lewat `parseRating()`; film yang ditonton satu orang tidak punya rating pihak lain.
14. **`requestAnimationFrame` dijeda di browser pane**, jadi `updateScrollUI` tidak terpicu saat uji. Panggil manual setelah `scrollTo`, dan ambil screenshot untuk memaksa frame.
15. **Pull-to-refresh hanya satu handler**: `initPullToRefresh`. Handler `touchend` kedua pernah membuat fetch dobel.
16. **Uji geser-tutup sheet** lewat `PointerEvent` sintetis di `[data-sheet-grab]` (`pointerdown`, beberapa `pointermove`, `pointerup`, `pointerType: 'touch'`). Geser >120 px, atau >30 px dengan kecepatan >0.5 px/ms, menutup; tarik ke atas memakai efek karet 0.25x.
17. **Kaca tidak terlihat?** `backdrop-filter` hanya tampak di atas konten berwarna; latar hitam polos tampak gelap. Header memakai `::before` untuk blur bermasker.
18. **`.certified-card` memakai tiga lapis `background`** (`padding-box` + `border-box`) untuk bingkai gradien. Jangan tambahkan `border-color` atau `background-color` Tailwind; akan menimpa bingkai. Lencana emas memakai `!important` agar tidak kalah oleh `shadow-*`.
19. **Offline:** `error-state` hanya tampil bila fetch gagal DAN `moviesData` kosong. Bila ada `bubi_movies_cache_v1`, film tetap tampil.

## iOS / iPhone (safe area)

- `env(safe-area-inset-*)` bernilai hanya bila viewport memuat `viewport-fit=cover`. Jangan hapus; tanpanya tab bar menimpa indikator Home.
- Tinggi header `4rem + env(safe-area-inset-top)` dipakai `body` padding-top, `scroll-padding-top` di `html`, dan `#toast-container`. Ubah ketiganya bersama; jangan pakai `scroll-mt-*` (terhitung dobel).
- Sheet memakai `dvh`, bukan `vh` (di Safari `vh` = viewport besar). Browser pane tidak meniru safe area; cek akhir di iPhone sungguhan.
