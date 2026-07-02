import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { DeletedAccountToast } from "@/components/DeletedAccountToast";
import { siteUrl } from "@/lib/seo";

/* Archivo y Archivo Black: tipografías de Omnibus-Type (Argentina) */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Repararlo — Encontrá al profesional ideal para tu hogar",
    template: "%s · Repararlo",
  },
  description:
    "Plomeros, electricistas, albañiles, gasistas y más. Encontrá profesionales verificados cerca tuyo, mirá reseñas reales y contactalos gratis. La plataforma de servicios para el hogar en Argentina.",
  keywords: [
    "plomero",
    "electricista",
    "albañil",
    "gasista",
    "servicios para el hogar",
    "profesionales Argentina",
    "Repararlo",
  ],
  openGraph: {
    title: "Repararlo — Encontrá al profesional ideal para tu hogar",
    description:
      "Profesionales verificados para tu hogar: plomería, electricidad, albañilería y mucho más. Contactalos gratis.",
    type: "website",
    locale: "es_AR",
    siteName: "Repararlo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${archivo.variable} ${archivoBlack.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col antialiased"
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FeedbackWidget />
        <DeletedAccountToast />
      </body>
    </html>
  );
}
