import type { Metadata } from "next";
import Link from "next/link";

import { VerificateurAdmissibilite } from "@/components/admissibilite/verificateur-admissibilite";

export const metadata: Metadata = {
  title: "Vérifier l’admissibilité",
};

export default function AdmissibilitePage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Programme fictif</p>
      <h1>Vérifier l’admissibilité</h1>
      <p className="introduction">
        Vérifiez si votre scénario correspond aux critères du Programme Élan
        local avant de commencer le parcours.
      </p>
      <VerificateurAdmissibilite />
      <p>
        <Link href="/programme">Retour à la description du programme</Link>
      </p>
    </main>
  );
}