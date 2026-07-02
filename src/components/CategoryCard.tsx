import Link from "next/link";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group flex cursor-pointer flex-col items-start gap-3 rounded-2xl border-2 border-brand-700/15 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-700 hover:shadow-[5px_5px_0_0_#1d2433]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-brand-700 bg-accent-400 text-brand-700 transition-transform duration-200 group-hover:-rotate-6">
        <CategoryIcon slug={category.slug} className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-display text-base leading-snug text-brand-700">
          {category.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-brand-500">{category.description}</p>
      </div>
      <span className="mt-auto font-display text-xs uppercase tracking-wider text-brand-600 underline decoration-accent-400 decoration-2 underline-offset-4">
        Ver profesionales
      </span>
    </Link>
  );
}
