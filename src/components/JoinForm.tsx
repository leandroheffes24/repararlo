"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { categories } from "@/lib/data/categories";

export function JoinForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "No pudimos enviar tu solicitud.");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error. Probá de nuevo.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 font-display text-xl font-bold text-slate-900">
          ¡Listo! Recibimos tu solicitud
        </h3>
        <p className="mt-2 text-slate-600">
          En breve revisamos tus datos y activamos tu perfil. Te vamos a contactar para
          verificar tu cuenta.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          Cargar otro profesional
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <h3 className="font-display text-xl font-bold text-slate-900">
        Creá tu perfil gratis
      </h3>
      <p className="mt-1 text-sm text-slate-500">Te toma menos de 2 minutos.</p>

      <div className="mt-6 space-y-4">
        <Field label="Nombre y apellido">
          <input
            required
            name="name"
            type="text"
            placeholder="Ej: Juan Pérez"
            className={inputClass}
          />
        </Field>

        <Field label="¿Qué servicio ofrecés?">
          <select required name="category" className={inputClass} defaultValue="">
            <option value="" disabled>
              Elegí tu rubro
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Zona donde trabajás">
            <input
              required
              name="area"
              type="text"
              placeholder="Ej: Caballito, CABA"
              className={inputClass}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              required
              name="phone"
              type="tel"
              placeholder="11 5555-5555"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Contanos sobre tu experiencia">
          <textarea
            name="about"
            rows={3}
            placeholder="Años de experiencia, especialidades, matrícula…"
            className={inputClass}
          />
        </Field>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enviando…
          </>
        ) : (
          "Crear mi perfil gratis"
        )}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">
        Al registrarte aceptás los términos y condiciones de Repararlo.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
