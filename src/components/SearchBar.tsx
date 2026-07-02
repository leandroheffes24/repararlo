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
      className="flex w-full flex-col gap-2 rounded-2xl border-2 border-brand-700 bg-white p-2 shadow-[6px_6px_0_0_#1d2433] sm:flex-row sm:items-center"
    >
      <div className={`flex flex-1 items-center gap-2.5 px-4 ${pad}`}>
        <Search className="h-5 w-5 shrink-0 text-brand-300" />
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

      <div className="hidden h-8 w-0.5 bg-brand-700/15 sm:block" />

      <div className={`flex flex-1 items-center gap-2.5 px-4 ${pad}`}>
        <MapPin className="h-5 w-5 shrink-0 text-brand-300" />
        <ProvinceSelect
          value={provinceId}
          onChange={setProvinceId}
          ariaLabel="En qué provincia"
          className="w-full cursor-pointer bg-transparent text-[15px] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-brand-700 bg-accent-400 px-6 py-3 font-display text-brand-700 transition-all hover:-translate-y-0.5 hover:bg-accent-300"
      >
        <Search className="h-5 w-5 sm:hidden" />
        Buscar
      </button>
    </form>
  );
}
