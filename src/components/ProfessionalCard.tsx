import Link from "next/link";
import { MapPin, Clock, CheckCircle2 } from "lucide-react";
import type { Professional } from "@/lib/types";
import { Avatar } from "./Avatar";
import { RatingStars } from "./RatingStars";
import { VerifiedBadge } from "./VerifiedBadge";
import { categoryName } from "@/lib/data/categories";
import { formatPrice } from "@/lib/utils";

export function ProfessionalCard({ pro }: { pro: Professional }) {
  return (
    <Link
      href={`/profesionales/${pro.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar name={pro.name} hue={pro.avatarHue} size="md" src={pro.avatarUrl} />
          {pro.available && (
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-base font-bold text-slate-900 group-hover:text-brand-700">
              {pro.name}
            </h3>
            {pro.verified && <VerifiedBadge />}
          </div>
          <p className="truncate text-sm text-slate-500">{pro.headline}</p>
          <div className="mt-1.5">
            <RatingStars rating={pro.rating} showValue reviewCount={pro.reviewCount} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {pro.categorySlugs.slice(0, 2).map((slug) => (
          <span
            key={slug}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            {categoryName(slug)}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-slate-500">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">
            {pro.city}, {pro.province}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
          {pro.respondsIn}
        </p>
        <p className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
          {pro.jobsDone} trabajos realizados
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-slate-900">
          {formatPrice(pro.priceFrom, pro.priceUnit)}
        </span>
        <span className="text-sm font-semibold text-brand-600 group-hover:text-brand-700">
          Ver perfil →
        </span>
      </div>
    </Link>
  );
}
