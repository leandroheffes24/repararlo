import Link from "next/link";
import type { Category } from "@/lib/types";
import { professionalsByCategory } from "@/lib/data/professionals";

export function CategoryCard({ category }: { category: Category }) {
  const count = professionalsByCategory(category.slug).length;
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-card-hover)]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition-colors group-hover:bg-brand-100">
        {category.icon}
      </span>
      <div>
        <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-brand-700">
          {category.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{category.description}</p>
      </div>
      <span className="mt-auto text-xs font-medium text-slate-400">
        {count > 0 ? `${count} profesional${count > 1 ? "es" : ""}` : "Próximamente"}
      </span>
    </Link>
  );
}
