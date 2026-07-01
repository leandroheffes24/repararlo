import { NextResponse } from "next/server";
import { createSupabaseServer, getServiceSupabase } from "@/lib/supabase/server";
import { createNotification } from "@/lib/data/notifications";

/**
 * Registra que un usuario logueado contactó a un profesional desde la plataforma.
 * Este registro es lo que después habilita a dejar una reseña.
 * Es "fire-and-forget": nunca bloquea la revelación del contacto.
 */
export async function POST(request: Request) {
  const auth = await createSupabaseServer();
  if (!auth) return NextResponse.json({ ok: false });

  const {
    data: { user },
  } = await auth.auth.getUser();
  // Si no está logueado, no registramos (igual puede contactar).
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const professionalId = String(body.professionalId ?? "");
  if (!professionalId) return NextResponse.json({ ok: false }, { status: 400 });

  const db = getServiceSupabase();
  if (!db) return NextResponse.json({ ok: false });

  // Asegurar que exista el profile del usuario (FK de contacts.client_id)
  // y guardar su teléfono (para que el profesional pueda escribirle por WhatsApp).
  const phone = (user.user_metadata?.phone as string) ?? null;
  const { data: prof } = await db
    .from("profiles")
    .select("id, phone")
    .eq("id", user.id)
    .maybeSingle();
  if (!prof) {
    const name =
      (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Usuario";
    await db.from("profiles").insert({ id: user.id, full_name: name, role: "client", phone });
  } else if (!prof.phone && phone) {
    await db.from("profiles").update({ phone }).eq("id", user.id);
  }

  // Registrar contacto solo si es la primera vez (para notificar una sola vez).
  const { data: existing } = await db
    .from("contacts")
    .select("id")
    .eq("professional_id", professionalId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error: insErr } = await db
      .from("contacts")
      .insert({ professional_id: professionalId, client_id: user.id });

    if (!insErr) {
      // Avisar al profesional que lo contactaron (solo la primera vez)
      const { data: pro } = await db
        .from("professionals")
        .select("profile_id")
        .eq("id", professionalId)
        .maybeSingle();
      if (pro?.profile_id) {
        const clientName =
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Alguien";
        await createNotification(pro.profile_id, {
          type: "contact",
          title: `${clientName} te contactó`,
          body: "Entró en contacto con vos desde Repararlo.",
          link: "/panel",
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
