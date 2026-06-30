"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlus, X, Lightbulb, Bug, Loader2, CheckCircle2, Send } from "lucide-react";

type Tipo = "mejora" | "error";
type Estado = "idle" | "sending" | "done";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<Tipo>("mejora");
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-feedback", handler);
    return () => window.removeEventListener("open-feedback", handler);
  }, []);

  function close() {
    setOpen(false);
    // Reiniciar el formulario un toque después de cerrar
    setTimeout(() => {
      setEstado("idle");
      setError(null);
      setTipo("mejora");
    }, 200);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (message.length < 5) {
      setError("Contanos un poco más 🙂");
      return;
    }
    setError(null);
    setEstado("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tipo,
          message,
          email,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "No se pudo enviar.");
      setEstado("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Probá de nuevo.");
      setEstado("idle");
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-xl"
        aria-label="Dejar una sugerencia o reportar un error"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span className="hidden sm:inline">Sugerencias</span>
      </button>

      {/* Modal */}
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

            {estado === "done" ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                  ¡Gracias por tu aporte!
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Lo tendremos en cuenta para mejorar Repararlo.
                </p>
                <button
                  onClick={close}
                  className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Ayudanos a mejorar
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Tu mensaje es anónimo. Contanos qué mejorarías o qué falló.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <TipoBtn
                    active={tipo === "mejora"}
                    onClick={() => setTipo("mejora")}
                    icon={<Lightbulb className="h-5 w-5" />}
                    label="Sugerir mejora"
                  />
                  <TipoBtn
                    active={tipo === "error"}
                    onClick={() => setTipo("error")}
                    icon={<Bug className="h-5 w-5" />}
                    label="Reportar error"
                  />
                </div>

                <textarea
                  name="message"
                  rows={4}
                  autoFocus
                  placeholder={
                    tipo === "mejora"
                      ? "Ej: estaría bueno poder filtrar por precio…"
                      : "Ej: al tocar 'Guardar' no pasa nada…"
                  }
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Tu email (opcional, si querés que te respondamos)"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={estado === "sending"}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
                >
                  {estado === "sending" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" /> Enviar
                    </>
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

function TipoBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "border-brand-600 bg-brand-50 text-brand-700"
          : "border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      <span className={active ? "text-brand-600" : "text-slate-400"}>{icon}</span>
      {label}
    </button>
  );
}
