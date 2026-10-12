-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
-- Tabel antrean film "Mau Ditonton". Publik boleh baca, hanya akun login (admin) boleh tulis.

create table if not exists public.bubi_watchlist (
  id         text primary key,
  judul      text not null,
  tahun      int,
  poster     text,
  created_at timestamptz not null default now()
);

alter table public.bubi_watchlist enable row level security;

drop policy if exists "watchlist_read" on public.bubi_watchlist;
create policy "watchlist_read" on public.bubi_watchlist
  for select using (true);

drop policy if exists "watchlist_write" on public.bubi_watchlist;
create policy "watchlist_write" on public.bubi_watchlist
  for all to authenticated using (true) with check (true);
