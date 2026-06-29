"use client";

import { provinces } from "@/lib/data/provinces";

export function ProvinceSelect({
  value,
  onChange,
  className = "",
  placeholder = "¿En qué provincia?",
  ariaLabel,
}: {
  value: string;
  onChange: (provinceId: string) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={`${className} ${value ? "text-slate-900" : "text-slate-400"}`}
    >
      <option value="">{placeholder}</option>
      {provinces.map((p) => (
        <option key={p.id} value={p.id} className="text-slate-900">
          {p.label}
        </option>
      ))}
    </select>
  );
}
