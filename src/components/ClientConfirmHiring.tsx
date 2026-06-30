"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { confirmHiringClientAction } from "@/app/profesionales/actions";

export function ClientConfirmHiring({ professionalId }: { professionalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setError(null);
    setLoading(true);
    const res = await confirmHiringClientAction(professionalId);
    if (!res.ok) {
      setError(res.error ?? "No pudimos registrar tu confirmación.");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={confirm}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
        Sí, lo contraté
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
