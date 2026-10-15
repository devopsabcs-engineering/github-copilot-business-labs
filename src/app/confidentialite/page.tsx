import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">À propos du prototype</p>
      <h1>Confidentialité</h1>
      <p className="introduction">
        Saisissez uniquement des données inventées. Le prototype n’est pas conçu
        pour recevoir des renseignements personnels ou confidentiels.
      </p>
      <h2>Données conservées</h2>
      <p>
        Les brouillons et le PDF fictif sont conservés localement dans le navigateur.
        Ils ne sont pas transmis à un serveur ou à un organisme public.
      </p>
      <h2>Contrôle de l’utilisateur</h2>
      <p>
        Une commande du tableau de bord permettra d’effacer les données de
        démonstration. Les mécanismes propres au navigateur peuvent également
        supprimer ce stockage sans préavis.
      </p>
      <p>
        <Link href="/aide/donnees-locales">
          Lire les détails sur la portée du stockage local
        </Link>
      </p>
    </main>
  );
}