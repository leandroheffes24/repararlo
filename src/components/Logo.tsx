import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Repararlo — Inicio"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-brand-700 bg-accent-400 shadow-[3px_3px_0_0_#1d2433] transition-transform duration-200 group-hover:-translate-y-0.5">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1d2433"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18l3 3 6.4-6.3a4 4 0 0 0 5.3-5.4l-2.6 2.6-2.1-.5-.5-2.1z" />
        </svg>
      </span>
      <span className="font-display text-[1.35rem] leading-none tracking-tight text-brand-700">
        Repararlo
      </span>
    </Link>
  );
}
