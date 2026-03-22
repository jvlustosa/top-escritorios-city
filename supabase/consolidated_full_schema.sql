/*
 * Espelho de: supabase/migrations/20260322140000_consolidated_escritorio_city.sql
 * (edite a migracao; copie para ca se quiser colar no SQL Editor a partir da raiz supabase/)
 */

create extension if not exists "pgcrypto";

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null,
  state text not null check (char_length(state) = 2),
  tier int not null default 1 check (tier between 1 and 5),
  verified boolean not null default false,
  chat_juridico_client boolean not null default false,
  logo_url text,
  is_plus boolean not null default false,
  description text,
  website_url text,
  oab_number text,
  email text,
  asaas_customer_id text unique,
  revenue numeric(12, 2),
  map_position_x real not null default 0,
  map_position_z real not null default 0,
  created_at timestamptz not null default now(),
  instagram_url text,
  linkedin_url text,
  practice_areas text[] not null default '{}',
  address text,
  latitude double precision,
  longitude double precision
);

create index if not exists idx_offices_slug on public.offices (slug);
create index if not exists idx_offices_city on public.offices (city);
create index if not exists idx_offices_ranking on public.offices (verified desc, revenue desc nulls last, created_at asc);

alter table public.offices enable row level security;

drop policy if exists "Service role can insert offices" on public.offices;
drop policy if exists "Service role can update offices" on public.offices;
drop policy if exists "Offices are publicly readable" on public.offices;
drop policy if exists "offices_select_public" on public.offices;

create policy "offices_select_public"
  on public.offices
  for select
  to anon, authenticated
  using (true);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  raw_user_meta_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users (email);

alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "users_select_own" on public.users;

create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

create or replace function public.handle_auth_user_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.users (id, email, full_name, avatar_url, raw_user_meta_data)
    values (
      new.id,
      new.email,
      coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name'
      ),
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at = now();
    return new;
  elsif tg_op = 'UPDATE' then
    update public.users
    set
      email = new.email,
      full_name = coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name'
      ),
      avatar_url = new.raw_user_meta_data->>'avatar_url',
      raw_user_meta_data = new.raw_user_meta_data,
      updated_at = now()
    where id = new.id;
    return new;
  elsif tg_op = 'DELETE' then
    delete from public.users where id = old.id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_auth_user_sync on auth.users;
create trigger on_auth_user_sync
  after insert or update or delete on auth.users
  for each row execute function public.handle_auth_user_sync();

insert into public.users (id, email, full_name, avatar_url, raw_user_meta_data)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'escritorio_directory') then
    create role escritorio_directory nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'escritorio_member') then
    create role escritorio_member nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'escritorio_service') then
    create role escritorio_service nologin;
  end if;
end $$;

comment on role escritorio_directory is 'Escritorio City: SELECT colunas publicas em public.offices (vitrine / mapa).';
comment on role escritorio_member is 'Escritorio City: herda directory + SELECT colunas membro em offices + SELECT public.users (RLS).';
comment on role escritorio_service is 'Escritorio City: CRUD public.offices e public.users (API / webhooks).';

grant usage on schema public to escritorio_directory, escritorio_member, escritorio_service;

grant select (
  id,
  name,
  slug,
  city,
  state,
  tier,
  verified,
  chat_juridico_client,
  is_plus,
  logo_url,
  description,
  website_url,
  instagram_url,
  linkedin_url,
  practice_areas,
  map_position_x,
  map_position_z,
  latitude,
  longitude,
  created_at
) on table public.offices to escritorio_directory;

grant escritorio_directory to escritorio_member;

grant select (email, oab_number, address, revenue) on table public.offices to escritorio_member;
grant select on table public.users to escritorio_member;

grant select, insert, update, delete on table public.offices to escritorio_service;
grant select, insert, update, delete on table public.users to escritorio_service;

revoke all on table public.offices from public;
revoke all on table public.users from public;

revoke all on table public.offices from anon, authenticated, service_role;
revoke all on table public.users from anon, authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;

grant escritorio_directory to anon;
grant escritorio_member to authenticated;
grant escritorio_service to service_role;

insert into public.offices (name, slug, city, state, tier, verified, chat_juridico_client, is_plus, description, website_url, revenue, map_position_x, map_position_z) values
  ('Machado Meyer Advogados',  'machado-meyer',          'São Paulo',      'SP', 5, true,  true,  false, null, null, 2800000,  0,    0),
  ('Pinheiro Neto Advogados',  'pinheiro-neto',          'São Paulo',      'SP', 5, true,  false, false, null, null, 2500000,  2.5,  0),
  ('Mattos Filho',             'mattos-filho',            'São Paulo',      'SP', 4, true,  true,  false, null, null, 1800000,  2.5,  2.5),
  ('TozziniFreire Advogados',  'tozzinifreire',           'São Paulo',      'SP', 4, true,  false, false, null, null, 1500000,  0,    2.5),
  ('Veirano Advogados',        'veirano',                 'Rio de Janeiro', 'RJ', 3, true,  false, false, null, null,  950000, -2.5,  2.5),
  ('Demarest Advogados',       'demarest',                'São Paulo',      'SP', 3, true,  true,  false, null, null,  900000, -2.5,  0),
  ('Lefosse Advogados',        'lefosse',                 'São Paulo',      'SP', 3, true,  false, false, null, null,  850000, -2.5, -2.5),
  ('Campos Mello Advogados',   'campos-mello',            'Rio de Janeiro', 'RJ', 2, true,  false, false, null, null,  450000,  0,   -2.5),
  ('Advocacia Regional Sul',   'advocacia-regional-sul',  'Porto Alegre',   'RS', 2, false, false, false, null, null, null,     2.5, -2.5),
  ('Escritório Nascimento',    'escritorio-nascimento',   'Belo Horizonte', 'MG', 1, false, false, false, null, null, null,     5,    0)
on conflict (slug) do nothing;
