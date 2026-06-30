"use server";

import { revalidatePath } from "next/cache";
import { getServiceSupabase, createSupabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export type ProfileInput = {
  name: string;
  headline: string;
  province: string;
  city: string;
  serviceAreas: string; // separadas por coma
  about: string;
  skills: string; // separadas por coma
  priceFrom: string;
  priceUnit: "hora" | "visita" | "presupuesto";
  phone: string;
  available: boolean;
  categorySlugs: string[];
  photos: string[];
};

export type SaveResult = { ok: boolean; error?: string; slug?: string };

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveProfileAction(input: ProfileInput): Promise<SaveResult> {
  // 1. Verificar identidad
  const authClient = await createSupabaseServer();
  if (!authClient) return { ok: false, error: "Autenticación no configurada." };
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };

  const db = getServiceSupabase();
  if (!db) return { ok: false, error: "Base de datos no configurada." };

  // 2. Validaciones mínimas
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Ingresá tu nombre." };
  if (input.categorySlugs.length === 0)
    return { ok: false, error: "Elegí al menos un rubro." };

  // Aseguramos que exista la fila en "profiles" (no dependemos de triggers de SQL).
  // Es necesario porque professionals.profile_id apunta a profiles.id.
  await db
    .from("profiles")
    .upsert({ id: user.id, full_name: name, role: "professional" }, { onConflict: "id" });

  const priceFrom = input.priceFrom ? Number(input.priceFrom.replace(/[^0-9]/g, "")) : null;

  const fields = {
    name,
    headline: input.headline.trim() || null,
    province: input.province.trim() || null,
    city: input.city.trim() || null,
    service_areas: splitList(input.serviceAreas),
    about: input.about.trim() || null,
    skills: splitList(input.skills),
    price_from: priceFrom,
    price_unit: input.priceUnit,
    phone: input.phone.trim() || null,
    available: input.available,
    photos: (input.photos ?? []).filter(Boolean).slice(0, 12),
  };

  // 3. ¿Ya existe el profesional de este usuario?
  const { data: existing } = await db
    .from("professionals")
    .select("id, slug")
    .eq("profile_id", user.id)
    .maybeSingle();

  let proId: string;
  let slug: string;

  // Si la columna "photos" todavía no existe (no corrieron 03-fotos.sql),
  // reintentamos sin fotos para no romper el guardado del resto del perfil.
  const isMissingPhotos = (msg?: string) => !!msg && /photos/i.test(msg);
  const { photos: _omit, ...fieldsNoPhotos } = fields;
  void _omit;

  if (existing) {
    proId = existing.id;
    slug = existing.slug;
    let { error } = await db.from("professionals").update(fields).eq("id", proId);
    if (isMissingPhotos(error?.message)) {
      ({ error } = await db.from("professionals").update(fieldsNoPhotos).eq("id", proId));
    }
    if (error) return { ok: false, error: "No pudimos guardar los cambios." };
  } else {
    slug = `${slugify(name) || "profesional"}-${user.id.slice(0, 6)}`;
    let { data: inserted, error } = await db
      .from("professionals")
      .insert({ ...fields, profile_id: user.id, slug })
      .select("id")
      .single();
    if (isMissingPhotos(error?.message)) {
      ({ data: inserted, error } = await db
        .from("professionals")
        .insert({ ...fieldsNoPhotos, profile_id: user.id, slug })
        .select("id")
        .single());
    }
    if (error || !inserted) return { ok: false, error: "No pudimos crear tu perfil." };
    proId = inserted.id;
  }

  // 4. Actualizar rubros (relación N:M)
  await db.from("professional_categories").delete().eq("professional_id", proId);
  const rows = input.categorySlugs.map((category_slug) => ({
    professional_id: proId,
    category_slug,
  }));
  if (rows.length > 0) {
    await db.from("professional_categories").insert(rows);
  }

  // 5. Refrescar las páginas que muestran el directorio
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath(`/profesionales/${slug}`);

  return { ok: true, slug };
}

/** El profesional confirma que trabajó con un cliente (paso 2 de la confirmación mutua). */
export async function confirmHiringProAction(
  contactId: string
): Promise<{ ok: boolean; error?: string }> {
  const auth = await createSupabaseServer();
  if (!auth) return { ok: false, error: "Autenticación no configurada." };
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };

  const db = getServiceSupabase();
  if (!db) return { ok: false, error: "Base de datos no configurada." };

  // Traer el contacto y verificar que el profesional sea el dueño
  const { data: contact } = await db
    .from("contacts")
    .select("id, professionals(profile_id, slug)")
    .eq("id", contactId)
    .maybeSingle();
  if (!contact) return { ok: false, error: "No encontramos el contacto." };

  const proRel = Array.isArray(contact.professionals)
    ? contact.professionals[0]
    : contact.professionals;
  if (!proRel || proRel.profile_id !== user.id) {
    return { ok: false, error: "No autorizado." };
  }

  const { error } = await db
    .from("contacts")
    .update({ pro_confirmed: true })
    .eq("id", contactId);
  if (error) return { ok: false, error: "No pudimos confirmar." };

  revalidatePath("/panel");
  if (proRel.slug) revalidatePath(`/profesionales/${proRel.slug}`);
  return { ok: true };
}

/**
 * Elimina la cuenta del usuario logueado POR COMPLETO (cliente o profesional):
 * - sus reseñas escritas (y recalcula el rating de los profesionales afectados)
 * - su ficha de profesional, si tiene (cascada: rubros, reseñas recibidas, contactos)
 * - la cuenta de auth (cascada: profile, contactos como cliente)
 * Es irreversible.
 */
export async function deleteAccountAction(): Promise<{ ok: boolean; error?: string }> {
  const auth = await createSupabaseServer();
  if (!auth) return { ok: false, error: "Autenticación no configurada." };
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "No hay una sesión activa." };

  const db = getServiceSupabase();
  if (!db) return { ok: false, error: "Base de datos no configurada." };

  // 1. Reseñas que escribió (guardamos a qué pros afectó para recalcular)
  let affected: string[] = [];
  try {
    const { data: authored } = await db
      .from("reviews")
      .select("professional_id")
      .eq("author_id", user.id);
    affected = [...new Set((authored ?? []).map((r) => r.professional_id as string))];
    await db.from("reviews").delete().eq("author_id", user.id);
  } catch {
    /* sin reseñas o tabla ausente */
  }

  // 2. Sus fichas de profesional (cascada borra rubros, reseñas recibidas y contactos)
  let myProIds: string[] = [];
  try {
    const { data: myPros } = await db
      .from("professionals")
      .select("id")
      .eq("profile_id", user.id);
    myProIds = (myPros ?? []).map((p) => p.id as string);
    if (myProIds.length > 0) {
      await db.from("professionals").delete().eq("profile_id", user.id);
    }
  } catch {
    /* no es profesional */
  }

  // 3. Borrar la cuenta de auth (cascada: profile + contactos como cliente)
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: "No pudimos eliminar la cuenta. Probá de nuevo." };

  // 4. Recalcular rating de los pros que había reseñado (si no fueron borrados)
  for (const pid of affected) {
    if (myProIds.includes(pid)) continue;
    try {
      const { data: rows } = await db
        .from("reviews")
        .select("rating")
        .eq("professional_id", pid);
      const list = rows ?? [];
      const count = list.length;
      const avg = count ? list.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
      await db
        .from("professionals")
        .update({ rating: Math.round(avg * 10) / 10, review_count: count })
        .eq("id", pid);
    } catch {
      /* ignore */
    }
  }

  revalidatePath("/");
  revalidatePath("/buscar");
  return { ok: true };
}
