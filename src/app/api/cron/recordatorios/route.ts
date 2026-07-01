import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { sendEmail, reminderEmailHtml, emailConfigured } from "@/lib/email";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://repararlo.com.ar";
const MAX_REMINDERS = 2; // total de recordatorios por contacto
const BATCH = 50; // por corrida (respeta el límite gratis de Resend)

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  const token = new URL(request.url).searchParams.get("secret");
  return header === `Bearer ${secret}` || token === secret;
}

type ContactRow = {
  id: string;
  client_id: string;
  last_reminder_at: string | null;
  client_reminder_count: number | null;
  professionals: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
};

async function run() {
  if (!emailConfigured()) {
    return { ok: true, sent: 0, skipped: "Falta RESEND_API_KEY (email no configurado)" };
  }
  const db = getServiceSupabase();
  if (!db) return { ok: true, sent: 0, skipped: "Base de datos no configurada" };

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();

  const { data, error } = await db
    .from("contacts")
    .select("id, client_id, last_reminder_at, client_reminder_count, professionals(name, slug)")
    .eq("client_confirmed", false)
    .eq("client_declined", false)
    .lte("created_at", twoDaysAgo)
    .lt("client_reminder_count", MAX_REMINDERS)
    .limit(BATCH);

  if (error || !data) return { ok: true, sent: 0, note: "sin pendientes o tabla sin columnas" };

  let sent = 0;
  for (const c of data as ContactRow[]) {
    // Espaciar: no reenviar si ya recibió uno en los últimos 3 días
    if (c.last_reminder_at && c.last_reminder_at > threeDaysAgo) continue;

    const pro = Array.isArray(c.professionals) ? c.professionals[0] : c.professionals;
    if (!pro?.slug || !pro?.name) continue;

    const { data: u } = await db.auth.admin.getUserById(c.client_id);
    const email = u?.user?.email;
    if (!email) continue;

    const ok = await sendEmail({
      to: email,
      subject: `¿Trabajaste con ${pro.name}? Dejá tu reseña en Repararlo`,
      html: reminderEmailHtml(pro.name, `${SITE}/profesionales/${pro.slug}`),
    });

    if (ok) {
      await db
        .from("contacts")
        .update({
          client_reminder_count: (c.client_reminder_count ?? 0) + 1,
          last_reminder_at: new Date().toISOString(),
        })
        .eq("id", c.id);
      sent++;
    }
  }

  return { ok: true, sent };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await run());
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await run());
}
