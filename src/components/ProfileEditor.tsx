"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { provinces, provinceByName } from "@/lib/data/provinces";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { ServiceAreasInput } from "./ServiceAreasInput";
import { CategoryIcon } from "./CategoryIcon";
import { WorkPhotosUploader } from "./WorkPhotosUploader";
import { saveProfileAction, type ProfileInput } from "@/app/panel/actions";

export type ProfileEditorInitial = {
  name: string;
  headline: string;
  province: string;
  city: string;
  serviceAreas: string;
  about: string;
  skills: string;
  priceFrom: string;
  priceUnit: ProfileInput["priceUnit"];
  phone: string;
  available: boolean;
  categorySlugs: string[];
  photos: string[];
  slug?: string;
};

export function ProfileEditor({ initial }: { initial: ProfileEditorInitial }) {
  const [selected, setSelected] = useState<string[]>(initial.categorySlugs);
  const [photos, setPhotos] = useState<string[]>(initial.photos);
  const [available, setAvailable] = useState(initial.available);
  const [priceUnit, setPriceUnit] = useState<ProfileInput["priceUnit"]>(initial.priceUnit);
  const [province, setProvince] = useState(initial.province);
  const [provinceId, setProvinceId] = useState(provinceByName(initial.province)?.id ?? "");
  const [city, setCity] = useState(initial.city);
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    initial.serviceAreas
      ? initial.serviceAreas.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | undefined>(initial.slug);

  function toggleCategory(s: string) {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const input: ProfileInput = {
      name: String(form.get("name") ?? ""),
      headline: String(form.get("headline") ?? ""),
      province,
      city,
      serviceAreas: serviceAreas.join(", "),
      about: String(form.get("about") ?? ""),
      skills: String(form.get("skills") ?? ""),
      priceFrom: String(form.get("priceFrom") ?? ""),
      priceUnit,
      phone: String(form.get("phone") ?? ""),
      available,
      categorySlugs: selected,
      photos,
    };

    const result = await saveProfileAction(input);
    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar.");
      setStatus("idle");
      return;
    }
    setSlug(result.slug);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos principales */}
      <Card title="Datos principales">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre que ven los clientes" full>
            <input required name="name" defaultValue={initial.name} className={inputClass} placeholder="Ej: Carlos Giménez" />
          </Field>
          <Field label="Título / especialidad" full>
            <input name="headline" defaultValue={initial.headline} className={inputClass} placeholder="Ej: Plomero matriculado · 15 años" />
          </Field>
          <Field label="WhatsApp / teléfono">
            <input name="phone" defaultValue={initial.phone} className={inputClass} placeholder="+54 9 11 5555-5555" />
          </Field>
          <Field label="Disponibilidad">
            <button
              type="button"
              onClick={() => setAvailable((v) => !v)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                available
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              {available ? "Disponible para nuevos trabajos" : "Agenda completa"}
              <span className={`h-3 w-3 rounded-full ${available ? "bg-emerald-500" : "bg-slate-300"}`} />
            </button>
          </Field>
        </div>
      </Card>

      {/* Rubros */}
      <Card title="¿Qué servicios ofrecés?">
        <p className="mb-3 text-sm text-slate-500">Elegí uno o más rubros.</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const on = selected.includes(c.slug);
            return (
              <button
                type="button"
                key={c.slug}
                onClick={() => toggleCategory(c.slug)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  on
                    ? "border-brand-600 bg-brand-50 font-semibold text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <CategoryIcon slug={c.slug} className="h-4 w-4 shrink-0" />
                {c.name}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Zona */}
      <Card title="¿Dónde trabajás?">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provincia">
            <select
              value={provinceId}
              onChange={(e) => {
                const id = e.target.value;
                setProvinceId(id);
                setProvince(provinces.find((p) => p.id === id)?.name ?? "");
              }}
              className={inputClass}
            >
              <option value="">Elegí tu provincia</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Localidad / barrio principal">
            <LocationAutocomplete
              value={city}
              onChange={setCity}
              provinciaId={provinceId || undefined}
              placeholder="Buscá tu localidad o barrio"
              inputClassName={inputClass}
            />
          </Field>
          <Field label="Zonas donde trabajás" full>
            <ServiceAreasInput
              value={serviceAreas}
              onChange={setServiceAreas}
              provinciaId={provinceId || undefined}
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Buscá y agregá las localidades/barrios donde ofrecés tus servicios.
            </p>
          </Field>
        </div>
      </Card>

      {/* Detalle */}
      <Card title="Contale a los clientes sobre vos">
        <div className="space-y-4">
          <Field label="Descripción" full>
            <textarea name="about" rows={4} defaultValue={initial.about} className={inputClass} placeholder="Años de experiencia, qué trabajos hacés, garantía, matrícula…" />
          </Field>
          <Field label="Especialidades (separadas por coma)" full>
            <input name="skills" defaultValue={initial.skills} className={inputClass} placeholder="Destapaciones, Termotanques, Pérdidas" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio orientativo (ARS, opcional)">
              <input name="priceFrom" defaultValue={initial.priceFrom} className={inputClass} placeholder="12000" inputMode="numeric" />
            </Field>
            <Field label="Modalidad de precio">
              <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as ProfileInput["priceUnit"])} className={inputClass}>
                <option value="presupuesto">A presupuestar</option>
                <option value="visita">Por visita</option>
                <option value="hora">Por hora</option>
              </select>
            </Field>
          </div>
        </div>
      </Card>

      {/* Fotos de trabajos */}
      <Card title="Fotos de tus trabajos">
        <WorkPhotosUploader value={photos} onChange={setPhotos} />
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
        >
          {status === "saving" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Guardando…
            </>
          ) : status === "saved" ? (
            <>
              <CheckCircle2 className="h-5 w-5" /> ¡Guardado!
            </>
          ) : (
            "Guardar perfil"
          )}
        </button>

        {slug && (
          <Link
            href={`/profesionales/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Ver mi perfil público <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 font-display text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
