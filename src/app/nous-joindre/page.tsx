import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nous joindre",
};

export default function NousJoindrePage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Organisme fictif</p>
      <h1>Nous joindre</h1>
      <p className="introduction">
        Le Bureau de l’essor collectif n’existe pas et n’offre aucun service au public.
      </p>
      <h2>Aucune coordonnée de service</h2>
      <p>
        Ce prototype ne fournit ni numéro de téléphone, ni adresse, ni courriel.
        Il ne peut recevoir une demande, répondre à une question sur un programme
        réel ou intervenir dans un dossier gouvernemental.
      </p>
      <p>
        Pour comprendre le fonctionnement de la démonstration, consultez les {" "}
        <Link href="/aide/donnees-locales">explications sur les données locales</Link>.
      </p>
    </main>
  );
}