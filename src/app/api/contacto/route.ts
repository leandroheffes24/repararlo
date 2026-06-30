import { NextResponse } from "next/server";
import { createSupabaseServer, getServiceSupabase } from "@/lib/supabase/server";

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

  // Registrar contacto (idempotente). Si la tabla no existe todavía, se ignora.
  await db
    .from("contacts")
    .upsert(
      { professional_id: professionalId, client_id: user.id },
      { onConflict: "professional_id,client_id", ignoreDuplicates: true }
    );

  return NextResponse.json({ ok: true });
}
