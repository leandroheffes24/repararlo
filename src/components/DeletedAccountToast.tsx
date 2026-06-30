"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function DeletedAccountToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cuenta") !== "eliminada") return;
    setShow(true);
    // Limpiar el parámetro de la URL
    params.delete("cuenta");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    const t = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      Tu cuenta fue eliminada. ¡Gracias por usar Repararlo!
    </div>
  );
}
