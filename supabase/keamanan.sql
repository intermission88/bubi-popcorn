-- Keamanan dan validasi data. Jalankan sekali di Supabase SQL Editor (aman diulang).
-- 1. Hanya akun admin yang boleh menulis, bukan sekadar akun yang login.
-- 2. Database menolak nilai yang tidak dikenal aplikasi.
-- 3. Index untuk urutan antrean.
-- Prasyarat: kolom dari season.sql, tmdb_id.sql, kutipan.sql dan tabel dari watchlist.sql sudah ada.

-- ---------- 1. RLS: baca publik, tulis khusus admin ----------
alter table public.bubi_popcorn enable row level security;
alter table public.bubi_watchlist enable row level security;

-- Hapus semua policy lama apa pun namanya. Policy digabung dengan OR,
-- jadi satu policy longgar yang tertinggal akan membatalkan yang ketat.
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('bubi_popcorn', 'bubi_watchlist')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- Email harus sama dengan ADMIN_EMAIL di index.html.
create policy popcorn_baca on public.bubi_popcorn
  for select using (true);
create policy popcorn_tulis_admin on public.bubi_popcorn
  for all to authenticated
  using ((select auth.jwt() ->> 'email') = 'admin@bubipopcorn.app')
  with check ((select auth.jwt() ->> 'email') = 'admin@bubipopcorn.app');

create policy watchlist_baca on public.bubi_watchlist
  for select using (true);
create policy watchlist_tulis_admin on public.bubi_watchlist
  for all to authenticated
  using ((select auth.jwt() ->> 'email') = 'admin@bubipopcorn.app')
  with check ((select auth.jwt() ->> 'email') = 'admin@bubipopcorn.app');

-- ---------- 2. Validasi nilai kolom ----------
alter table public.bubi_popcorn drop constraint if exists cek_watched_by;
alter table public.bubi_popcorn add constraint cek_watched_by
  check (watched_by is null or watched_by in ('both', 'zald', 'micel'));

alter table public.bubi_popcorn drop constraint if exists cek_tmdb_media;
alter table public.bubi_popcorn add constraint cek_tmdb_media
  check (tmdb_media is null or tmdb_media in ('movie', 'tv'));

alter table public.bubi_popcorn drop constraint if exists cek_season;
alter table public.bubi_popcorn add constraint cek_season
  check (season is null or season between 1 and 99);

-- Rating disimpan sebagai teks: kosong, 'N/A', atau angka 0-10 (boleh satu desimal lebih).
alter table public.bubi_popcorn drop constraint if exists cek_rating;
-- CASE dipakai karena Postgres tidak menjamin urutan evaluasi AND (cast 'N/A' bisa error).
alter table public.bubi_popcorn add constraint cek_rating check (
  (case
    when rating_aku is null or rating_aku in ('', 'N/A') then true
    when rating_aku ~ '^\d+(\.\d+)?$' then rating_aku::numeric between 0 and 10
    else false end)
  and
  (case
    when rating_dia is null or rating_dia in ('', 'N/A') then true
    when rating_dia ~ '^\d+(\.\d+)?$' then rating_dia::numeric between 0 and 10
    else false end)
);

-- Bulan selalu YYYY-MM.
alter table public.bubi_popcorn drop constraint if exists cek_bulan;
alter table public.bubi_popcorn add constraint cek_bulan
  check (bulan is null or bulan ~ '^\d{4}-(0[1-9]|1[0-2])$');

-- ---------- 3. Index ----------
create index if not exists bubi_watchlist_created_at_idx
  on public.bubi_watchlist (created_at desc);
