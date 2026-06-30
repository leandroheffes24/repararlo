"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { compressImage } from "@/lib/image";

async function uploadOne(file: File): Promise<string> {
  const blob = await compressImage(file);
  const fd = new FormData();
  fd.append("file", blob, "trabajo.jpg");
  const res = await fetch("/api/fotos", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "No se pudo subir la imagen");
  return json.url as string;
}

export function WorkPhotosUploader({
  value,
  onChange,
  max = 12,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const slots = max - value.length;
    const toUpload = files.slice(0, Math.max(0, slots));
    if (toUpload.length === 0) return;

    setError(null);
    setUploading(toUpload.length);
    const added: string[] = [];
    for (const f of toUpload) {
      try {
        const url = await uploadOne(f);
        added.push(url);
        onChange([...value, ...added]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir una imagen");
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
  }

  const full = value.length >= max;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Trabajo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/60 p-1 text-white opacity-0 transition-opacity hover:bg-slate-900/80 group-hover:opacity-100"
              aria-label="Quitar foto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50"
          >
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">Agregar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={onFiles}
        className="hidden"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-slate-400">
        Subí fotos de tus trabajos (hasta {max}). Se optimizan automáticamente.
      </p>
    </div>
  );
}
