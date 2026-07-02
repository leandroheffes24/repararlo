import Link from "next/link";
import { MapPin, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import type { Professional } from "@/lib/types";
import { Avatar } from "./Avatar";
import { RatingStars } from "./RatingStars";
import { VerifiedBadge } from "./VerifiedBadge";
import { categoryName } from "@/lib/data/categories";
import { CategoryIcon } from "./CategoryIcon";
import { formatPrice } from "@/lib/utils";

export function ProfessionalCard({ pro }: { pro: Professional }) {
  return (
    <Link
      href={`/profesionales/${pro.slug}`}
      className="group flex cursor-pointer flex-col rounded-2xl border-2 border-brand-700/15 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-700 hover:shadow-[6px_6px_0_0_#1d2433]"
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar name={pro.name} hue={pro.avatarHue} size="md" src={pro.avatarUrl} />
          {pro.available && (
            <span
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"
              title="Disponible"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-base text-brand-700">
              {pro.name}
            </h3>
            {pro.verified && <VerifiedBadge />}
          </div>
          <p className="truncate text-sm text-brand-500">{pro.headline}</p>
          <div className="mt-1.5">
            {pro.reviewCount > 0 ? (
              <RatingStars rating={pro.rating} showValue reviewCount={pro.reviewCount} />
            ) : (
              <span className="stamp text-emerald-700">Nuevo</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {pro.categorySlugs.slice(0, 2).map((slug) => (
          <span
            key={slug}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-700/15 bg-[#f8f5ee] px-2.5 py-1 text-xs font-semibold text-brand-600"
          >
            <CategoryIcon slug={slug} className="h-3.5 w-3.5" />
            {categoryName(slug)}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-brand-500">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-brand-300" />
          <span className="truncate">
            {pro.city}
            {pro.province ? `, ${pro.province}` : ""}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 shrink-0 text-brand-300" />
          {pro.respondsIn}
        </p>
        <p className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-300" />
          {pro.jobsDone} trabajo{pro.jobsDone === 1 ? "" : "s"} confirmado
          {pro.jobsDone === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-brand-700/15 pt-4">
        <span className="font-display text-sm text-brand-700">
          {formatPrice(pro.priceFrom, pro.priceUnit)}
        </span>
        <span className="inline-flex items-center gap-1 font-display text-sm text-brand-600 underline decoration-accent-400 decoration-2 underline-offset-4 group-hover:text-brand-700">
          Ver perfil <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
