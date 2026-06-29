"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { buscarLugares, type Lugar } from "@/lib/lugares";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (lugar: Lugar) => void;
  provinciaId?: string;
  placeholder?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  leadingIcon?: React.ReactNode;
  ariaLabel?: string;
};

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  provinciaId,
  placeholder = "Ciudad, localidad o barrio…",
  inputClassName = "",
  wrapperClassName = "",
  leadingIcon,
  ariaLabel,
}: Props) {
  const [items, setItems] = useState<Lugar[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipFetch = useRef(false);

  // Búsqueda con debounce
  useEffect(() => {
    if (skipFetch.current) {
      skipFetch.current = false;
      return;
    }
    if (value.trim().length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      const result = await buscarLugares(value, provinciaId, controller.signal);
      setItems(result);
      setActive(-1);
      setOpen(true);
      setLoading(false);
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [value, provinciaId]);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function select(l: Lugar) {
    skipFetch.current = true;
    onChange(l.nombre);
    onSelect?.(l);
    setOpen(false);
    setItems([]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      select(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName}`}>
      <div className="flex items-center gap-2.5">
        {leadingIcon}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => items.length > 0 && setOpen(true)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          className={inputClassName}
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
                  select(l);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors ${
                  active === i ? "bg-brand-50" : "hover:bg-slate-50"
                }`}
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
