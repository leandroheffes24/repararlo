"use client";

import { createBrowserClient } from "@supabase/ssr";

/** ¿Están las variables de entorno públicas de Supabase disponibles? */
export const supabaseBrowserConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Cliente de Supabase para el navegador (componentes "use client").
 * Maneja la sesión del usuario mediante cookies.
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
