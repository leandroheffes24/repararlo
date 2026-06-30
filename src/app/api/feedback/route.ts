import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Recibe sugerencias y reportes de errores de forma anónima (sin login).
 * Si la tabla `feedback` todavía no existe, no rompe: lo registra en los
 * logs del servidor y responde OK igual (para no frustrar a quien escribe).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const type = body.type === "error" ? "error" : "mejora";
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const page = String(body.page ?? "").slice(0, 200) || null;
  const email = String(body.email ?? "").trim().slice(0, 200) || null;

  if (message.length < 5) {
    return NextResponse.json(
      { ok: false, error: "Contanos un poco más para poder ayudarte." },
      { status: 400 }
    );
  }

  const db = getServiceSupabase();
  if (!db) {
    console.log("[Repararlo · feedback (sin Supabase)]", { type, message, page });
    return NextResponse.json({ ok: true });
  }

  const { error } = await db.from("feedback").insert({ type, message, page, email });
  if (error) {
    // Tabla inexistente u otro error: no perdemos el feedback ni frustramos al usuario.
    console.log("[Repararlo · feedback]", { type, message, page, email });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
