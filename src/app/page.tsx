import Link from "next/link";
import {
  ShieldCheck,
  Star,
  MessageCircle,
  Search as SearchIcon,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { categories } from "@/lib/data/categories";
import { getProfessionals } from "@/lib/data/repository";
import { filterProfessionals } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";
import { siteUrl } from "@/lib/seo";

export const revalidate = 30;

export default async function Home() {
  const proList = await getProfessionals();
  const featured = filterProfessionals(proList, {
    sort: "mejor-puntuados",
  }).slice(0, 6);

  const popularCats = categories.slice(0, 8);

  const base = siteUrl();
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Repararlo",
    url: base,
    description:
      "Plataforma de servicios para el hogar en Argentina: plomeros, electricistas, albañiles y más, verificados y con reseñas reales.",
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Repararlo",
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/buscar?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />

      {/* HERO */}
      <section className="bg-brand-gradient">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="hazard-thin w-10 rounded-full" aria-hidden="true" />
            <p className="font-display text-xs uppercase tracking-[0.22em] text-brand-500">
              Oficios de confianza · Argentina
            </p>
          </div>

          <h1 className="mt-6 max-w-3xl font-display text-[2.6rem] leading-[1.02] tracking-tight text-brand-700 sm:text-7xl">
            ¿Se rompió?
            <br />
            <span className="marker-underline">Se arregla.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-500">
            Plomeros, electricistas, gasistas y más oficios cerca tuyo. Mirá reseñas
            reales de vecinos y contactalos <strong className="text-brand-700">gratis</strong>.
          </p>

          <div className="mt-9 max-w-3xl">
            <SearchBar />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-brand-500">Lo más pedido:</span>
            {["plomeria", "electricidad", "gas", "pintura", "aire-acondicionado"].map(
              (slug) => {
                const c = categories.find((x) => x.slug === slug)!;
                return (
                  <Link
                    key={slug}
                    href={`/categorias/${slug}`}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-brand-700/20 bg-white px-3 py-1 font-semibold text-brand-600 transition-colors hover:border-brand-700 hover:text-brand-700"
                  >
                    <CategoryIcon slug={slug} className="h-3.5 w-3.5" />
                    {c.name}
                  </Link>
                );
              }
            )}
          </div>

          {/* Promesas de la casa */}
          <dl className="mt-12 grid max-w-3xl grid-cols-1 divide-y-2 divide-brand-700/10 border-2 border-brand-700/15 bg-white/70 sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0 rounded-xl overflow-hidden">
            {[
              { value: "Gratis", label: "buscar y contactar" },
              { value: "Verificados", label: "identidad y oficio" },
              { value: "Sin comisiones", label: "arreglan entre ustedes" },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-4">
                <dt className="font-display text-lg text-brand-700">{stat.value}</dt>
                <dd className="mt-0.5 text-sm text-brand-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="hazard-thin" aria-hidden="true" />

      {/* RUBROS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-brand-700">
              ¿Qué hay que arreglar?
            </h2>
            <p className="mt-2 text-brand-500">
              Elegí el oficio y encontrá a la persona indicada.
            </p>
          </div>
          <Link
            href="/buscar"
            className="inline-flex cursor-pointer items-center gap-1 font-display text-sm text-brand-600 underline decoration-accent-400 decoration-[3px] underline-offset-4 transition-colors hover:text-brand-700"
          >
            Ver todos los oficios <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {popularCats.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-y-2 border-brand-700/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl tracking-tight text-brand-700">
            Así de simple
          </h2>
          <p className="mt-2 max-w-xl text-brand-500">
            Tres pasos y listo. Sin vueltas, sin costo.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: SearchIcon,
                title: "Buscá",
                text: "Elegí el oficio y tu provincia. Te mostramos a los que trabajan en tu zona.",
              },
              {
                n: "02",
                icon: UserCheck,
                title: "Compará",
                text: "Mirá perfiles, trabajos hechos y reseñas reales de otros vecinos.",
              },
              {
                n: "03",
                icon: MessageCircle,
                title: "Contactá",
                text: "Le escribís directo por WhatsApp. El precio lo arreglan entre ustedes.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="relative rounded-2xl border-2 border-brand-700/15 bg-[#f8f5ee] p-6"
              >
                <span className="font-display text-4xl text-brand-700/15">{step.n}</span>
                <span className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-brand-700 bg-accent-400 text-brand-700">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-xl text-brand-700">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS (solo si hay profesionales reales) */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl tracking-tight text-brand-700">
                Los mejor puntuados
              </h2>
              <p className="mt-2 text-brand-500">Elegidos por la gente, con reseñas reales.</p>
            </div>
            <Link
              href="/buscar"
              className="inline-flex cursor-pointer items-center gap-1 font-display text-sm text-brand-600 underline decoration-accent-400 decoration-[3px] underline-offset-4 transition-colors hover:text-brand-700"
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
      )}

      {/* CONFIANZA */}
      <section className="border-y-2 border-brand-700/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Gente verificada",
              text: "Validamos identidad y matrículas para que contrates tranquilo.",
            },
            {
              icon: Star,
              title: "Reseñas de verdad",
              text: "Solo califica quien contrató. Las dos partes lo confirman.",
            },
            {
              icon: MessageCircle,
              title: "Directo y gratis",
              text: "Hablás con el profesional sin intermediarios ni comisiones.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-brand-700/15 bg-[#f8f5ee] text-brand-700">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-brand-700">{item.title}</h3>
                <p className="mt-1 text-sm text-brand-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA PROFESIONALES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border-2 border-brand-800 bg-brand-800 shadow-[8px_8px_0_0_rgba(29,36,51,0.25)]">
          <div className="hazard" aria-hidden="true" />
          <div className="px-6 py-12 sm:px-12 sm:py-14">
            <p className="font-display text-xs uppercase tracking-[0.22em] text-accent-400">
              Para los que saben del oficio
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-white sm:text-4xl">
              Tu laburo habla por vos. Mostralo acá.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Creá tu perfil gratis, subí fotos de tus trabajos y recibí clientes de tu
              zona. Sin comisiones: lo que cobrás es tuyo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sumate"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-accent-400 bg-accent-400 px-6 py-3 font-display text-brand-800 transition-all hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_rgba(255,194,46,0.35)]"
              >
                Crear mi perfil gratis <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/como-funciona"
                className="inline-flex cursor-pointer items-center rounded-xl border-2 border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
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
