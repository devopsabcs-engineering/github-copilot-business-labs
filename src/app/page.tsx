import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { PROGRAMME_FICTIF } from "@/data/programme-fictif";

export default function Home() {
  return (
    <main id="contenu-principal" tabIndex={-1}>
      <section className="bande-accueil">
        <div className="conteneur accueil-grille">
          <div>
            <p className="surtitre">Aide financière fictive</p>
            <h1>{PROGRAMME_FICTIF.nom}</h1>
            <p className="introduction">
              Vérifiez un scénario fictif, préparez une demande de démonstration
              et consultez son état simulé. Tout demeure dans ce navigateur.
            </p>
            <div className="actions">
              <ButtonLink href="/programme/admissibilite">
                Vérifier l’admissibilité
              </ButtonLink>
              <ButtonLink href="/demandes">Voir mes demandes</ButtonLink>
            </div>
          </div>
          <div className="repere-programme" aria-label="Résumé du programme">
            <span>Administré fictivement par</span>
            <strong>{PROGRAMME_FICTIF.organismeAdministrateurFictif}</strong>
            <span>Montant maximal de démonstration</span>
            <strong>50 000 $</strong>
          </div>
        </div>
      </section>
      <section className="conteneur section-contenu" aria-labelledby="local-title">
        <Alert>
          <AlertTitle id="local-title">Vos données restent sur cet appareil</AlertTitle>
          <AlertDescription>
            <p>
              Aucun compte n’est requis. Le brouillon et le PDF fictif sont
              conservés localement dans ce navigateur, selon l’espace disponible.
            </p>
            <p>
              La transmission et les quatre statuts sont des simulations. Aucun
              dossier officiel n’est créé, reçu, analysé ou décidé.
            </p>
          </AlertDescription>
        </Alert>
        <h2 className="mt-8">Aide pour cette démonstration</h2>
        <ul>
          <li>
            <Link href="/aide/donnees-locales">Comprendre les données locales</Link>
          </li>
          <li>
            <Link href="/aide/document-pdf">Préparer un PDF fictif</Link>
          </li>
          <li>
            <Link href="/aide/statuts-simules">
              Comprendre les quatre statuts simulés
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
