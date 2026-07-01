-- ============================================================
-- Repararlo · Reportes de perfiles
-- ============================================================
-- Ejecutá una vez en: Supabase → SQL Editor → New query → Run
--
-- Guarda los reportes que hacen los usuarios sobre un perfil
-- (perfil falso, estafa, datos incorrectos, etc.). Los revisás en la
-- tabla `reports` (Table Editor).
--
-- Hasta correrlo, el formulario funciona igual (no rompe nada).
-- ============================================================

create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  reporter_id     uuid references public.profiles(id) on delete set null,
  reason          text not null,
  comment         text,
  status          text not null default 'nuevo' check (status in ('nuevo', 'revisado', 'resuelto')),
  created_at      timestamptz not null default now()
);

create index if not exists reports_professional_idx on public.reports (professional_id);

-- Solo el backend (service role) accede.
alter table public.reports enable row level security;
