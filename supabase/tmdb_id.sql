-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
-- ID TMDB per film agar rekomendasi, sekuel, dan pencocokan "sudah ditonton" akurat.
-- tmdb_media = 'movie' atau 'tv'. RLS yang sudah ada tetap berlaku.
-- Tanpa kolom ini app memakai pencocokan judul + tahun. Film lama dilengkapi lewat tombol sinkron TMDB (admin).

alter table public.bubi_popcorn add column if not exists tmdb_id int;
alter table public.bubi_popcorn add column if not exists tmdb_media text;
