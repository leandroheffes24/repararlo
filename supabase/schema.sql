-- ============================================================
-- Repararlo · Esquema de base de datos (Supabase / PostgreSQL)
-- ============================================================
-- Cómo usarlo:
--   1. Entrá a tu proyecto en https://supabase.com
--   2. Abrí "SQL Editor" → "New query"
--   3. Pegá TODO este archivo y ejecutá (Run)
-- ============================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- RUBROS / CATEGORÍAS
-- ----------------------------------------------------------------
create table if not exists public.categories (
  slug        text primary key,
  name        text not null,
  singular    text not null,
  icon        text,
  description text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- PERFILES (extiende auth.users de Supabase)
-- role: 'client' | 'professional'
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'client' check (role in ('client', 'professional')),
  phone       text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- PROFESIONALES
-- ----------------------------------------------------------------
create table if not exists public.professionals (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid references public.profiles(id) on delete set null,
  slug             text unique not null,
  name             text not null,
  headline         text,
  province         text,
  city             text,
  service_areas    text[] default '{}',
  about            text,
  skills           text[] default '{}',
  price_from       integer,
  price_unit       text check (price_unit in ('hora', 'visita', 'presupuesto')),
  phone            text,
  years_experience integer default 0,
  verified         boolean not null default false,
  available        boolean not null default true,
  rating           numeric(2,1) not null default 0,
  review_count     integer not null default 0,
  jobs_done        integer not null default 0,
  created_at       timestamptz not null default now()
);

-- Relación N:M profesional ↔ rubro
create table if not exists public.professional_categories (
  professional_id uuid references public.professionals(id) on delete cascade,
  category_slug   text references public.categories(slug) on delete cascade,
  primary key (professional_id, category_slug)
);

-- ----------------------------------------------------------------
-- RESEÑAS
-- ----------------------------------------------------------------
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  author_id       uuid references public.profiles(id) on delete set null,
  author_name     text not null,
  rating          integer not null check (rating between 1 and 5),
  comment         text,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- SOLICITUDES DE ALTA (formulario "Sumate como profesional")
-- Esta tabla es la que usa la app HOY (route /api/solicitudes).
-- ----------------------------------------------------------------
create table if not exists public.professional_applications (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null,
  service_area text not null,
  phone        text not null,
  about        text,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY (seguridad por filas)
-- ----------------------------------------------------------------
alter table public.categories                enable row level security;
alter table public.professionals             enable row level security;
alter table public.professional_categories   enable row level security;
alter table public.reviews                   enable row level security;
alter table public.professional_applications enable row level security;
alter table public.profiles                  enable row level security;

-- Lectura pública del catálogo (cualquiera puede ver rubros y profesionales)
drop policy if exists "lectura publica categorias" on public.categories;
create policy "lectura publica categorias" on public.categories
  for select using (true);

drop policy if exists "lectura publica profesionales" on public.professionals;
create policy "lectura publica profesionales" on public.professionals
  for select using (true);

drop policy if exists "lectura publica relacion rubros" on public.professional_categories;
create policy "lectura publica relacion rubros" on public.professional_categories
  for select using (true);

drop policy if exists "lectura publica reseñas" on public.reviews;
create policy "lectura publica reseñas" on public.reviews
  for select using (true);

-- Las solicitudes solo las maneja el backend (service role key, que ignora RLS).
-- No habilitamos políticas públicas: nadie puede leerlas desde el navegador.

-- ----------------------------------------------------------------
-- SEED: rubros iniciales
-- ----------------------------------------------------------------
insert into public.categories (slug, name, singular, icon, description) values
  ('plomeria',          'Plomería',                      'plomero',             '🔧', 'Destapaciones, pérdidas, canillas, termotanques e instalaciones.'),
  ('electricidad',      'Electricidad',                  'electricista',        '⚡', 'Instalaciones, tableros, cortocircuitos y artefactos.'),
  ('albanileria',       'Albañilería',                   'albañil',             '🧱', 'Construcción, revoques, contrapisos y reparaciones.'),
  ('gas',               'Gasista matriculado',           'gasista',             '🔥', 'Instalaciones de gas, estufas, calefones y certificaciones.'),
  ('pintura',           'Pintura',                       'pintor',              '🎨', 'Interior, exterior, impermeabilización y empapelado.'),
  ('carpinteria',       'Carpintería',                   'carpintero',          '🪚', 'Muebles a medida, placards, puertas y reparaciones.'),
  ('aire-acondicionado','Aire acondicionado',            'técnico de aires',    '❄️', 'Instalación, carga de gas, service y limpieza de splits.'),
  ('cerrajeria',        'Cerrajería',                    'cerrajero',           '🔑', 'Aperturas, cambio de cerraduras y llaves de seguridad.'),
  ('jardineria',        'Jardinería',                    'jardinero',           '🌳', 'Corte de césped, poda, parquización y mantenimiento.'),
  ('limpieza',          'Limpieza',                      'personal de limpieza','🧹', 'Limpieza de hogar, fin de obra, tapizados y vidrios.'),
  ('mudanzas-fletes',   'Mudanzas y fletes',             'fletero',             '🚚', 'Mudanzas, fletes, traslados y embalaje.'),
  ('herreria',          'Herrería',                      'herrero',             '🔩', 'Rejas, portones, estructuras y soldaduras.'),
  ('techista',          'Techista',                      'techista',            '🏠', 'Techos, membranas, zinguería y filtraciones.'),
  ('durlock',           'Durlock / Construcción en seco','durlockero',          '🪛', 'Cielorrasos, tabiques, divisiones y revestimientos.'),
  ('electrodomesticos', 'Service de electrodomésticos',  'técnico',             '🛠️', 'Heladeras, lavarropas, hornos y electrodomésticos.'),
  ('pisos-ceramica',    'Pisos y cerámica',              'colocador',           '🟫', 'Colocación de pisos, porcelanato, cerámica y pulido.'),
  ('fumigacion',        'Control de plagas',             'fumigador',           '🐜', 'Fumigación, desratización y control de plagas.'),
  ('vidrieria',         'Vidriería',                     'vidriero',            '🪟', 'Vidrios, espejos, mamparas y cerramientos.')
on conflict (slug) do nothing;