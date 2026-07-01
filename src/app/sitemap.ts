import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { categories } from "@/lib/data/categories";
import { getProfessionals } from "@/lib/data/repository";

export const revalidate = 3600; // regenerar cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/buscar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/sumate`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/categorias/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  let professionalPages: MetadataRoute.Sitemap = [];
  try {
    const pros = await getProfessionals();
    professionalPages = pros.map((p) => ({
      url: `${base}/profesionales/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    /* sin base de datos: solo páginas estáticas */
  }

  return [...staticPages, ...categoryPages, ...professionalPages];
}
