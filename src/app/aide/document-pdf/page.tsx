import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Document PDF local",
};

export default function DocumentPdfPage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Aide par tâche</p>
      <h1>Préparer un PDF fictif</h1>
      <p className="introduction">
        Le document sert uniquement à démontrer une sélection locale de fichier.
        Il n’est jamais téléversé vers un service gouvernemental.
      </p>
      <h2>Document accepté dans la démonstration</h2>
      <p>
        Choisissez un seul fichier PDF fictif d’au plus 5 Mo. N’utilisez aucun
        renseignement personnel, fiscal, financier ou confidentiel réel.
      </p>
      <h2>Traitement dans le navigateur</h2>
      <p>
        Le fichier demeure dans le stockage local du navigateur avec le brouillon.
        La simulation de transmission ne produit aucun envoi réseau et ne constitue
        pas une preuve de dépôt.
      </p>
      <p>
        <Link href="/aide/donnees-locales">
          Comprendre où les données sont conservées
        </Link>
      </p>
    </main>
  );
}