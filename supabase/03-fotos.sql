-- ============================================================
-- Repararlo · Fotos de trabajos
-- ============================================================
-- Ejecutá este archivo en: Supabase → SQL Editor → New query → Run
-- (el bucket de almacenamiento 'trabajos' ya está creado)
-- ============================================================

-- Columna para guardar las URLs de las fotos de cada profesional
alter table public.professionals
  add column if not exists photos text[] not null default '{}';

-- Bucket público para las fotos (por si necesitás recrearlo)
insert into storage.buckets (id, name, public)
values ('trabajos', 'trabajos', true)
on conflict (id) do nothing;
