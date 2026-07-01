-- ============================================================
-- Repararlo · Notificaciones in-app
-- ============================================================
-- Ejecutá una vez en: Supabase → SQL Editor → New query → Run
--
-- Guarda los avisos para cada usuario (ej: "X confirmó que trabajaron
-- juntos", "te contactaron", "te dejaron una reseña").
--
-- Hasta correrlo, la app funciona igual pero sin notificaciones (no rompe nada).
-- ============================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- Solo el backend (service role) accede.
alter table public.notifications enable row level security;
