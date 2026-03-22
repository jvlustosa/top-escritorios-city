-- Create firms table
create table public.firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null,
  state text not null check (char_length(state) = 2),
  tier int not null default 1 check (tier between 1 and 5),
  verified boolean not null default false,
  chat_juridico_client boolean not null default false,
  logo_url text,
  oab_number text,
  email text,
  asaas_customer_id text unique,
  created_at timestamptz not null default now()
);

-- Index for slug lookups
create index idx_firms_slug on public.firms (slug);

-- Index for city filtering
create index idx_firms_city on public.firms (city);

-- RLS policies
alter table public.firms enable row level security;

-- Anyone can read firms
create policy "Firms are publicly readable"
  on public.firms for select
  using (true);

-- Only service role can insert/update (via API routes)
create policy "Service role can insert firms"
  on public.firms for insert
  with check (true);

create policy "Service role can update firms"
  on public.firms for update
  using (true);

-- Seed mock data
insert into public.firms (name, slug, city, state, tier, verified, chat_juridico_client) values
  ('Machado Meyer Advogados',  'machado-meyer',          'São Paulo',      'SP', 5, true,  true),
  ('Pinheiro Neto Advogados',  'pinheiro-neto',          'São Paulo',      'SP', 5, true,  false),
  ('Mattos Filho',             'mattos-filho',            'São Paulo',      'SP', 4, true,  true),
  ('TozziniFreire Advogados',  'tozzinifreire',           'São Paulo',      'SP', 4, true,  false),
  ('Veirano Advogados',        'veirano',                 'Rio de Janeiro', 'RJ', 3, true,  false),
  ('Demarest Advogados',       'demarest',                'São Paulo',      'SP', 3, true,  true),
  ('Lefosse Advogados',        'lefosse',                 'São Paulo',      'SP', 3, true,  false),
  ('Campos Mello Advogados',   'campos-mello',            'Rio de Janeiro', 'RJ', 2, true,  false),
  ('Advocacia Regional Sul',   'advocacia-regional-sul',  'Porto Alegre',   'RS', 2, false, false),
  ('Escritório Nascimento',    'escritorio-nascimento',   'Belo Horizonte', 'MG', 1, false, false);
