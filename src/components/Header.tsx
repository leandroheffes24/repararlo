"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Search, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";
import { SignOutButton } from "./auth/SignOutButton";
import { NotificationsBell } from "./NotificationsBell";
import { createSupabaseBrowser, supabaseBrowserConfigured } from "@/lib/supabase/client";

const navLinks = [
  { href: "/buscar", label: "Buscar profesionales" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/sumate", label: "Soy profesional" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseBrowserConfigured) return;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(Boolean(data.user));
      setAvatarUrl((data.user?.user_metadata?.avatar_url as string) ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
      setAvatarUrl((session?.user?.user_metadata?.avatar_url as string) ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-brand-700/10 bg-[#f8f5ee]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {loggedIn && <NotificationsBell />}
          <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <>
              <Link
                href="/panel"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Mi perfil"
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                  </span>
                )}
                Mi panel
              </Link>
              <SignOutButton className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900" />
            </>
          ) : (
            <>
              <Link
                href="/ingresar"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Ingresar
              </Link>
              <Link
                href="/registrarse?rol=profesional"
                className="inline-flex items-center rounded-lg border-2 border-brand-700 bg-accent-400 px-4 py-2 text-sm font-bold text-brand-700 shadow-[3px_3px_0_0_#1d2433] transition-all hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_#1d2433]"
              >
                Sumate gratis
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-brand-700/10 bg-[#f8f5ee] md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <Link
              href="/buscar"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              <Search className="h-4 w-4" /> Buscar profesionales
            </Link>
            <Link
              href="/como-funciona"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Cómo funciona
            </Link>
            {loggedIn ? (
              <>
                <Link
                  href="/panel"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Mi panel
                </Link>
                <div className="px-3 py-2.5">
                  <SignOutButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/ingresar"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registrarse?rol=profesional"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-lg border-2 border-brand-700 bg-accent-400 px-3 py-2.5 text-center text-base font-bold text-brand-700"
                >
                  Sumate gratis
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
