-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
-- Kolom season untuk series (mis. 2 = Season 2). Kosong = film atau series tanpa season.
-- RLS yang sudah ada (baca publik, tulis admin) tetap berlaku. Tanpa kolom ini fitur season tersembunyi.

alter table public.bubi_popcorn add column if not exists season int;
