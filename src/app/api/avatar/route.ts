import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer, getServiceSupabase } from "@/lib/supabase/server";

const BUCKET = "avatares";
const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const auth = await createSupabaseServer();
  if (!auth) {
    return NextResponse.json({ error: "Autenticación no configurada" }, { status: 500 });
  }
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Tenés que iniciar sesión" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
  }
  if (!EXT[file.type]) {
    return NextResponse.json({ error: "Usá una imagen JPG, PNG o WEBP" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es muy pesada (máx 5 MB)" }, { status: 400 });
  }

  const db = getServiceSupabase();
  if (!db) {
    return NextResponse.json({ error: "Almacenamiento no configurado" }, { status: 500 });
  }

  // Nombre fijo por usuario: cada subida reemplaza la anterior.
  const path = `${user.id}/avatar.${EXT[file.type]}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await db.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });
  if (upErr) {
    return NextResponse.json({ error: "No pudimos subir la imagen" }, { status: 500 });
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`; // cache-busting

  // Persistir en el profesional (si tiene ficha). Resiliente si falta la columna.
  let proSlug: string | null = null;
  try {
    const { data: updated } = await db
      .from("professionals")
      .update({ avatar_url: url })
      .eq("profile_id", user.id)
      .select("slug")
      .maybeSingle();
    proSlug = updated?.slug ?? null;
  } catch {
    /* columna avatar_url todavía no existe: la foto igual queda subida */
  }

  // Persistir en los datos del usuario (para el header y el panel).
  await db.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, avatar_url: url },
  });

  // Refrescar el directorio para que la nueva foto aparezca enseguida.
  revalidatePath("/");
  revalidatePath("/buscar");
  if (proSlug) revalidatePath(`/profesionales/${proSlug}`);

  return NextResponse.json({ url });
}
