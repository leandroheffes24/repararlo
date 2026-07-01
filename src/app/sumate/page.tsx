import type { Metadata } from "next";
import Link from "next/link";
import { Users, TrendingUp, BadgeCheck, Wallet, ArrowRight } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sumate como profesional",
  description:
    "Creá tu perfil gratis en Repararlo, mostrá tus trabajos y conseguí más clientes en tu zona. Sin comisiones.",
};

const benefits = [
  {
    icon: Users,
    title: "Más clientes",
    text: "Llegá a miles de personas que buscan tu servicio en tu zona, todos los días.",
  },
  {
    icon: Wallet,
    title: "Sin comisiones",
    text: "No cobramos por trabajo ni nos quedamos con un porcentaje. Lo que cobrás es 100% tuyo.",
  },
  {
    icon: BadgeCheck,
    title: "Generá confianza",
    text: "Con tus reseñas y la insignia de verificado, los clientes te eligen con tranquilidad.",
  },
  {
    icon: TrendingUp,
    title: "Hacé crecer tu negocio",
    text: "Mostrá tu experiencia y especialidades. Cuanto mejor tu perfil, más pedidos recibís.",
  },
];

export default async function SumatePage() {
  const user = await getCurrentUser();
  return (
    <section className="bg-brand-gradient">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          {/* Marketing */}
          <div className="lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm">
              <BadgeCheck className="h-4 w-4" />
              Registro gratuito
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Conseguí más clientes para tu oficio
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Miles de personas buscan plomeros, electricistas, albañiles y más todos los
              días. Sumate gratis a Repararlo y que te encuentren a vos.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-[var(--shadow-card)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-display font-bold text-slate-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{b.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-6 rounded-2xl bg-white/80 px-6 py-5 shadow-[var(--shadow-card)]">
              <div>
                <p className="font-display text-2xl font-extrabold text-slate-900">$0</p>
                <p className="text-sm text-slate-500">costo de registro</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="font-display text-2xl font-extrabold text-slate-900">Sin comisiones</p>
                <p className="text-sm text-slate-500">lo que cobrás es tuyo</p>
              </div>
            </div>
          </div>

          {/* Formulario / CTA */}
          <div className="mt-10 lg:mt-0">
            {user ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[var(--shadow-card)]">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Ya tenés una cuenta
                </h3>
                <p className="mt-2 text-slate-600">
                  Completá o editá tu perfil profesional desde tu panel.
                </p>
                <Link
                  href="/panel?modo=profesional"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
                >
                  Ir a mi perfil profesional <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <RegisterForm defaultRole="professional" lockRole />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
