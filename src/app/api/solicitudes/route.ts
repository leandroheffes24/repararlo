import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const area = String(body.area ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const about = String(body.about ?? "").trim();

  if (!name || !category || !area || !phone) {
    return NextResponse.json(
      { ok: false, error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();

  // Modo demo: todavía no hay Supabase configurado.
  if (!supabase) {
    console.log("[Repararlo · solicitud de profesional (modo demo)]", {
      name,
      category,
      area,
      phone,
    });
    return NextResponse.json({ ok: true, simulated: true });
  }

  const { error } = await supabase.from("professional_applications").insert({
    name,
    category,
    service_area: area,
    phone,
    about: about || null,
  });

  if (error) {
    console.error("[Repararlo · error al guardar solicitud]", error.message);
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar tu solicitud. Probá de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
