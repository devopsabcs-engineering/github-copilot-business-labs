import type { Metadata } from "next";
import { Suspense } from "react";

import { EffacerDonnees } from "@/components/demandes/effacer-donnees";
import { ListeDemandes } from "@/components/demandes/liste-demandes";

export const metadata: Metadata = {
  title: "Mes demandes fictives",
};

export default function DemandesPage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Données locales</p>
      <h1>Mes demandes fictives</h1>
      <p className="introduction">
        Les brouillons affichés ici demeurent uniquement dans ce navigateur, sur
        cet appareil.
      </p>
      <Suspense fallback={<p role="status">Chargement des demandes locales…</p>}>
        <ListeDemandes />
        <EffacerDonnees />
      </Suspense>
    </main>
  );
}