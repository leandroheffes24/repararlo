import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/api/", "/ingresar", "/registrarse"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
