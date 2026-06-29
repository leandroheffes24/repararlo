"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { ProvinceSelect } from "./ProvinceSelect";

export function SearchBar({
  size = "lg",
  defaultQuery = "",
  defaultProvinceId = "",
}: {
  size?: "lg" | "md";
  defaultQuery?: string;
  defaultProvinceId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [provinceId, setProvinceId] = useState(defaultProvinceId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (provinceId) params.set("provincia", provinceId);
    router.push(`/buscar${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const pad = size === "lg" ? "py-3.5" : "py-2.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-[var(--shadow-card-hover)] ring-1 ring-slate-100 sm:flex-row sm:items-center sm:rounded-full"
    >
      <div className={`flex flex-1 items-center gap-2.5 px-4 ${pad}`}>
        <Search className="h-5 w-5 shrink-0 text-slate-400" />
        <input
          type="text"
          list="cat-list"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué necesitás? Ej: plomero, electricista…"
          className="w-full bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
          aria-label="Qué servicio necesitás"
        />
        <datalist id="cat-list">
          {categories.map((c) => (
            <option key={c.slug} value={c.name} />
          ))}
        </datalist>
      </div>

      <div className="hidden h-8 w-px bg-slate-200 sm:block" />

      <div className={`flex flex-1 items-center gap-2.5 px-4 ${pad}`}>
        <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
        <ProvinceSelect
          value={provinceId}
          onChange={setProvinceId}
          ariaLabel="En qué provincia"
          className="w-full cursor-pointer bg-transparent text-[15px] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
      >
        <Search className="h-5 w-5 sm:hidden" />
        Buscar
      </button>
    </form>
  );
}
