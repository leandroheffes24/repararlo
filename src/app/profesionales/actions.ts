"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer, getServiceSupabase } from "@/lib/supabase/server";
import { getReviewEligibility } from "@/lib/data/repository";

export type ReviewInput = {
  professionalId: string;
  rating: number;
  comment: string;
};

export type ReviewResult = { ok: boolean; error?: string };

export async function submitReviewAction(input: ReviewInput): Promise<ReviewResult> {
  const auth = await createSupabaseServer();
  if (!auth) return { ok: false, error: "Autenticación no configurada." };
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return { ok: false, error: "Tenés que iniciar sesión para dejar una reseña." };
  }

  const rating = Math.round(Number(input.rating));
  if (!(rating >= 1 && rating <= 5)) {
    return { ok: false, error: "Elegí una calificación de 1 a 5 estrellas." };
  }
  const comment = (input.comment ?? "").trim();
  if (comment.length < 3) {
    return { ok: false, error: "Escribí un breve comentario sobre tu experiencia." };
  }

  const db = getServiceSupabase();
  if (!db) return { ok: false, error: "Base de datos no configurada." };

  // Profesional a reseñar
  const { data: pro, error: proErr } = await db
    .from("professionals")
    .select("id, slug, profile_id")
    .eq("id", input.professionalId)
    .maybeSingle();
  if (proErr || !pro) return { ok: false, error: "No encontramos al profesional." };
  if (pro.profile_id === user.id) {
    return { ok: false, error: "No podés reseñar tu propio perfil." };
  }

  // Nombre del autor + asegurar que exista su profile (FK de reviews.author_id)
  let authorName = (user.user_metadata?.full_name as string) || "";
  const { data: profile } = await db
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile) {
    if (!authorName) authorName = profile.full_name || "";
  } else {
    if (!authorName) authorName = user.email?.split("@")[0] ?? "Usuario";
    await db.from("profiles").insert({ id: user.id, full_name: authorName, role: "client" });
  }
  if (!authorName) authorName = user.email?.split("@")[0] ?? "Usuario";

  // Una reseña por usuario: si ya existe, la actualiza
  const { data: existing } = await db
    .from("reviews")
    .select("id")
    .eq("professional_id", pro.id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await db
      .from("reviews")
      .update({ rating, comment, author_name: authorName })
      .eq("id", existing.id);
    if (error) return { ok: false, error: "No pudimos guardar tu reseña." };
  } else {
    // Gate anti-reseñas falsas: solo si contactó al profesional
    const elig = await getReviewEligibility(pro.id, user.id);
    if (!elig.canReview) {
      return {
        ok: false,
        error:
          "Para dejar una reseña, primero tenés que contactar al profesional desde su perfil.",
      };
    }
    const { error } = await db.from("reviews").insert({
      professional_id: pro.id,
      author_id: user.id,
      author_name: authorName,
      rating,
      comment,
    });
    if (error) return { ok: false, error: "No pudimos guardar tu reseña." };
  }

  // Recalcular promedio y cantidad
  const { data: rows } = await db
    .from("reviews")
    .select("rating")
    .eq("professional_id", pro.id);
  const list = rows ?? [];
  const count = list.length;
  const avg = count ? list.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
  await db
    .from("professionals")
    .update({ rating: Math.round(avg * 10) / 10, review_count: count })
    .eq("id", pro.id);

  revalidatePath(`/profesionales/${pro.slug}`);
  revalidatePath("/buscar");
  revalidatePath("/");
  return { ok: true };
}

/** El cliente confirma que contrató al profesional (paso 1 de la confirmación mutua). */
export async function confirmHiringClientAction(
  professionalId: string
): Promise<{ ok: boolean; error?: string }> {
  const auth = await createSupabaseServer();
  if (!auth) return { ok: false, error: "Autenticación no configurada." };
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };

  const db = getServiceSupabase();
  if (!db) return { ok: false, error: "Base de datos no configurada." };

  // Asegurar el profile (FK de contacts.client_id)
  const { data: prof } = await db
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!prof) {
    const name =
      (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Usuario";
    await db.from("profiles").insert({ id: user.id, full_name: name, role: "client" });
  }

  const { error } = await db
    .from("contacts")
    .upsert(
      { professional_id: professionalId, client_id: user.id, client_confirmed: true },
      { onConflict: "professional_id,client_id" }
    );
  if (error) return { ok: false, error: "No pudimos registrar tu confirmación." };

  const { data: pro } = await db
    .from("professionals")
    .select("slug")
    .eq("id", professionalId)
    .maybeSingle();
  if (pro?.slug) revalidatePath(`/profesionales/${pro.slug}`);
  return { ok: true };
}
