"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { submitReviewAction } from "@/app/profesionales/actions";

export function ReviewForm({
  professionalId,
  professionalName,
  existing,
}: {
  professionalId: string;
  professionalName: string;
  existing?: { rating: number; comment: string } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Elegí una calificación de 1 a 5 estrellas.");
      return;
    }
    setStatus("saving");
    const res = await submitReviewAction({ professionalId, rating, comment });
    if (!res.ok) {
      setError(res.error ?? "No pudimos guardar tu reseña.");
      setStatus("idle");
      return;
    }
    setStatus("done");
    router.refresh();
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
        <p className="mt-2 font-semibold text-slate-900">¡Gracias por tu reseña!</p>
        <p className="mt-1 text-sm text-slate-600">
          Tu opinión ayuda a otros vecinos a elegir mejor.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Editar mi reseña
        </button>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 p-5">
      <h3 className="font-display font-bold text-slate-900">
        {existing ? "Editá tu reseña" : "Dejá tu reseña"}
      </h3>
      <p className="mt-0.5 text-sm text-slate-500">
        ¿Cómo fue tu experiencia con {professionalName.split(" ")[0]}?
      </p>

      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className="p-0.5"
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                n <= shown ? "fill-accent-400 text-accent-400" : "fill-slate-200 text-slate-200"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Contá cómo fue el trabajo, la puntualidad, el trato…"
        className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
      >
        {status === "saving" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Enviando…
          </>
        ) : existing ? (
          "Guardar cambios"
        ) : (
          "Publicar reseña"
        )}
      </button>
    </form>
  );
}
