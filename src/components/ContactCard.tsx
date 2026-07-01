"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, Shield, Eye, LogIn } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function ContactCard({
  professionalId,
  slug,
  isLoggedIn,
  name,
  phone,
  priceFrom,
  priceUnit,
  respondsIn,
  available,
}: {
  professionalId: string;
  slug: string;
  isLoggedIn: boolean;
  name: string;
  phone: string;
  priceFrom?: number;
  priceUnit?: string;
  respondsIn: string;
  available: boolean;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const digits = phone.replace(/[^0-9]/g, "");

  function reveal() {
    setRevealed(true);
    // Registramos el contacto (si está logueado). Al confirmarse, refrescamos
    // para que se habilite el formulario de reseña sin recargar la página.
    fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professionalId }),
    })
      .then((res) => {
        if (res.ok) router.refresh();
      })
      .catch(() => {});
  }
  const waMessage = encodeURIComponent(
    `¡Hola ${name.split(" ")[0]}! Te contacto desde Repararlo. Necesito un presupuesto.`
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">Precio orientativo</span>
        {available ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Disponible
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            Agenda completa
          </span>
        )}
      </div>
      <p className="mt-1 font-display text-2xl font-extrabold text-slate-900">
        {formatPrice(priceFrom, priceUnit)}
      </p>
      <p className="mt-1 text-sm text-slate-500">{respondsIn}</p>

      {!isLoggedIn ? (
        <div className="mt-5 space-y-2.5">
          <Link
            href={`/ingresar?next=/profesionales/${slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <LogIn className="h-5 w-5" />
            Ingresá para ver el contacto
          </Link>
          <Link
            href={`/registrarse?next=/profesionales/${slug}`}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            Crear cuenta gratis
          </Link>
          <p className="text-center text-xs text-slate-400">
            Con tu cuenta (gratis) contactás al profesional y después podés dejarle tu
            reseña.
          </p>
        </div>
      ) : !revealed ? (
        <button
          onClick={reveal}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Eye className="h-5 w-5" />
          Ver datos de contacto
        </button>
      ) : (
        <div className="mt-5 space-y-2.5">
          <a
            href={`https://wa.me/${digits}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            <MessageCircle className="h-5 w-5" />
            Escribir por WhatsApp
          </a>
          <a
            href={`tel:${digits}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <Phone className="h-5 w-5" />
            {phone}
          </a>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs text-slate-400">
        <Shield className="mt-0.5 h-4 w-4 shrink-0" />
        Coordiná y pagá el trabajo directamente con el profesional. Repararlo no cobra
        comisión.
      </p>
    </div>
  );
}
