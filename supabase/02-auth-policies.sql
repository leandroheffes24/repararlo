-- ============================================================
-- Repararlo · Autenticación: trigger de perfil + permisos (RLS)
-- ============================================================
-- Ejecutá este archivo DESPUÉS de schema.sql:
--   Supabase → SQL Editor → New query → pegar y Run
-- ============================================================

-- ----------------------------------------------------------------
-- 1) Crear automáticamente un "profile" cuando se registra un usuario
--    Lee full_name y role desde los metadatos del registro.
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- 2) Permisos por dueño (RLS)
--    La app escribe con service role (que ignora RLS), pero dejamos
--    estas políticas listas por seguridad y para escrituras directas.
-- ----------------------------------------------------------------

-- profiles: cada quien ve y edita SU perfil
drop policy if exists "perfil propio select" on public.profiles;
create policy "perfil propio select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "perfil propio update" on public.profiles;
create policy "perfil propio update" on public.profiles
  for update using (auth.uid() = id);

-- professionals: el dueño puede crear/editar su ficha
drop policy if exists "profesional propio insert" on public.professionals;
create policy "profesional propio insert" on public.professionals
  for insert with check (auth.uid() = profile_id);

drop policy if exists "profesional propio update" on public.professionals;
create policy "profesional propio update" on public.professionals
  for update using (auth.uid() = profile_id);

-- professional_categories: el dueño administra sus rubros
drop policy if exists "rubros propios escritura" on public.professional_categories;
create policy "rubros propios escritura" on public.professional_categories
  for all using (
    exists (
      select 1 from public.professionals p
      where p.id = professional_categories.professional_id
        and p.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.professionals p
      where p.id = professional_categories.professional_id
        and p.profile_id = auth.uid()
    )
  );

-- reviews: usuarios logueados pueden dejar reseñas firmadas con su id
drop policy if exists "reseñas insert autenticado" on public.reviews;
create policy "reseñas insert autenticado" on public.reviews
  for insert with check (auth.uid() = author_id);
