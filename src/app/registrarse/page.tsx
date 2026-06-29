import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, Star, Wallet } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registrate gratis en Repararlo como cliente o profesional.",
};

export default async function RegistrarsePage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/panel");

  const { rol } = await searchParams;
  const defaultRole = rol === "profesional" ? "professional" : "client";

  return (
    <section className="bg-brand-gradient">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            Sumate a <span className="text-brand-600">Repararlo</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-slate-600">
            Creá tu cuenta gratis. Si buscás un servicio, encontrá al mejor profesional.
            Si ofrecés tu oficio, conseguí más clientes en tu zona.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Wallet, text: "100% gratis: sin costos ni comisiones." },
              { icon: ShieldCheck, text: "Profesionales verificados y de confianza." },
              { icon: Star, text: "Reseñas reales de otros vecinos." },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="text-slate-700">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md">
          <RegisterForm defaultRole={defaultRole} />
        </div>
      </div>
    </section>
  );
}
