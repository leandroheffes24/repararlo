"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { buscarLugares, type Lugar } from "@/lib/lugares";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
  provinciaId?: string;
  placeholder?: string;
};

export function ServiceAreasInput({
  value,
  onChange,
  provinciaId,
  placeholder = "Agregá zonas donde trabajás…",
}: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Lugar[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      const result = await buscarLugares(query, provinciaId, controller.signal);
      setItems(result);
      setOpen(true);
      setLoading(false);
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, provinciaId]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function add(nombre: string) {
    const exists = value.some((v) => v.toLowerCase() === nombre.toLowerCase());
    if (!exists) onChange([...value, nombre]);
    setQuery("");
    setItems([]);
    setOpen(false);
  }

  function remove(nombre: string) {
    onChange(value.filter((v) => v !== nombre));
  }

  return (
    <div ref={containerRef} className="relative">
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((zona) => (
            <span
              key={zona}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-medium text-brand-700"
            >
              {zona}
              <button
                type="button"
                onClick={() => remove(zona)}
                className="rounded-full p-0.5 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
                aria-label={`Quitar ${zona}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-300" />}
      </div>

      {open && items.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-xl border border-slate-100 bg-white py-1.5 shadow-[var(--shadow-card-hover)]">
          {items.map((l, i) => (
            <li key={`${l.nombre}-${l.provincia}-${i}`}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(l.nombre);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors hover:bg-slate-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                  {l.nombre}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{l.provincia}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
