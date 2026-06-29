import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({
  withLabel = false,
  className = "",
}: {
  withLabel?: boolean;
  className?: string;
}) {
  if (withLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ${className}`}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        Verificado
      </span>
    );
  }
  return (
    <BadgeCheck
      className={`h-5 w-5 text-brand-600 ${className}`}
      aria-label="Profesional verificado"
    />
  );
}
