"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image";
import { initials } from "@/lib/utils";

export function AvatarUploader({
  name,
  hue,
  initialUrl,
}: {
  name: string;
  hue: number;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const blob = await compressImage(file, 512, 0.85);
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo subir la foto");
      setUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la foto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <span
          className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full font-display text-2xl font-bold text-white"
          style={
            url
              ? undefined
              : {
                  background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${
                    (hue + 35) % 360
                  } 75% 45%))`,
                }
          }
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials(name)
          )}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-70"
          aria-label="Cambiar foto de perfil"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
      </div>

      <div>
        <p className="font-display font-bold text-slate-900">Foto de perfil</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-70"
        >
          {url ? "Cambiar foto" : "Subir foto"}
        </button>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFile}
        className="hidden"
      />
    </div>
  );
}
