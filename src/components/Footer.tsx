import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { FeedbackLink } from "./FeedbackLink";

export function Footer() {
  const topCategories = categories.slice(0, 6);

  return (
    <footer>
      {/* Franja de peligro: firma visual de la marca */}
      <div className="hazard" aria-hidden="true" />

      <div className="bg-brand-800 text-slate-300">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border-2 border-accent-400 bg-accent-400 text-brand-800">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18l3 3 6.4-6.3a4 4 0 0 0 5.3-5.4l-2.6 2.6-2.1-.5-.5-2.1z" />
                </svg>
              </span>
              <span className="font-display text-lg text-white">Repararlo</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              Oficios de confianza, cerca tuyo. La forma simple de encontrar quien lo
              arregle.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xs uppercase tracking-widest text-accent-400">
              Servicios
            </h3>
            <ul className="mt-4 space-y-2">
              {topCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className="text-sm text-slate-400 transition-colors hover:text-accent-300"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs uppercase tracking-widest text-accent-400">
              Plataforma
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/buscar" className="text-sm text-slate-400 transition-colors hover:text-accent-300">
                  Buscar profesionales
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-sm text-slate-400 transition-colors hover:text-accent-300">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/sumate" className="text-sm text-slate-400 transition-colors hover:text-accent-300">
                  Sumate como profesional
                </Link>
              </li>
              <li>
                <FeedbackLink className="text-sm text-slate-400 transition-colors hover:text-accent-300" />
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs uppercase tracking-widest text-accent-400">
              Empresa
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-slate-500">Sobre nosotros</span>
              </li>
              <li>
                <span className="text-sm text-slate-500">Términos y condiciones</span>
              </li>
              <li>
                <span className="text-sm text-slate-500">Privacidad</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Repararlo · Hecho en Argentina 🇦🇷</p>
            <p>Conectamos personas con oficios de confianza.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
