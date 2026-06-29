import type { Professional } from "@/lib/types";

/** Quita acentos y pasa a minúsculas para comparar/buscar */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function formatPrice(value?: number, unit?: string): string {
  if (!value || value === 0) return "A presupuestar";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
  const unitLabel = unit === "hora" ? " / hora" : unit === "visita" ? " la visita" : "";
  return `Desde ${formatted}${unitLabel}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export type SortKey = "relevancia" | "mejor-puntuados" | "mas-trabajos" | "precio";

/** Compara la provincia del profesional con la elegida (nombres canónicos). */
export function provinceMatches(proProvince: string, selected: string): boolean {
  if (!selected) return true;
  return normalize(proProvince) === normalize(selected);
}

export type SearchFilters = {
  query?: string;
  category?: string;
  province?: string;
  area?: string;
  minRating?: number;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  sort?: SortKey;
};

export function filterProfessionals(
  list: Professional[],
  filters: SearchFilters
): Professional[] {
  const q = filters.query ? normalize(filters.query) : "";
  const area = filters.area ? normalize(filters.area) : "";

  let result = list.filter((p) => {
    if (filters.category && !p.categorySlugs.includes(filters.category)) return false;
    if (filters.province && !provinceMatches(p.province, filters.province)) return false;
    if (filters.verifiedOnly && !p.verified) return false;
    if (filters.availableOnly && !p.available) return false;
    if (filters.minRating && p.rating < filters.minRating) return false;

    if (area) {
      const inArea =
        normalize(p.city).includes(area) ||
        normalize(p.province).includes(area) ||
        p.serviceAreas.some((a) => normalize(a).includes(area));
      if (!inArea) return false;
    }

    if (q) {
      const haystack = normalize(
        [p.name, p.headline, p.about, p.skills.join(" "), p.city, p.province].join(" ")
      );
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  switch (filters.sort) {
    case "mejor-puntuados":
      result = [...result].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "mas-trabajos":
      result = [...result].sort((a, b) => b.jobsDone - a.jobsDone);
      break;
    case "precio":
      result = [...result].sort(
        (a, b) => (a.priceFrom || Infinity) - (b.priceFrom || Infinity)
      );
      break;
    default:
      // relevancia: verificados y mejor puntuados primero
      result = [...result].sort(
        (a, b) =>
          Number(b.verified) - Number(a.verified) ||
          b.rating * Math.log10(b.reviewCount + 1) -
            a.rating * Math.log10(a.reviewCount + 1)
      );
  }

  return result;
}
