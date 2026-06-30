"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { confirmHiringProAction } from "@/app/panel/actions";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  clientName: string;
  createdAt: string;
  clientConfirmed: boolean;
  proConfirmed: boolean;
};

export function ProContacts({ contacts }: { contacts: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function confirm(id: string) {
    setBusy(id);
    const res = await confirmHiringProAction(id);
    setBusy(null);
    if (res.ok) router.refresh();
  }

  if (contacts.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Todavía nadie te contactó desde la plataforma. Cuando alguien lo haga, vas a
        poder confirmar el trabajo acá.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {contacts.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{c.clientName}</p>
            <p className="text-xs text-slate-400">
              Te contactó el {formatDate(c.createdAt)}
              {c.clientConfirmed ? " · el cliente confirmó la contratación" : ""}
            </p>
          </div>
          {c.proConfirmed ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-600">
              <Check className="h-4 w-4" /> Confirmado
            </span>
          ) : (
            <button
              onClick={() => confirm(c.id)}
              disabled={busy === c.id}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
            >
              {busy === c.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar trabajo"
              )}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
