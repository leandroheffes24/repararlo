"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, MessageCircle } from "lucide-react";
import { confirmHiringProAction } from "@/app/panel/actions";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  clientName: string;
  createdAt: string;
  clientConfirmed: boolean;
  clientDeclined: boolean;
  proConfirmed: boolean;
  proDeclined: boolean;
};

export function ProContacts({ contacts, proSlug }: { contacts: Row[]; proSlug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(id: string, decision: "yes" | "no") {
    setBusy(id + decision);
    const res = await confirmHiringProAction(id, decision);
    setBusy(null);
    if (res.ok) router.refresh();
  }

  function pedirResena(clientName: string) {
    const url = `${window.location.origin}/profesionales/${proSlug}`;
    const nombre = clientName && clientName !== "Cliente" ? ` ${clientName.split(" ")[0]}` : "";
    const msg =
      `¡Hola${nombre}! Gracias por contactarme por Repararlo 🙌 ` +
      `Cuando puedas, confirmá que trabajamos juntos y dejame tu reseña acá ` +
      `(te toma 10 segundos): ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (contacts.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Todavía nadie te contactó desde la plataforma. Cuando alguien lo haga, vas a
        poder indicar si trabajaste con esa persona.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {contacts.map((c) => {
        const estadoCliente = c.clientConfirmed
          ? "el cliente confirmó la contratación"
          : c.clientDeclined
            ? "el cliente indicó que no te contrató"
            : "sin confirmar por el cliente";
        return (
          <li
            key={c.id}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{c.clientName}</p>
              <p className="text-xs text-slate-400">
                Te contactó el {formatDate(c.createdAt)} · {estadoCliente}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                onClick={() => pedirResena(c.clientName)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                title="Enviarle un WhatsApp para que confirme y te reseñe"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir reseña
              </button>
              <button
                onClick={() => respond(c.id, "yes")}
                disabled={busy !== null}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  c.proConfirmed
                    ? "bg-brand-600 text-white"
                    : "border border-slate-200 text-slate-700 hover:border-brand-300"
                }`}
              >
                {busy === c.id + "yes" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Trabajé
              </button>
              <button
                onClick={() => respond(c.id, "no")}
                disabled={busy !== null}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  c.proDeclined
                    ? "bg-slate-700 text-white"
                    : "border border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {busy === c.id + "no" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                No trabajé
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
