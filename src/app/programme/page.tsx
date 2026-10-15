import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { PROGRAMME_FICTIF } from "@/data/programme-fictif";
import { formaterMontant } from "@/lib/format/montant";

export const metadata: Metadata = {
  title: "Le programme",
};

export default function ProgrammePage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Programme fictif</p>
      <h1>{PROGRAMME_FICTIF.nom}</h1>
      <p className="introduction">
        Une démonstration destinée aux entreprises et organismes qui souhaitent
        explorer un parcours local de demande d’aide financière.
      </p>
      <h2>Ce que présente le prototype</h2>
      <p>
        Le scénario propose une aide fictive pouvant atteindre {" "}
        {formaterMontant(PROGRAMME_FICTIF.montantMaximalCents)}. Ce montant ne
        constitue ni une offre, ni une promesse de financement.
      </p>
      <h2>Critères de démonstration</h2>
      <ul>
        {PROGRAMME_FICTIF.criteresAdmissibilite.map((critere) => (
          <li key={critere}>{critere}</li>
        ))}
      </ul>
      <h2>Avant de commencer</h2>
      <p>
        Utilisez uniquement des informations inventées. Le vérificateur donne
        un résultat fictif avant le début du parcours et ne crée aucun dossier
        lorsque les critères ne sont pas respectés.
      </p>
      <div className="actions">
        <ButtonLink href="/programme/admissibilite">
          Vérifier l’admissibilité
        </ButtonLink>
        <Link className="lien-secondaire" href="/aide/donnees-locales">
          Comprendre les données locales
        </Link>
      </div>
    </main>
  );
}