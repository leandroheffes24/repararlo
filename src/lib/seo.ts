/** URL base pública del sitio (para canónicos, sitemap, JSON-LD y OG). */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://repararlo.com.ar";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
