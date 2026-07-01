-- ============================================================
-- Repararlo · Contactos + confirmación mutua (para validar reseñas)
-- ============================================================
-- Ejecutá una vez en: Supabase → SQL Editor → New query → Run
-- (es idempotente: podés correrlo aunque ya lo hayas corrido antes)
--
-- Qué hace: registra qué usuario contactó a qué profesional, y guarda
-- la confirmación de AMBAS partes de que hubo contratación. Una reseña
-- solo se permite cuando el cliente Y el profesional confirmaron.
--
-- Hasta correrlo, las reseñas funcionan SIN este filtro (no se rompe nada).
-- ============================================================

create table if not exists public.contacts (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references public.professionals(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  client_confirmed boolean not null default false,
  pro_confirmed    boolean not null default false,
  client_declined  boolean not null default false,
  pro_declined     boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (professional_id, client_id)
);

-- Por si la tabla ya existía sin estas columnas:
alter table public.contacts add column if not exists client_confirmed boolean not null default false;
alter table public.contacts add column if not exists pro_confirmed    boolean not null default false;
alter table public.contacts add column if not exists client_declined  boolean not null default false;
alter table public.contacts add column if not exists pro_declined     boolean not null default false;

-- Solo el backend (service role) lee/escribe esta tabla.
alter table public.contacts enable row level security;
