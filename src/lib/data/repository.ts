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

export type { ProRow };
