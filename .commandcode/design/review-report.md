# Bubi's Popcorn — Overall Website Review

**Mode:** Design review  
**Date:** 2026-09-10  
**Score:** **31/50**  
**Verdict:** **Block**

## TL;DR

Bubi's Popcorn punya identitas personal yang kuat: nuansa bioskop, palet amber–pink–sky, poster nyata, dan storytelling Zald–Micel terasa spesifik, bukan template generik. Namun, pengalaman belum siap dianggap selesai karena alur keyboard terputus, beberapa kontrol tidak bernama, zoom dinonaktifkan, modal tidak memiliki perilaku aksesibel, dan tombol tutup tertutup tombol bagikan pada modal detail.

**Prioritas pertama:** jalankan pass `/design a11y` untuk memperbaiki semantik dan keyboard, kemudian `/design responsive` untuk komposisi desktop dan kepadatan 320 px.

## First impression

Dalam beberapa detik, kategori dan karakter produknya jelas: arsip film pasangan dengan bahasa visual bioskop. Bagian “Now Showing” adalah anchor yang paling memorable. Di mobile tampilannya terasa authored dan hangat; di desktop, kolom `max-w-md` membuat produk terlihat seperti preview aplikasi yang diletakkan di tengah kanvas kosong, bukan pengalaman web yang sengaja dikomposisikan untuk layar lebar.

## Heuristic scores

| # | Lens | Score | Key finding |
|---|---|---:|---|
| 1 | First impression | 8/10 | Identitas cinema-log langsung terbaca dan terasa personal |
| 2 | Hierarchy | 7/10 | Alur hero → relationship → search → archive jelas, tetapi banyak micro-copy bersaing pada 320 px |
| 3 | Color voice | 8/10 | Amber, sky, dan pink punya peran konsisten; dark canvas cocok dengan domain |
| 4 | Type voice | 5/10 | Display face memberi karakter, tetapi teks 8–11 px terlalu dominan dan melelahkan |
| 5 | Interaction feel | 3/10 | Touch flow kaya, tetapi keyboard, modal, naming, dan error recovery belum lengkap |
| | **Total** | **31/50** | |

## What's working

- **Art direction spesifik.** Film strip, ticket treatment, chapter bulanan, poster, dan copy “Now Showing” membangun satu dunia visual yang konsisten.
- **Primary browsing flow mudah dipahami.** Search, filter viewer, Top 9+, kelompok bulan, dan kartu film berada dalam urutan yang masuk akal.
- **Data terasa personal.** Dual clocks, relationship counter, rating terpisah, dan review Zald/Micel memberi bukti nyata bahwa ini bukan katalog film generik.
- **State dasar sudah dipikirkan.** Skeleton, empty state, toast, poster fallback, konfirmasi hapus, serta reduced-motion parsial sudah tersedia.
- **Mobile overflow dasar aman.** Pengukuran Brave pada 320 px menunjukkan `scrollWidth` sama dengan viewport, jadi tidak ada horizontal page overflow global.

## Priority findings

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | Interaction | `index.html:811–821` | Tombol tutup dan bagikan sama-sama `absolute top-3 right-3`; Brave mengukur keduanya di `x=276, y=254, 32×32` pada viewport 320 px | Pindahkan tombol bagikan ke posisi terpisah atau gabungkan aksi dalam toolbar yang tidak overlap; pertahankan label aksesibel | Tombol bagikan menutup tombol tutup, sehingga kontrol penting tersembunyi dan klik menjadi ambigu |
| 2 | HIGH | Accessibility | `index.html:1405–1415` | Kartu film dibuat sebagai `<div>` dengan `onclick`, tanpa `tabindex`, role, atau handler keyboard | Render sebagai `<button>`/`<a>` yang bernama, atau terapkan pola keyboard lengkap dengan `tabindex="0"`, Enter, dan Space | Alur utama membuka detail bisa dilakukan dengan mouse/touch tetapi tidak dengan keyboard |
| 3 | HIGH | Accessibility | `index.html:236–239`, `281–285`, `327–360` | Ping, lima dot slider, dan blok Showtimes memakai `<div>/<span onclick>`; dot juga tidak memiliki nama | Gunakan `<button>` asli dengan accessible name dan state (`aria-current` untuk slide aktif) | Brave menemukan tujuh kontrol pointer-only; beberapa tidak diumumkan sama sekali |
| 4 | HIGH | Accessibility | `index.html:408–412`, `649–650`, `751–765`, `777–791` | Search dan password hanya memakai placeholder; rating/review tidak terhubung ke `<label for>` yang spesifik | Tambahkan label programatik yang selalu tersedia; placeholder hanya menjadi contoh input | Placeholder sedang melakukan pekerjaan label, termasuk pada data dan autentikasi |
| 5 | HIGH | Accessibility | `index.html:5` | Viewport memakai `maximum-scale=1.0, user-scalable=no` | Hapus dua pembatas tersebut dan pastikan layout bertahan pada zoom 200% | Pinch-to-zoom dinonaktifkan bagi pengguna low vision |
| 6 | HIGH | Accessibility | `index.html:596–658`, `661–803`, `805–885`, `1567–1723` | Modal berupa `<div>` biasa; fokus hanya dipindah pada sebagian modal, tanpa trap, `aria-modal`, inert background, Escape, atau restore yang konsisten | Gunakan `<dialog>` atau pola modal lengkap: name, trap, Escape, inert background, initial focus, dan restore focus ke trigger | Fokus dapat keluar ke halaman di belakang dan konteks pembaca layar tidak berubah saat modal terbuka |
| 7 | HIGH | Accessibility | `index.html:241–243`, `410–418`, `422–429`, `577–590`, `759–788` | Banyak target aktif berukuran di bawah 44×44 px; Brave mengukur lock 36×36, refresh 40×18, filter sekitar 28–30 px tinggi, slider 8×8 | Pertahankan visual compact bila perlu, tetapi perluas hit area minimum 44×44 px dan beri jarak antartarget | Risiko salah tekan tinggi pada aplikasi mobile-first, khususnya di viewport 320 px |
| 8 | MEDIUM | Responsive | `index.html:218`, `249`, `807` | Seluruh konten utama dikunci ke `max-w-md` pada semua ukuran | Pada layar lebar, ubah menjadi komposisi eksplorasi 2 kolom: identity/status yang sticky dan archive yang lebih luas; modal boleh tetap terukur | Screenshot 1440 px menyisakan sebagian besar kanvas kosong dan membatasi scanning koleksi |
| 9 | MEDIUM | Type | `index.html:227–229`, `293–315`, `337–357`, `437–450`, `1419–1482` | Informasi penting berulang kali ditampilkan pada 8–11 px dengan tracking lebar | Naikkan body/meta penting ke 12–14 px, kurangi tracking pada kalimat, dan simpan 9–10 px hanya untuk detail tersier | Di 320 px, identitas tetap jelas tetapi micro-copy membutuhkan usaha baca tinggi |
| 10 | MEDIUM | Interaction | `index.html:1347–1361`, `1494–1500` | Kegagalan Supabase hanya dicatat ke console, lalu UI masuk ke empty state yang sama dengan hasil filter kosong | Tampilkan state error tersendiri dengan alasan singkat dan aksi “Coba lagi”; pertahankan data lama bila tersedia | Pengguna tidak bisa membedakan “belum ada film” dari “server gagal dimuat” |
| 11 | MEDIUM | Interaction | `index.html:917–951`, `204–211`, `279–285` | Carousel berjalan otomatis tiap 3,5 detik; reduced motion mematikan marquee tetapi tidak timer/transform hero, dan tidak ada pause | Hentikan autoplay saat reduced motion aktif, sediakan pause, dan umumkan slide aktif tanpa memindahkan fokus | Konten bergerak tanpa kontrol dan implementasi reduced motion belum mencakup perilaku JavaScript |
| 12 | LOW | Writing | `index.html:293–315`, `436–465`, `539–568` | Bahasa Indonesia dan Inggris bercampur dalam label produk: “Now Showing”, “updated daily”, “Total Movies Watched” | Pilih aturan bahasa: Indonesia sebagai UI utama, Inggris hanya sebagai art-direction label yang konsisten | Voice terasa charming, tetapi register belum sepenuhnya rapi |

## Cognitive load and risk

**Level: tinggi pada interaksi, sedang pada visual.**

- **PASS:** pengguna touch dapat memahami kategori, mencari, memfilter, dan membuka detail dengan cepat.
- **PASS:** warna tiap reviewer konsisten dan disertai nama, sehingga bukan bergantung pada hue saja.
- **WATCH:** jumlah ornament, micro-copy, badge, ticker, clock, dan motion membuat viewport 320 px padat.
- **FAIL:** primary detail flow tidak bisa diselesaikan dengan keyboard.
- **FAIL:** kontrol close/share bertumpuk di modal detail.

## Recommended sequence

1. **`/design a11y`** — perbaiki native semantics, labels, modal focus model, zoom, focus-visible, dan hit area.
2. **`/design responsive`** — buat komposisi desktop yang memanfaatkan lebar dan rapikan kepadatan 320 px.
3. **`/design typeset`** — naikkan ukuran micro-copy penting dan sederhanakan hierarchy metadata.
4. **`/design interaction`** — bedakan loading/empty/error, lengkapi carousel controls, dan state tombol async.
5. **`/design finish`** — konsistensi bahasa, detail spacing, dan QA akhir lintas viewport.

## Considered but rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `index.html:97–104` | Hilangkan gradient amber | Gradient mendukung identitas popcorn/cinema dan dipakai cukup terarah untuk perhatian |
| `index.html:92–96`, `1408–1410` | Sederhanakan certified card menjadi card biasa | Treatment khusus memberi makna dan hierarchy yang sah, bukan dekorasi tanpa fungsi |
| `index.html:421–430`, `1532–1537` | Hilangkan horizontal scrolling | Pada mobile, filter chips dan rak film memang artifact yang tepat untuk swipe; masalahnya hit area dan affordance, bukan pola scroll |
| `index.html:204–211` | Laporkan tidak adanya reduced motion | Implementasi parsial memang ada dan mencakup beberapa animasi CSS; temuan dibatasi pada hero autoplay yang belum tercakup |

## Verification

**Passed**

- Brave renderer screenshot: 320×900, 375×900, dan 1440×1000.
- Brave DOM measurement pada 320 px: viewport/document width `320/320`, tidak ada page-level horizontal overflow.
- Brave DOM measurement: enumerasi fokus, accessible names, target aktif, dan kontrol pointer-only.
- Primary flow: data Supabase termuat, movie card dibuka, dan detail modal ditampilkan.
- Modal measurement: tombol close dan share terbukti memiliki koordinat serta ukuran identik.
- Source inspection berbatas pada `index.html` untuk menautkan seluruh finding ke baris implementasi.

**Not verified**

- Screen-reader announcement aktual dengan VoiceOver.
- Admin create/edit/delete end-to-end, karena audit tidak boleh mengubah data Supabase.
- Perilaku PWA offline setelah install.
- Simulasi color-vision deficiency dan pengukuran contrast pixel-by-pixel.

## Verdict

**Block** — masih ada beberapa temuan HIGH, terutama kontrol modal yang overlap, primary card flow tanpa keyboard, modal focus model yang tidak lengkap, label yang hilang, zoom yang dibatasi, dan target sentuh kecil.
