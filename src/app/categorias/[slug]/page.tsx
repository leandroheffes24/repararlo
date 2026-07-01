import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { categories, categoryBySlug } from "@/lib/data/categories";
import { getProfessionalsByCategory } from "@/lib/data/repository";
import { filterProfessionals } from "@/lib/utils";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { CategoryCard } from "@/components/CategoryCard";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 30;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return { title: "Rubro no encontrado" };
  const url = absoluteUrl(`/categorias/${category.slug}`);
  const description = `Encontrá ${category.singular}s verificados cerca tuyo. ${category.description} Contactalos gratis en Repararlo.`;
  return {
    title: `${category.name} cerca tuyo`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${category.name} — Repararlo`, description, url, type: "website" },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const pros = filterProfessionals(await getProfessionalsByCategory(category.slug), {
    sort: "relevancia",
  });

  const otherCategories = categories.filter((c) => c.slug !== category.slug).slice(0, 4);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Servicios", item: absoluteUrl("/buscar") },
      { "@type": "ListItem", position: 3, name: category.name, item: absoluteUrl(`/categorias/${category.slug}`) },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {/* Hero del rubro */}
      <section className="bg-brand-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/buscar" className="hover:text-slate-900">
              Servicios
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{category.name}</span>
          </nav>

          <div className="mt-6 flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
              {category.icon}
            </span>
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-2 max-w-2xl text-lg text-slate-600">
                {category.description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {category.tasks.map((task) => (
              <span
                key={task}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
              >
                <Check className="h-4 w-4 text-brand-600" />
                {task}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Listado */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold text-slate-900">
            {pros.length > 0
              ? `${pros.length} ${category.singular}${pros.length > 1 ? "s" : ""} disponible${pros.length > 1 ? "s" : ""}`
              : "Pronto sumaremos profesionales"}
          </h2>
          <Link
            href="/buscar"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline-flex"
          >
            Búsqueda avanzada <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pros.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pros.map((pro) => (
              <ProfessionalCard key={pro.id} pro={pro} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">
              Todavía no tenemos {category.singular}s en esta zona, pero sumamos
              profesionales todas las semanas.
            </p>
            <Link
              href="/sumate"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              ¿Sos {category.singular}? Sumate gratis
            </Link>
          </div>
        )}
      </section>

      {/* Otros rubros */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-extrabold text-slate-900">
            Otros servicios
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {otherCategories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
