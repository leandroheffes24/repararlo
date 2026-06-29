import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="Repararlo — Inicio"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm transition-transform group-hover:-rotate-6">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18l3 3 6.4-6.3a4 4 0 0 0 5.3-5.4l-2.6 2.6-2.1-.5-.5-2.1z" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-400 ring-2 ring-white" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
        Repar<span className="text-brand-600">arlo</span>
      </span>
    </Link>
  );
}
