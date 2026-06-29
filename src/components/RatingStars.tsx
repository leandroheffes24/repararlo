import { Star } from "lucide-react";

export function RatingStars({
  rating,
  size = 16,
  showValue = false,
  reviewCount,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const display = rating - full >= 0.75 ? full + 1 : full;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < display;
          const half = !filled && hasHalf && i === full;
          return (
            <Star
              key={i}
              width={size}
              height={size}
              className={
                filled
                  ? "fill-accent-400 text-accent-400"
                  : half
                    ? "fill-accent-200 text-accent-400"
                    : "fill-slate-200 text-slate-200"
              }
            />
          );
        })}
      </span>
      {showValue && (
        <span className="text-sm font-semibold text-slate-900">
          {rating.toFixed(1)}
          {typeof reviewCount === "number" && (
            <span className="ml-1 font-normal text-slate-500">({reviewCount})</span>
          )}
        </span>
      )}
    </span>
  );
}
