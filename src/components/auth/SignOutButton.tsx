"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowser, supabaseBrowserConfigured } from "@/lib/supabase/client";

export function SignOutButton({
  className = "",
  withIcon = true,
}: {
  className?: string;
  withIcon?: boolean;
}) {
  const router = useRouter();

  async function signOut() {
    if (supabaseBrowserConfigured) {
      await createSupabaseBrowser().auth.signOut();
    }
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className={className || "inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"}
    >
      {withIcon && <LogOut className="h-4 w-4" />}
      Salir
    </button>
  );
}
