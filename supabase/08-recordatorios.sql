-- ============================================================
-- Repararlo · Recordatorios por email
-- ============================================================
-- Ejecutá una vez en: Supabase → SQL Editor → New query → Run
--
-- Agrega el seguimiento de recordatorios a la tabla de contactos, para
-- saber a quién y cuántas veces ya le recordamos que confirme/reseñe.
--
-- Hasta correrlo, la app funciona igual (no rompe nada).
-- ============================================================

alter table public.contacts
  add column if not exists client_reminder_count integer not null default 0;

alter table public.contacts
  add column if not exists last_reminder_at timestamptz;
