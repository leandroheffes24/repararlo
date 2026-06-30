"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteAccountAction } from "@/app/panel/actions";
import { createSupabaseBrowser, supabaseBrowserConfigured } from "@/lib/supabase/client";

const PALABRA = "ELIMINAR";

export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    const res = await deleteAccountAction();
    if (!res.ok) {
      setError(res.error ?? "No se pudo eliminar la cuenta.");
      setLoading(false);
      return;
    }
    // Cerrar sesión local y volver al inicio
    try {
      if (supabaseBrowserConfigured) await createSupabaseBrowser().auth.signOut();
    } catch {
      /* la cuenta ya no existe; igual limpiamos cookies */
    }
    router.push("/?cuenta=eliminada");
    router.refresh();
  }

  function close() {
    if (loading) return;
    setOpen(false);
    setTexto("");
    setError(null);
  }

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
      <h2 className="font-display text-lg font-bold text-red-700">Eliminar mi cuenta</h2>
      <p className="mt-1 text-sm text-slate-600">
        Esta acción es <strong>permanente</strong>. Se borran tu cuenta y tu perfil y, si
        sos profesional, tu publicación y tus reseñas. No se puede deshacer.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar mi cuenta
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={close} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={close}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
              ¿Eliminar tu cuenta para siempre?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Vas a perder el acceso y se borrarán todos tus datos. Esta acción no se puede
              deshacer.
            </p>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Escribí <span className="font-bold text-red-700">{PALABRA}</span> para
              confirmar:
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                placeholder={PALABRA}
                autoComplete="off"
              />
            </label>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button
                onClick={close}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || texto.trim().toUpperCase() !== PALABRA}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Eliminando…
                  </>
                ) : (
                  "Eliminar definitivamente"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
