import Link from "next/link";
import {
  ShieldCheck,
  Star,
  MessageCircle,
  Search as SearchIcon,
  UserCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { categories } from "@/lib/data/categories";
import { getProfessionals } from "@/lib/data/repository";
import { filterProfessionals } from "@/lib/utils";

export const revalidate = 30;

export default async function Home() {
  const proList = await getProfessionals();
  const featured = filterProfessionals(proList, {
    sort: "mejor-puntuados",
  }).slice(0, 6);

  const popularCats = categories.slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="bg-brand-gradient">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            La plataforma de servicios para el hogar en Argentina
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
            Encontrá al profesional{" "}
            <span className="text-brand-600">ideal</span> para tu hogar
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Plomeros, electricistas, albañiles, gasistas y mucho más. Verificados,
            con reseñas reales y cerca tuyo. Contactalos <strong>gratis</strong>.
          </p>

          <div className="mx-auto mt-8 max-w-3xl">
            <SearchBar />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-500">Populares:</span>
            {["plomeria", "electricidad", "gas", "pintura", "aire-acondicionado"].map(
              (slug) => {
                const c = categories.find((x) => x.slug === slug)!;
                return (
                  <Link
                    key={slug}
                    href={`/categorias/${slug}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-700"
                  >
                    {c.icon} {c.name}
                  </Link>
                );
              }
            )}
          </div>

          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
            {[
              { value: "+2.500", label: "profesionales" },
              { value: "+18.000", label: "trabajos realizados" },
              { value: "4,8 ★", label: "promedio de reseñas" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-slate-100">
                <dt className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
              ¿Qué necesitás resolver?
            </h2>
            <p className="mt-2 text-slate-600">
              Elegí un rubro y encontrá al profesional indicado.
            </p>
          </div>
          <Link
            href="/buscar"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Ver todos los servicios <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {popularCats.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
              Así de fácil
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              En tres pasos solucionás lo que necesitás, sin vueltas y sin costo.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: SearchIcon,
                title: "1. Buscá",
                text: "Elegí el servicio y tu zona. Te mostramos los mejores profesionales cerca tuyo.",
              },
              {
                icon: UserCheck,
                title: "2. Compará",
                text: "Mirá perfiles, calificaciones y reseñas reales de otros vecinos para decidir tranquilo.",
              },
              {
                icon: MessageCircle,
                title: "3. Contactá",
                text: "Escribile directo por WhatsApp o teléfono. Coordinan el trabajo entre ustedes, gratis.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
              Profesionales mejor puntuados
            </h2>
            <p className="mt-2 text-slate-600">Los favoritos de la comunidad esta semana.</p>
          </div>
          <Link
            href="/buscar"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((pro) => (
            <ProfessionalCard key={pro.id} pro={pro} />
          ))}
        </div>
      </section>

      {/* CONFIANZA */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Profesionales verificados",
              text: "Revisamos identidad y matrículas para que contrates con tranquilidad.",
            },
            {
              icon: Star,
              title: "Reseñas reales",
              text: "Solo califican quienes contrataron. Sin reseñas falsas ni inventadas.",
            },
            {
              icon: MessageCircle,
              title: "Contacto directo y gratis",
              text: "Hablás directo con el profesional. Sin intermediarios ni comisiones.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <item.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA PROFESIONALES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-12 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              ¿Sos profesional? Conseguí más clientes.
            </h2>
            <p className="mt-4 text-lg text-brand-100">
              Sumate gratis, mostrá tus trabajos y recibí pedidos de gente de tu zona.
              Sin comisiones por trabajo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sumate"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-700 shadow-sm transition-transform hover:scale-[1.02]"
              >
                Crear mi perfil gratis <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/como-funciona"
                className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
