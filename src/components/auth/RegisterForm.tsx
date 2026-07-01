"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Wrench, User } from "lucide-react";
import { createSupabaseBrowser, supabaseBrowserConfigured } from "@/lib/supabase/client";

type Role = "client" | "professional";

export function RegisterForm({
  defaultRole = "client",
  lockRole = false,
  next,
}: {
  defaultRole?: Role;
  lockRole?: boolean;
  next?: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(defaultRole);
  const [status, setStatus] = useState<"idle" | "loading" | "check-email">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!supabaseBrowserConfigured) {
      setError("La autenticación todavía no está configurada en este entorno.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setStatus("loading");
    const supabase = createSupabaseBrowser();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/ingresar` : undefined,
      },
    });

    if (signUpError) {
      setError(traducirError(signUpError.message));
      setStatus("idle");
      return;
    }

    // Si Supabase requiere confirmación por email, no hay sesión todavía.
    if (!data.session) {
      setStatus("check-email");
      return;
    }

    router.refresh();
    const dest = next && next.startsWith("/") ? next : role === "professional" ? "/panel" : "/";
    router.push(dest);
  }

  const loginHref =
    next && next.startsWith("/") ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar";

  if (status === "check-email") {
    return (
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-brand-600" />
        <h3 className="mt-4 font-display text-xl font-bold text-slate-900">
          Revisá tu email
        </h3>
        <p className="mt-2 text-slate-600">
          Te enviamos un link para confirmar tu cuenta. Cuando lo abras, vas a poder
          iniciar sesión.
        </p>
        <Link
          href={loginHref}
          className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <h3 className="font-display text-xl font-bold text-slate-900">Crear cuenta</h3>
      <p className="mt-1 text-sm text-slate-500">Es gratis y te toma 1 minuto.</p>

      {!lockRole && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <RoleOption
            active={role === "client"}
            onClick={() => setRole("client")}
            icon={<User className="h-5 w-5" />}
            title="Necesito un servicio"
          />
          <RoleOption
            active={role === "professional"}
            onClick={() => setRole("professional")}
            icon={<Wrench className="h-5 w-5" />}
            title="Ofrezco un servicio"
          />
        </div>
      )}

      <div className="mt-5 space-y-4">
        <Field label="Nombre y apellido">
          <input required name="fullName" type="text" placeholder="Ej: Juan Pérez" className={inputClass} />
        </Field>
        <Field label="Email">
          <input required name="email" type="email" placeholder="tu@email.com" className={inputClass} />
        </Field>
        <Field label="Contraseña">
          <input
            required
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            className={inputClass}
          />
        </Field>
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
            <Loader2 className="h-5 w-5 animate-spin" /> Creando cuenta…
          </>
        ) : (
          "Crear mi cuenta gratis"
        )}
      </button>

      <p className="mt-4 text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <Link href={loginHref} className="font-semibold text-brand-600 hover:text-brand-700">
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}

function RoleOption({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center text-sm font-semibold transition-colors ${
        active
          ? "border-brand-600 bg-brand-50 text-brand-700"
          : "border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      <span className={active ? "text-brand-600" : "text-slate-400"}>{icon}</span>
      {title}
    </button>
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

function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists"))
    return "Ese email ya tiene una cuenta. Probá iniciar sesión.";
  if (m.includes("invalid email")) return "El email no es válido.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos (mínimo 6 caracteres).";
  return "No pudimos crear la cuenta. Probá de nuevo en un momento.";
}
