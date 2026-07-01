import { getServiceSupabase } from "@/lib/supabase/server";

export type NotifType = "contact" | "client_confirmed" | "pro_confirmed" | "review";

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

/** Crea una notificación para un usuario (fire-and-forget, resiliente). */
export async function createNotification(
  userId: string | null | undefined,
  n: { type: NotifType; title: string; body?: string; link?: string }
): Promise<void> {
  const db = getServiceSupabase();
  if (!db || !userId) return;
  try {
    await db.from("notifications").insert({
      user_id: userId,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      link: n.link ?? null,
    });
  } catch {
    /* tabla ausente u otro error: nunca rompemos la acción principal */
  }
}

/** Lista las últimas notificaciones de un usuario + cuántas sin leer. */
export async function getNotifications(
  userId: string
): Promise<{ items: Notification[]; unread: number }> {
  const db = getServiceSupabase();
  if (!db) return { items: [], unread: 0 };
  try {
    const { data, error } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error || !data) return { items: [], unread: 0 };
    const items = data as Notification[];
    return { items, unread: items.filter((n) => !n.read).length };
  } catch {
    return { items: [], unread: 0 };
  }
}

/** Marca como leída una notificación (por id) o todas las del usuario. */
export async function markNotificationsRead(
  userId: string,
  opts: { id?: string; all?: boolean }
): Promise<void> {
  const db = getServiceSupabase();
  if (!db) return;
  try {
    let q = db.from("notifications").update({ read: true }).eq("user_id", userId);
    if (opts.id) q = q.eq("id", opts.id);
    await q;
  } catch {
    /* ignore */
  }
}
