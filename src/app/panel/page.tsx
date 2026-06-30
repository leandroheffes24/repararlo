import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Wrench, ArrowRight } from "lucide-react";
import { getCurrentUser, getServiceSupabase } from "@/lib/supabase/server";
import { getProfessionalRowByProfileId } from "@/lib/data/repository";
import { ProfileEditor, type ProfileEditorInitial } from "@/components/ProfileEditor";
import { AvatarUploader } from "@/components/AvatarUploader";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata: Metadata = { title: "Mi panel" };
export const dynamic = "force-dynamic";

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/panel");

  const { modo } = await searchParams;

  // Datos del perfil (full_name / role): tabla profiles con fallback a metadata
  const db = getServiceSupabase();
  let fullName = (user.user_metadata?.full_name as string) ?? "";
  let role = (user.user_metadata?.role as string) ?? "client";
  if (db) {
    const { data: profile } = await db
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      fullName = profile.full_name ?? fullName;
      role = profile.role ?? role;
    }
  }

  const row = await getProfessionalRowByProfileId(user.id);
  const showEditor = role === "professional" || Boolean(row) || modo === "profesional";

  const greetingName = (fullName || user.email || "").split(" ")[0];
  const avatarUrl = (user.user_metadata?.avatar_url as string) ?? undefined;
  const avatarHue = [...user.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Hola{greetingName ? `, ${greetingName}` : ""} 👋
          </h1>
          <p className="mt-1 text-slate-600">
            {showEditor
              ? "Completá tu perfil para que los clientes te encuentren."
              : "Esta es tu cuenta en Repararlo."}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Foto de perfil (para todos los usuarios) */}
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]">
        <AvatarUploader
          name={fullName || user.email || "Usuario"}
          hue={avatarHue}
          initialUrl={avatarUrl}
        />
      </div>

      <div className="mt-6">
        {showEditor ? (
          <ProfileEditor initial={buildInitial(row, fullName)} />
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Search className="h-6 w-6" />
              </span>
              <h2 className="mt-3 font-display text-lg font-bold text-slate-900">
                Buscá un profesional
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Encontrá plomeros, electricistas, albañiles y más cerca tuyo.
              </p>
              <Link
                href="/buscar"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Ir a la búsqueda <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <Wrench className="h-6 w-6" />
              </span>
              <h2 className="mt-3 font-display text-lg font-bold text-slate-900">
                ¿Ofrecés un servicio?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Creá tu perfil profesional gratis y empezá a recibir clientes.
              </p>
              <Link
                href="/panel?modo=profesional"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Crear mi perfil profesional <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildInitial(
  row: Awaited<ReturnType<typeof getProfessionalRowByProfileId>>,
  fullName: string
): ProfileEditorInitial {
  if (!row) {
    return {
      name: fullName,
      headline: "",
      province: "",
      city: "",
      serviceAreas: "",
      about: "",
      skills: "",
      priceFrom: "",
      priceUnit: "presupuesto",
      phone: "",
      available: true,
      categorySlugs: [],
      photos: [],
      slug: undefined,
    };
  }
  return {
    name: row.name ?? fullName,
    headline: row.headline ?? "",
    province: row.province ?? "",
    city: row.city ?? "",
    serviceAreas: (row.service_areas ?? []).join(", "),
    about: row.about ?? "",
    skills: (row.skills ?? []).join(", "),
    priceFrom: row.price_from ? String(row.price_from) : "",
    priceUnit: (row.price_unit as ProfileEditorInitial["priceUnit"]) ?? "presupuesto",
    phone: row.phone ?? "",
    available: row.available ?? true,
    categorySlugs: (row.professional_categories ?? []).map((c) => c.category_slug),
    photos: row.photos ?? [],
    slug: row.slug,
  };
}
