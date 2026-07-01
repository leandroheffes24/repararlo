import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getNotifications, markNotificationsRead } from "@/lib/data/notifications";

export async function GET() {
  const auth = await createSupabaseServer();
  if (!auth) return NextResponse.json({ items: [], unread: 0 });
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ items: [], unread: 0 });
  return NextResponse.json(await getNotifications(user.id));
}

export async function POST(request: Request) {
  const auth = await createSupabaseServer();
  if (!auth) return NextResponse.json({ ok: false });
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  await markNotificationsRead(user.id, {
    id: typeof body.id === "string" ? body.id : undefined,
    all: body.all === true,
  });
  return NextResponse.json({ ok: true });
}
