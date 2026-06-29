import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";
import { categories } from "@/lib/data/categories";
import { provinceById } from "@/lib/data/provinces";
import { getProfessionals } from "@/lib/data/repository";
import { normalize } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Buscar profesionales",
  description:
    "Buscá y compará plomeros, electricistas, albañiles y más profesionales verificados cerca tuyo.",
};

export const revalidate = 30;

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; provincia?: string; zona?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const zona = sp.zona ?? "";
  const provinceId = sp.provincia ?? "";
  const provinceName = provinceById(provinceId)?.name ?? "";
  const proList = await getProfessionals();

  // Si el texto buscado coincide con un rubro, lo usamos como filtro de categoría
  const matchedCategory =
    categories.find((c) => normalize(c.name) === normalize(q))?.slug ??
    (sp.q && categories.some((c) => c.slug === sp.q) ? sp.q : "");

  const initialQuery = matchedCategory ? "" : q;

  return (
    <SearchExperience
      key={`${q}|${provinceId}|${zona}|${matchedCategory}`}
      proList={proList}
      initialQuery={initialQuery}
      initialProvinceId={provinceId}
      initialProvinceName={provinceName}
      initialArea={zona}
      initialCategory={matchedCategory}
    />
  );
}
