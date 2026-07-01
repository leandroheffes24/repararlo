"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { confirmHiringClientAction } from "@/app/profesionales/actions";

export function ClientConfirmHiring({
  professionalId,
  professionalName,
  confirmed,
  declined,
  waitingPro,
}: {
  professionalId: string;
  professionalName: string;
  confirmed: boolean;
  declined: boolean;
  waitingPro: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"yes" | "no" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(decision: "yes" | "no") {
    setError(null);
    setLoading(decision);
    const res = await confirmHiringClientAction(professionalId, decision);
    if (!res.ok) {
      setError(res.error ?? "No pudimos registrar tu respuesta.");
      setLoading(null);
      return;
    }
    router.refresh();
  }

  const first = professionalName.split(" ")[0];

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-600">
        ¿Contrataste a <strong>{first}</strong>? Respondé para poder dejar una reseña. El
        profesional también confirma, así las reseñas son de clientes reales.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => respond("yes")}
          disabled={loading !== null}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-70 ${
            confirmed
              ? "bg-brand-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300"
          }`}
        >
          {loading === "yes" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Sí, lo contraté
        </button>
        <button
          onClick={() => respond("no")}
          disabled={loading !== null}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-70 ${
            declined
              ? "bg-slate-700 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          {loading === "no" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          No lo contraté
        </button>
      </div>
      {waitingPro && (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Marcaste que sí. Esperando que el profesional lo confirme.
        </p>
      )}
      {declined && (
        <p className="mt-2 text-xs text-slate-500">
          Marcaste que no lo contrataste. Si te equivocaste, tocá &quot;Sí&quot;.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
