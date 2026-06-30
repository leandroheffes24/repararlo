import { NextResponse } from "next/server";
import { createSupabaseServer, getServiceSupabase } from "@/lib/supabase/server";

const BUCKET = "trabajos";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  // 1. Verificar sesión
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

  // 2. Leer el archivo
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
    return NextResponse.json(
      { error: "Formato no permitido (usá JPG, PNG o WEBP)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es muy pesada (máx 5 MB)" }, { status: 400 });
  }

  // 3. Subir con service role (ignora RLS; controlamos el path por usuario)
  const db = getServiceSupabase();
  if (!db) {
    return NextResponse.json({ error: "Almacenamiento no configurado" }, { status: 500 });
  }
  const path = `${user.id}/${crypto.randomUUID()}.${EXT[file.type]}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await db.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: "No pudimos subir la imagen" }, { status: 500 });
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
