import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  UserCheck,
  MessageCircle,
  Star,
  ShieldCheck,
  Wallet,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Conocé cómo Repararlo conecta a personas con profesionales de confianza para el hogar, gratis y sin comisiones.",
};

const stepsClient = [
  {
    icon: Search,
    title: "Buscá el servicio",
    text: "Escribí qué necesitás (plomero, electricista, etc.) y tu zona. Te mostramos los profesionales mejor puntuados cerca tuyo.",
  },
  {
    icon: UserCheck,
    title: "Compará perfiles",
    text: "Mirá experiencia, especialidades, precios orientativos y reseñas reales de otros clientes para elegir con confianza.",
  },
  {
    icon: MessageCircle,
    title: "Contactá gratis",
    text: "Escribile directo por WhatsApp o llamalo. Coordinan el trabajo y el precio entre ustedes, sin intermediarios.",
  },
  {
    icon: Star,
    title: "Calificá el trabajo",
    text: "Cuando termina, dejá tu reseña. Ayudás a otros vecinos y premiás a los buenos profesionales.",
  },
];

const benefits = [
  {
    icon: Wallet,
    title: "100% gratis",
    text: "Buscar y contactar profesionales no tiene ningún costo. Repararlo no cobra comisión por los trabajos.",
  },
  {
    icon: ShieldCheck,
    title: "Profesionales verificados",
    text: "Validamos identidad y matrículas de los profesionales para que contrates con tranquilidad.",
  },
  {
    icon: Star,
    title: "Reseñas reales",
    text: "Solo puede calificar quien contrató. Nada de opiniones falsas: información honesta para decidir mejor.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="bg-brand-gradient">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Cómo funciona Repararlo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Encontrar al profesional indicado para tu hogar nunca fue tan simple.
            Gratis, rápido y sin vueltas.
          </p>
        </div>
      </section>

      {/* Para clientes */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Si necesitás un servicio
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-900">
            En 4 pasos
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stepsClient.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="absolute right-6 top-6 font-display text-4xl font-extrabold text-slate-100">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/buscar"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Buscar un profesional <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <b.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para profesionales */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-700 px-6 py-12 text-center sm:px-12">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            Si sos profesional
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
            Conseguí más clientes, gratis
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
            Creá tu perfil, mostrá tus trabajos y reseñas, y recibí pedidos de gente de
            tu zona. Sin comisiones por trabajo: lo que cobrás es tuyo.
          </p>
          <Link
            href="/sumate"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-700 transition-transform hover:scale-[1.02]"
          >
            Crear mi perfil gratis <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
