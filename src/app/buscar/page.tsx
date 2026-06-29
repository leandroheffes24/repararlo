import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";
import { categories } from "@/lib/data/categories";
import { normalize } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Buscar profesionales",
  description:
    "Buscá y compará plomeros, electricistas, albañiles y más profesionales verificados cerca tuyo.",
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; zona?: string; categoria?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const zona = sp.zona ?? "";

  // Si el texto buscado coincide con un rubro, lo usamos como filtro de categoría
  const matchedCategory =
    categories.find((c) => normalize(c.name) === normalize(q))?.slug ??
    (sp.categoria && categories.some((c) => c.slug === sp.categoria)
      ? sp.categoria
      : "");

  const initialQuery = matchedCategory ? "" : q;

  return (
    <SearchExperience
      key={`${q}|${zona}|${matchedCategory}`}
      initialQuery={initialQuery}
      initialArea={zona}
      initialCategory={matchedCategory}
    />
  );
}
