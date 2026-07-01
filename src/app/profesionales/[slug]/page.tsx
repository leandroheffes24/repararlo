import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, CalendarClock, Wrench } from "lucide-react";
import {
  getProfessionalBySlug,
  getUserReview,
  getReviewEligibility,
} from "@/lib/data/repository";
import { categoryBySlug } from "@/lib/data/categories";
import { getCurrentUser } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import { RatingStars } from "@/components/RatingStars";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ContactCard } from "@/components/ContactCard";
import { ReviewForm } from "@/components/ReviewForm";
import { ClientConfirmHiring } from "@/components/ClientConfirmHiring";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pro = await getProfessionalBySlug(slug);
  if (!pro) return { title: "Profesional no encontrado" };
  return {
    title: `${pro.name} — ${pro.headline}`,
    description: `${pro.name}: ${pro.about.slice(0, 150)}`,
  };
}

export default async function ProfessionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getProfessionalBySlug(slug);
  if (!pro) notFound();

  // Reseñas: quién puede reseñar
  const user = await getCurrentUser();
  const isDbPro = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(pro.id);
  const isOwner = Boolean(user && pro.ownerId && user.id === pro.ownerId);
  const existingReview =
    user && isDbPro && !isOwner ? await getUserReview(pro.id, user.id) : null;
  const eligibility =
    user && isDbPro && !isOwner && !existingReview
      ? await getReviewEligibility(pro.id, user.id)
      : null;
  // Puede ver el formulario si ya tiene reseña (para editar) o si contactó.
  const canReview = Boolean(existingReview) || Boolean(eligibility?.canReview);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/buscar"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la búsqueda
      </Link>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        {/* Columna principal */}
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative">
                <Avatar name={pro.name} hue={pro.avatarHue} size="xl" src={pro.avatarUrl} />
                {pro.available && (
                  <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {pro.name}
                  </h1>
                  {pro.verified && <VerifiedBadge withLabel />}
                </div>
                <p className="mt-1 text-slate-600">{pro.headline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {pro.reviewCount > 0 ? (
                    <RatingStars rating={pro.rating} showValue reviewCount={pro.reviewCount} />
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Nuevo en Repararlo
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {pro.city}, {pro.province}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-4">
              <Stat icon={Briefcase} value={`${pro.jobsDone}`} label="Trabajos" />
              <Stat icon={CalendarClock} value={`${pro.yearsExperience} años`} label="Experiencia" />
              <Stat icon={Wrench} value={`${pro.reviewCount}`} label="Reseñas" />
            </div>
          </div>

          {/* Sobre mí */}
          <Section title="Sobre el profesional">
            <p className="leading-relaxed text-slate-600">{pro.about}</p>
          </Section>

          {/* Trabajos realizados */}
          {pro.photos && pro.photos.length > 0 && (
            <Section title="Trabajos realizados">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pro.photos.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Trabajo ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Especialidades */}
          <Section title="Especialidades">
            <div className="flex flex-wrap gap-2">
              {pro.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          {/* Servicios */}
          <Section title="Servicios que ofrece">
            <div className="flex flex-wrap gap-2">
              {pro.categorySlugs.map((slug) => {
                const c = categoryBySlug(slug);
                if (!c) return null;
                return (
                  <Link
                    key={slug}
                    href={`/categorias/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-200 hover:text-brand-700"
                  >
                    <span>{c.icon}</span>
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </Section>

          {/* Zonas */}
          <Section title="Zonas donde trabaja">
            <div className="flex flex-wrap gap-2">
              {pro.serviceAreas.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600"
                >
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {a}
                </span>
              ))}
            </div>
          </Section>

          {/* Reseñas */}
          <Section title={`Reseñas${pro.reviewCount > 0 ? ` (${pro.reviewCount})` : ""}`}>
            {pro.reviewCount > 0 ? (
              <div className="mb-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <span className="font-display text-4xl font-extrabold text-slate-900">
                  {pro.rating.toFixed(1)}
                </span>
                <div>
                  <RatingStars rating={pro.rating} size={18} />
                  <p className="mt-1 text-sm text-slate-500">
                    Basado en {pro.reviewCount} reseña{pro.reviewCount > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mb-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Todavía no tiene reseñas. {isDbPro && !isOwner ? "¡Sé el primero en calificar!" : ""}
              </p>
            )}

            {/* Dejar reseña */}
            {isOwner ? (
              <p className="mb-5 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
                Este es tu perfil. Las reseñas las dejan tus clientes.
              </p>
            ) : !isDbPro ? null : !user ? (
              <Link
                href={`/ingresar?next=/profesionales/${pro.slug}`}
                className="mb-6 block rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-medium text-brand-600 hover:bg-slate-50"
              >
                Iniciá sesión para dejar una reseña →
              </Link>
            ) : canReview ? (
              <div className="mb-6">
                <ReviewForm
                  professionalId={pro.id}
                  professionalName={pro.name}
                  existing={
                    existingReview
                      ? { rating: existingReview.rating, comment: existingReview.comment ?? "" }
                      : null
                  }
                />
              </div>
            ) : eligibility?.state === "pro-declined" ? (
              <p className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                El profesional indicó que no trabajaron juntos, por eso no podés dejar una
                reseña.
              </p>
            ) : (
              <div className="mb-6">
                <ClientConfirmHiring
                  professionalId={pro.id}
                  professionalName={pro.name}
                  confirmed={Boolean(eligibility?.clientConfirmed)}
                  declined={Boolean(eligibility?.clientDeclined)}
                  waitingPro={eligibility?.state === "waiting-pro"}
                />
              </div>
            )}

            <div className="space-y-4">
              {pro.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={review.author} hue={(pro.avatarHue + 90) % 360} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.author}
                        </p>
                        <RatingStars rating={review.rating} size={14} />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(review.date)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Columna lateral (contacto) */}
        <aside className="mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <ContactCard
              professionalId={pro.id}
              slug={pro.slug}
              isLoggedIn={Boolean(user)}
              name={pro.name}
              phone={pro.phone}
              priceFrom={pro.priceFrom}
              priceUnit={pro.priceUnit}
              respondsIn={pro.respondsIn}
              available={pro.available}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <h2 className="mb-4 font-display text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <Icon className="h-5 w-5 text-brand-600" />
      <span className="mt-1.5 font-display text-base font-bold text-slate-900">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
