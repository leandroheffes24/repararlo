export type Lugar = {
  nombre: string;
  provincia: string;
  tipo: "localidad" | "municipio";
};

/** Consulta el endpoint propio /api/lugares (que a su vez usa Georef). */
export async function buscarLugares(
  q: string,
  provinciaId?: string,
  signal?: AbortSignal
): Promise<Lugar[]> {
  if (q.trim().length < 2) return [];
  const params = new URLSearchParams({ q: q.trim() });
  if (provinciaId) params.set("provincia", provinciaId);
  try {
    const res = await fetch(`/api/lugares?${params.toString()}`, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.lugares ?? []) as Lugar[];
  } catch {
    return [];
  }
}
