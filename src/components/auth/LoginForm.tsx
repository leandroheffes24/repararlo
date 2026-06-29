"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowser, supabaseBrowserConfigured } from "@/lib/supabase/client";

export function LoginForm({ next = "/panel" }: { next?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!supabaseBrowserConfigured) {
      setError("La autenticación todavía no está configurada en este entorno.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setStatus("loading");
    const supabase = createSupabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      const m = signInError.message.toLowerCase();
      setError(
        m.includes("invalid")
          ? "Email o contraseña incorrectos."
          : m.includes("confirm")
            ? "Tenés que confirmar tu email antes de ingresar."
            : "No pudimos iniciar sesión. Probá de nuevo."
      );
      setStatus("idle");
      return;
    }

    router.refresh();
    router.push(next);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <h3 className="font-display text-xl font-bold text-slate-900">Iniciar sesión</h3>
      <p className="mt-1 text-sm text-slate-500">Ingresá con tu email y contraseña.</p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
          <input required name="email" type="email" placeholder="tu@email.com" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</span>
          <input required name="password" type="password" placeholder="Tu contraseña" className={inputClass} />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Ingresando…
          </>
        ) : (
          "Ingresar"
        )}
      </button>

      <p className="mt-4 text-center text-sm text-slate-500">
        ¿No tenés cuenta?{" "}
        <Link href="/registrarse" className="font-semibold text-brand-600 hover:text-brand-700">
          Registrate gratis
        </Link>
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
