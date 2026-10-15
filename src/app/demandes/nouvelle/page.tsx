import type { Metadata } from "next";
import { Suspense } from "react";

import { CreerDemande } from "@/components/demandes/creer-demande";

export const metadata: Metadata = {
  title: "Créer une demande fictive",
};

export default function NouvelleDemandePage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Programme fictif</p>
      <h1>Créer une demande fictive</h1>
      <p className="introduction">
        Un brouillon local sera créé avant l’ouverture de la première étape.
      </p>
      <Suspense fallback={<p role="status">Préparation du brouillon…</p>}>
        <CreerDemande />
      </Suspense>
    </main>
  );
}