import { NextResponse } from "next/server";
import { createSupabaseServer, getServiceSupabase } from "@/lib/supabase/server";

const REASONS = ["falso", "estafa", "datos", "inapropiado", "otro"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const professionalId = String(body.professionalId ?? "");
  const reason = String(body.reason ?? "").trim();
  const comment = String(body.comment ?? "").trim().slice(0, 2000);

  if (!professionalId || !REASONS.includes(reason)) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  // Reportar requiere estar logueado (evita reportes falsos y abuso)
  const auth = await createSupabaseServer();
  const {
    data: { user },
  } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Tenés que iniciar sesión para reportar." },
      { status: 401 }
    );
  }

  const db = getServiceSupabase();
  if (!db) {
    console.log("[Repararlo · reporte (sin Supabase)]", { professionalId, reason });
    return NextResponse.json({ ok: true });
  }

  const reporterId = user.id;

  // Asegurar el profile (FK reports.reporter_id)
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

  // Evitar reportes duplicados del mismo usuario al mismo perfil
  const { data: existing } = await db
    .from("reports")
    .select("id")
    .eq("professional_id", professionalId)
    .eq("reporter_id", reporterId)
    .maybeSingle();
  if (existing) {
    await db
      .from("reports")
      .update({ reason, comment: comment || null })
      .eq("id", existing.id);
    return NextResponse.json({ ok: true });
  }

  const { error } = await db.from("reports").insert({
    professional_id: professionalId,
    reporter_id: reporterId,
    reason,
    comment: comment || null,
  });
  if (error) {
    // Tabla inexistente u otro error: no perdemos el reporte ni frustramos al usuario.
    console.log("[Repararlo · reporte]", { professionalId, reason, comment });
  }

  return NextResponse.json({ ok: true });
}
