import type { Metadata } from "next";

import { SommaireDemande } from "@/components/demandes/sommaire-demande";

export const metadata: Metadata = {
  title: "Sommaire de la demande",
};

export default function DossierPage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Brouillon local</p>
      <h1>Sommaire de la demande</h1>
      <SommaireDemande />
    </main>
  );
}