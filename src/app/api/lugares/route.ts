import { NextResponse } from "next/server";
import { normalize } from "@/lib/utils";
import type { Lugar } from "@/lib/lugares";

const GEOREF = "https://apis.datos.gob.ar/georef/api";

type GeorefItem = { nombre: string; provincia?: { nombre?: string } };

async function fetchGeoref(
  recurso: "localidades" | "municipios",
  q: string,
  provinciaId?: string
): Promise<GeorefItem[]> {
  const params = new URLSearchParams({
    nombre: q,
    campos: "nombre,provincia",
    max: "15",
  });
  if (provinciaId) params.set("provincia", provinciaId);

  try {
    const res = await fetch(`${GEOREF}/${recurso}?${params.toString()}`, {
      signal: AbortSignal.timeout(6000),
      // Cacheamos del lado del server: las ubicaciones casi no cambian.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data[recurso] ?? []) as GeorefItem[];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const provinciaId = searchParams.get("provincia") ?? undefined;

  if (q.length < 2) {
    return NextResponse.json({ lugares: [] });
  }

  const [localidades, municipios] = await Promise.all([
    fetchGeoref("localidades", q, provinciaId),
    fetchGeoref("municipios", q, provinciaId),
  ]);

  const merged: Lugar[] = [
    ...municipios.map((m) => ({
      nombre: m.nombre,
      provincia: m.provincia?.nombre ?? "",
      tipo: "municipio" as const,
    })),
    ...localidades.map((l) => ({
      nombre: l.nombre,
      provincia: l.provincia?.nombre ?? "",
      tipo: "localidad" as const,
    })),
  ];

  // Deduplicar por nombre + provincia
  const seen = new Set<string>();
  const unique = merged.filter((l) => {
    const key = `${normalize(l.nombre)}|${normalize(l.provincia)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Priorizar los que empiezan con lo que escribió el usuario
  const nq = normalize(q);
  unique.sort((a, b) => {
    const aStarts = normalize(a.nombre).startsWith(nq) ? 0 : 1;
    const bStarts = normalize(b.nombre).startsWith(nq) ? 0 : 1;
    return aStarts - bStarts || a.nombre.localeCompare(b.nombre, "es");
  });

  return NextResponse.json(
    { lugares: unique.slice(0, 10) },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
  );
}
