-- Create offices table
create table public.offices (
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
  revenue numeric(12,2),
  map_position_x real not null default 0,
  map_position_z real not null default 0,
  created_at timestamptz not null default now()
);

-- Index for slug lookups
create index idx_offices_slug on public.offices (slug);

-- Index for city filtering
create index idx_offices_city on public.offices (city);

-- RLS policies
alter table public.offices enable row level security;

-- Anyone can read offices
create policy "Offices are publicly readable"
  on public.offices for select
  using (true);

-- Only service role can insert/update (via API routes)
create policy "Service role can insert offices"
  on public.offices for insert
  with check (true);

create policy "Service role can update offices"
  on public.offices for update
  using (true);

-- Index for ranking query
create index idx_offices_ranking on public.offices (verified desc, revenue desc nulls last, created_at asc);

-- Seed mock data
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
  ('Escritório Nascimento',    'escritorio-nascimento',   'Belo Horizonte', 'MG', 1, false, false, false, null, null, null,     5,    0);
