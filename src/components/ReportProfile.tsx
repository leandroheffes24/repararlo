"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, X, Loader2, CheckCircle2, LogIn } from "lucide-react";

const REASONS: { value: string; label: string }[] = [
  { value: "falso", label: "Perfil falso o inventado" },
  { value: "estafa", label: "Estafa o fraude" },
  { value: "datos", label: "Datos falsos o incorrectos" },
  { value: "inapropiado", label: "Contenido inapropiado" },
  { value: "otro", label: "Otro motivo" },
];

export function ReportProfile({
  professionalId,
  professionalName,
  isLoggedIn,
  slug,
}: {
  professionalId: string;
  professionalName: string;
  isLoggedIn: boolean;
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setReason("");
      setComment("");
      setError(null);
    }, 200);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("Elegí un motivo.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/reportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, reason, comment }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "No se pudo enviar.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Probá de nuevo.");
      setStatus("idle");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-500"
      >
        <Flag className="h-3.5 w-3.5" />
        Reportar este perfil
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={close}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            {status === "done" ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                  Gracias por avisar
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Vamos a revisar el perfil. Tu reporte es anónimo para el profesional.
                </p>
                <button
                  onClick={close}
                  className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Cerrar
                </button>
              </div>
            ) : !isLoggedIn ? (
              <div className="py-2 text-center">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Flag className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                  Reportar perfil
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Para reportar un perfil necesitás una cuenta. Así evitamos reportes
                  falsos y abusos.
                </p>
                <Link
                  href={`/ingresar?next=/profesionales/${slug}`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
                >
                  <LogIn className="h-5 w-5" /> Iniciá sesión para reportar
                </Link>
                <Link
                  href={`/registrarse?next=/profesionales/${slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Crear cuenta gratis
                </Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Flag className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Reportar perfil
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  ¿Qué problema encontraste con el perfil de{" "}
                  <strong>{professionalName.split(" ")[0]}</strong>?
                </p>

                <div className="mt-4 space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                        reason === r.value
                          ? "border-brand-400 bg-brand-50 font-semibold text-brand-700"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Contanos más (opcional)…"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Enviando…
                    </>
                  ) : (
                    "Enviar reporte"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
