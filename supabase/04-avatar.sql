-- ============================================================
-- Repararlo · Foto de perfil (avatar)
-- ============================================================
-- Ejecutá una vez en: Supabase → SQL Editor → New query → Run
-- (el bucket 'avatares' ya está creado)
-- ============================================================

-- Avatar del profesional (se muestra en el directorio y su perfil)
alter table public.professionals
  add column if not exists avatar_url text;

-- Bucket público para las fotos de perfil (por si necesitás recrearlo)
insert into storage.buckets (id, name, public)
values ('avatares', 'avatares', true)
on conflict (id) do nothing;
