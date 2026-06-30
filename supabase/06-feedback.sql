-- ============================================================
-- Repararlo · Sugerencias y reportes (feedback anónimo)
-- ============================================================
-- Ejecutá una vez en: Supabase → SQL Editor → New query → Run
--
-- Guarda las sugerencias de mejora y los reportes de errores que deja
-- la gente (sin necesidad de cuenta). Los ves en la tabla `feedback`.
--
-- Hasta correrlo, el formulario funciona igual (modo demo: queda en los
-- logs del servidor), pero NO se guarda en la base.
-- ============================================================

create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  type        text not null default 'mejora' check (type in ('mejora', 'error')),
  message     text not null,
  page        text,
  email       text,
  status      text not null default 'nuevo' check (status in ('nuevo', 'revisado', 'resuelto')),
  created_at  timestamptz not null default now()
);

-- Solo el backend (service role) accede. Nadie puede leerlo desde el navegador.
alter table public.feedback enable row level security;
