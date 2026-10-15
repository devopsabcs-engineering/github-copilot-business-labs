import type { Metadata } from "next";
import localFont from "next/font/local";

import { AvisPrototype } from "@/components/layout/avis-prototype";
import { Entete } from "@/components/layout/entete";
import { PiedPage } from "@/components/layout/pied-page";
import { MESSAGE_SANS_JAVASCRIPT } from "@/content/fr-CA";

import "./globals.css";

const roboto = localFont({
  src: [
    { path: "../../public/fonts/roboto-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/roboto-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-roboto",
  display: "swap",
});
const openSans = localFont({
  src: [
    { path: "../../public/fonts/open-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/open-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devopsabcs-engineering.github.io"),
  title: {
    default: "Programme Élan local",
    template: "%s | Programme Élan local",
  },
  description:
    "Prototype non officiel d'un portail d'aide financière pour entreprises et organismes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-CA">
      <body className={`${roboto.variable} ${openSans.variable}`}>
        <a className="lien-evitement" href="#contenu-principal">
          Passer au contenu principal
        </a>
        <AvisPrototype />
        <Entete />
        {children}
        <PiedPage />
        <noscript>
          <div className="avis-noscript">{MESSAGE_SANS_JAVASCRIPT}</div>
        </noscript>
      </body>
    </html>
  );
}
