-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
-- Kolom kutipan favorit per film. RLS yang sudah ada (baca publik, tulis admin) tetap berlaku.
-- Selama kolom ini belum ada, app menyembunyikan kolom kutipan dan tetap berjalan normal.

alter table public.bubi_popcorn add column if not exists kutipan text;
