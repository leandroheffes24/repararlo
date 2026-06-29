import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://repararlo.com.ar"),
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
      className={`${inter.variable} ${display.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col bg-white text-slate-900 antialiased"
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
