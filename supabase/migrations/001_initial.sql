create table public.profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  username  text unique not null,
  email     text,
  avatar_url text,
  bio       text,
  created_at timestamptz default now()
);

create table public.mods (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  name             text not null,
  description      text,
  category         text,
  game             text,
  game_version     text,
  version          text default '1.0.0',
  changelog        text,
  file_url         text,
  cover_image_url  text,
  download_count   integer default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table public.download_logs (
  id            bigserial primary key,
  mod_id        uuid references public.mods(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete set null,
  downloaded_at timestamptz default now()
);

alter table public.profiles      enable row level security;
alter table public.mods          enable row level security;
alter table public.download_logs enable row level security;

create policy "profiles_read"   on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create policy "mods_read"   on public.mods for select using (true);
create policy "mods_insert" on public.mods for insert with check (auth.uid() = user_id);
create policy "mods_update" on public.mods for update using (auth.uid() = user_id);
create policy "mods_delete" on public.mods for delete using (auth.uid() = user_id);

create policy "logs_insert" on public.download_logs for insert with check (true);
create policy "logs_select" on public.download_logs for select using (auth.uid() = user_id);

create index mods_user_idx      on public.mods(user_id);
create index mods_category_idx  on public.mods(category);
create index mods_game_idx      on public.mods(game);
create index mods_downloads_idx on public.mods(download_count desc);
create index logs_mod_idx       on public.download_logs(mod_id);
create index logs_time_idx      on public.download_logs(downloaded_at desc);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger mods_updated_at before update on public.mods
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, split_part(new.email, '@', 1), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.increment_download(mod_id_input uuid)
returns void language sql security definer as $$
  update public.mods
  set download_count = download_count + 1
  where id = mod_id_input;
$$;

-- ── STORAGE BUCKETS (run separately or via dashboard) ────────
-- insert into storage.buckets (id, name, public) values ('mod-assets', 'mod-assets', true);
-- create policy "public_read" on storage.objects for select using (bucket_id = 'mod-assets');
-- create policy "auth_upload" on storage.objects for insert with check (bucket_id = 'mod-assets' and auth.role() = 'authenticated');
-- create policy "owner_delete" on storage.objects for delete using (bucket_id = 'mod-assets' and auth.uid()::text = (storage.foldername(name))[2]);
