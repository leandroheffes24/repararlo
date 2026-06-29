import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Ingresá a tu cuenta de Repararlo.",
};

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/panel");

  const { next } = await searchParams;

  return (
    <section className="bg-brand-gradient">
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:py-24">
        <Logo />
        <p className="mt-3 text-center text-slate-600">
          Bienvenido de nuevo. Ingresá para continuar.
        </p>
        <div className="mt-8 w-full">
          <LoginForm next={next && next.startsWith("/") ? next : "/panel"} />
        </div>
      </div>
    </section>
  );
}
