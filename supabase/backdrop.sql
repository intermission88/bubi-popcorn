-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
-- Kolom URL gambar landscape (backdrop TMDB) untuk tampilan landscape.
-- RLS yang sudah ada (baca publik, tulis admin) tetap berlaku. Tanpa kolom ini, mode landscape
-- memakai poster yang dipotong, dan pengisian backdrop lewat sinkron admin tidak tersedia.

alter table public.bubi_popcorn add column if not exists backdrop text;
