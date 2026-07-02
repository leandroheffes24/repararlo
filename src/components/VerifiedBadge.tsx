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
      <span className={`stamp text-emerald-700 ${className}`}>
        <BadgeCheck className="h-3.5 w-3.5" />
        Verificado
      </span>
    );
  }
  return (
    <BadgeCheck
      className={`h-5 w-5 text-emerald-600 ${className}`}
      aria-label="Profesional verificado"
    />
  );
}
