import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { FeedbackLink } from "./FeedbackLink";

export function Footer() {
  const topCategories = categories.slice(0, 6);

  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <span className="text-sm font-bold">R</span>
            </span>
            <span className="font-display text-lg font-extrabold text-slate-900">
              Repararlo
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            La forma simple de encontrar profesionales de confianza para tu hogar en
            Argentina.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Servicios</h3>
          <ul className="mt-3 space-y-2">
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categorias/${c.slug}`}
                  className="text-sm text-slate-500 transition-colors hover:text-brand-700"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Plataforma</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/buscar" className="text-sm text-slate-500 hover:text-brand-700">
                Buscar profesionales
              </Link>
            </li>
            <li>
              <Link href="/como-funciona" className="text-sm text-slate-500 hover:text-brand-700">
                Cómo funciona
              </Link>
            </li>
            <li>
              <Link href="/sumate" className="text-sm text-slate-500 hover:text-brand-700">
                Sumate como profesional
              </Link>
            </li>
            <li>
              <FeedbackLink />
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Empresa</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <span className="text-sm text-slate-400">Sobre nosotros</span>
            </li>
            <li>
              <span className="text-sm text-slate-400">Términos y condiciones</span>
            </li>
            <li>
              <span className="text-sm text-slate-400">Privacidad</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Repararlo. Hecho en Argentina 🇦🇷</p>
          <p>Conectamos personas con profesionales de confianza.</p>
        </div>
      </div>
    </footer>
  );
}
