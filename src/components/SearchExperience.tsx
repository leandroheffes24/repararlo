"use client";

import { useMemo, useState } from "react";
import { Search, MapPin, SlidersHorizontal, X, Star, Frown } from "lucide-react";
import { ProfessionalCard } from "./ProfessionalCard";
import { ProvinceSelect } from "./ProvinceSelect";
import { CategoryIcon } from "./CategoryIcon";
import { categories } from "@/lib/data/categories";
import { provinceById } from "@/lib/data/provinces";
import type { Professional } from "@/lib/types";
import { filterProfessionals, provinceMatches, type SortKey } from "@/lib/utils";

const ratingOptions = [
  { value: 0, label: "Todas" },
  { value: 4, label: "4,0+" },
  { value: 4.5, label: "4,5+" },
  { value: 4.8, label: "4,8+" },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "relevancia", label: "Más relevantes" },
  { value: "mejor-puntuados", label: "Mejor puntuados" },
  { value: "mas-trabajos", label: "Más trabajos" },
  { value: "precio", label: "Menor precio" },
];

export function SearchExperience({
  proList,
  initialQuery = "",
  initialProvinceId = "",
  initialProvinceName = "",
  initialArea = "",
  initialCategory = "",
}: {
  proList: Professional[];
  initialQuery?: string;
  initialProvinceId?: string;
  initialProvinceName?: string;
  initialArea?: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [provinceId, setProvinceId] = useState(initialProvinceId);
  const [area, setArea] = useState(initialArea);
  const [category, setCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [mobileOpen, setMobileOpen] = useState(false);

  const provinceName = provinceById(provinceId)?.name ?? initialProvinceName;

  const results = useMemo(
    () =>
      filterProfessionals(proList, {
        query,
        province: provinceName || undefined,
        area,
        category: category || undefined,
        minRating,
        verifiedOnly,
        availableOnly,
        sort,
      }),
    [proList, query, provinceName, area, category, minRating, verifiedOnly, availableOnly, sort]
  );

  // Localidades que TIENEN profesionales en la provincia elegida (facetas)
  const localityFacets = useMemo(() => {
    if (!provinceName) return [];
    const counts = new Map<string, number>();
    proList
      .filter((p) => provinceMatches(p.province, provinceName))
      .forEach((p) => {
        const locs = new Set<string>();
        if (p.city) locs.add(p.city);
        p.serviceAreas.forEach((a) => a && locs.add(a));
        locs.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1));
      });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
      .map(([name, count]) => ({ name, count }));
  }, [proList, provinceName]);

  function changeProvince(id: string) {
    setProvinceId(id);
    setArea(""); // las localidades dependen de la provincia
  }

  function clearFilters() {
    setCategory("");
    setArea("");
    setMinRating(0);
    setVerifiedOnly(false);
    setAvailableOnly(false);
  }

  const filtersActive =
    Boolean(category) || Boolean(area) || minRating > 0 || verifiedOnly || availableOnly;

  const FiltersPanel = (
    <div className="space-y-6">
      {/* Localidad (depende de la provincia) */}
      {provinceName && localityFacets.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Localidad</h3>
          <p className="mb-3 text-xs text-slate-400">
            {provinceById(provinceId)?.label ?? provinceName}
          </p>
          <div className="-mr-1 max-h-72 space-y-1 overflow-auto pr-1">
            <button
              onClick={() => setArea("")}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                !area
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Todas las localidades
            </button>
            {localityFacets.map((f) => (
              <button
                key={f.name}
                onClick={() => setArea(f.name)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  area === f.name
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <span className="shrink-0 text-xs text-slate-400">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Rubro</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategory("")}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              !category
                ? "bg-brand-50 font-semibold text-brand-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Todos los rubros
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                category === c.slug
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <CategoryIcon slug={c.slug} className="h-4 w-4 shrink-0" />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Calificación mínima</h3>
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMinRating(opt.value)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                minRating === opt.value
                  ? "border-brand-200 bg-brand-50 font-semibold text-brand-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.value > 0 && <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">Solo verificados</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">Disponibles ahora</span>
        </label>
      </div>

      {filtersActive && (
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Buscador superior */}
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-[var(--shadow-card)] ring-1 ring-slate-100 sm:flex-row sm:items-center sm:rounded-full">
        <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            list="cat-list-search"
            placeholder="¿Qué necesitás?"
            className="w-full bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <datalist id="cat-list-search">
            {categories.map((c) => (
              <option key={c.slug} value={c.name} />
            ))}
          </datalist>
        </div>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
          <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
          <ProvinceSelect
            value={provinceId}
            onChange={changeProvince}
            ariaLabel="Provincia"
            className="w-full cursor-pointer bg-transparent text-[15px] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-100 bg-white p-5 shadow-[var(--shadow-card)]">
            {FiltersPanel}
          </div>
        </aside>

        <div>
          {/* Barra de resultados */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{results.length}</span>{" "}
              {results.length === 1 ? "profesional" : "profesionales"}
              {area
                ? ` en ${area}`
                : provinceName
                  ? ` en ${provinceById(provinceId)?.label ?? provinceName}`
                  : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {filtersActive && <span className="h-2 w-2 rounded-full bg-brand-600" />}
              </button>
              <label className="sr-only" htmlFor="sort">
                Ordenar
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((pro) => (
                <ProfessionalCard key={pro.id} pro={pro} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <Frown className="h-10 w-10 text-slate-300" />
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                No encontramos resultados
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Probá con otros términos o quitá algunos filtros para ver más
                profesionales.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  clearFilters();
                }}
                className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtros mobile (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">Filtros</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FiltersPanel}
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white"
            >
              Ver {results.length} resultados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
