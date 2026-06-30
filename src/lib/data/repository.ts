import type { Professional, Review } from "@/lib/types";
import { professionals as seedProfessionals } from "@/lib/data/professionals";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Capa de acceso a datos del directorio.
 *
 * Estrategia: si hay profesionales reales en Supabase, se usan esos.
 * Si la base está vacía o no está configurada, se usan los datos de
 * ejemplo (seed) para que el sitio nunca se vea vacío.
 *
 * Todas las consultas son "best effort": ante cualquier error, caen al seed.
 */

type ProRow = {
  id: string;
  profile_id: string | null;
  slug: string;
  name: string;
  headline: string | null;
  province: string | null;
  city: string | null;
  service_areas: string[] | null;
  about: string | null;
  skills: string[] | null;
  price_from: number | null;
  price_unit: string | null;
  phone: string | null;
  years_experience: number | null;
  verified: boolean | null;
  available: boolean | null;
  rating: number | null;
  review_count: number | null;
  jobs_done: number | null;
  photos: string[] | null;
  avatar_url: string | null;
  professional_categories?: { category_slug: string }[] | null;
};

function hueFrom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

function mapRow(row: ProRow, reviews: Review[] = []): Professional {
  return {
    id: row.id,
    ownerId: row.profile_id ?? undefined,
    slug: row.slug,
    name: row.name,
    headline: row.headline ?? "",
    categorySlugs: (row.professional_categories ?? []).map((c) => c.category_slug),
    province: row.province ?? "",
    city: row.city ?? "",
    serviceAreas: row.service_areas ?? [],
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    jobsDone: row.jobs_done ?? 0,
    yearsExperience: row.years_experience ?? 0,
    verified: Boolean(row.verified),
    priceFrom: row.price_from ?? undefined,
    priceUnit: (row.price_unit as Professional["priceUnit"]) ?? "presupuesto",
    about: row.about ?? "",
    skills: row.skills ?? [],
    avatarHue: hueFrom(row.id),
    avatarUrl: row.avatar_url ?? undefined,
    phone: row.phone ?? "",
    respondsIn: "Suele responder pronto",
    available: row.available ?? true,
    photos: row.photos ?? [],
    reviews,
  };
}

export async function getProfessionals(): Promise<Professional[]> {
  const supabase = getServiceSupabase();
  if (!supabase) return seedProfessionals;

  try {
    const { data, error } = await supabase
      .from("professionals")
      .select("*, professional_categories(category_slug)")
      .order("verified", { ascending: false })
      .order("rating", { ascending: false });

    if (error || !data || data.length === 0) return seedProfessionals;
    return (data as ProRow[]).map((row) => mapRow(row));
  } catch {
    return seedProfessionals;
  }
}

export async function getProfessionalsByCategory(
  categorySlug: string
): Promise<Professional[]> {
  const all = await getProfessionals();
  return all.filter((p) => p.categorySlugs.includes(categorySlug));
}

export async function getProfessionalBySlug(
  slug: string
): Promise<Professional | null> {
  const supabase = getServiceSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*, professional_categories(category_slug)")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        const { data: reviewRows } = await supabase
          .from("reviews")
          .select("*")
          .eq("professional_id", (data as ProRow).id)
          .order("created_at", { ascending: false });

        const reviews: Review[] = (reviewRows ?? []).map((r) => ({
          id: r.id,
          author: r.author_name,
          rating: r.rating,
          date: r.created_at,
          comment: r.comment ?? "",
        }));

        return mapRow(data as ProRow, reviews);
      }
    } catch {
      // cae al seed
    }
  }

  return seedProfessionals.find((p) => p.slug === slug) ?? null;
}

/** Devuelve la fila cruda del profesional dueño de un perfil (para el panel). */
export async function getProfessionalRowByProfileId(
  profileId: string
): Promise<ProRow | null> {
  const supabase = getServiceSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("professionals")
      .select("*, professional_categories(category_slug)")
      .eq("profile_id", profileId)
      .maybeSingle();
    return (data as ProRow) ?? null;
  } catch {
    return null;
  }
}

/**
 * ¿Puede este usuario reseñar a este profesional?
 * Regla (confirmación mutua): el cliente Y el profesional confirmaron la
 * contratación en la tabla `contacts`.
 * Si la tabla/columnas todavía no existen (no corrieron 05-contactos.sql),
 * el filtro queda desactivado (fail-open) para no romper las reseñas.
 *
 * Estados:
 * - "open": filtro desactivado (sin tabla) → puede reseñar.
 * - "need-client-confirm": falta que el cliente confirme que lo contrató.
 * - "waiting-pro": el cliente confirmó, falta el profesional.
 * - "ok": ambos confirmaron → puede reseñar.
 */
export type ReviewEligibility = {
  canReview: boolean;
  state: "open" | "need-client-confirm" | "waiting-pro" | "ok";
};

export async function getReviewEligibility(
  professionalId: string,
  userId: string
): Promise<ReviewEligibility> {
  const db = getServiceSupabase();
  if (!db) return { canReview: true, state: "open" };
  const { data, error } = await db
    .from("contacts")
    .select("id, client_confirmed, pro_confirmed")
    .eq("professional_id", professionalId)
    .eq("client_id", userId)
    .maybeSingle();
  if (error) return { canReview: true, state: "open" }; // tabla/columnas ausentes → gate off
  if (!data || !data.client_confirmed) return { canReview: false, state: "need-client-confirm" };
  if (!data.pro_confirmed) return { canReview: false, state: "waiting-pro" };
  return { canReview: true, state: "ok" };
}

export type ProContact = {
  id: string;
  clientName: string;
  createdAt: string;
  clientConfirmed: boolean;
  proConfirmed: boolean;
};

/** Lista de clientes que contactaron a un profesional (para que confirme trabajos). */
export async function getProContacts(professionalId: string): Promise<ProContact[]> {
  const db = getServiceSupabase();
  if (!db) return [];
  try {
    const { data, error } = await db
      .from("contacts")
      .select("id, created_at, client_confirmed, pro_confirmed, profiles(full_name)")
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r) => {
      const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return {
        id: r.id as string,
        clientName: (prof?.full_name as string) || "Cliente",
        createdAt: r.created_at as string,
        clientConfirmed: Boolean(r.client_confirmed),
        proConfirmed: Boolean(r.pro_confirmed),
      };
    });
  } catch {
    return [];
  }
}

/** Reseña que dejó un usuario a un profesional (para precargar/editar). */
export async function getUserReview(
  professionalId: string,
  userId: string
): Promise<{ id: string; rating: number; comment: string | null } | null> {
  const db = getServiceSupabase();
  if (!db) return null;
  try {
    const { data } = await db
      .from("reviews")
      .select("id, rating, comment")
      .eq("professional_id", professionalId)
      .eq("author_id", userId)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export type { ProRow };
