import type { Metadata } from "next";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";
import "@fontsource/bodoni-moda/400.css";
import "@fontsource/bodoni-moda/600.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "D' Series y Pelis", template: "%s · D' Series y Pelis" },
  description: "Estrenos, episodios, finales y las series que vale la pena seguir.",
};

// El catálogo proviene de Notion: se resuelve bajo demanda y se comparte mediante caché.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body><SiteHeader /><main>{children}</main><SiteFooter /></body>
    </html>
  );
}
