import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Données conservées localement",
};

export default function DonneesLocalesPage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Aide par tâche</p>
      <h1>Comprendre les données locales</h1>
      <p className="introduction">
        Le prototype conserve les brouillons fictifs dans le stockage local de
        votre navigateur. Il ne les envoie à aucun organisme.
      </p>
      <h2>Sur cet appareil et ce navigateur</h2>
      <p>
        Les données sont liées au navigateur et à l’adresse utilisée pour ouvrir
        le prototype. Elles ne suivent pas automatiquement un changement
        d’appareil, de navigateur ou d’adresse de publication.
      </p>
      <h2>Conservation non garantie</h2>
      <p>
        Le navigateur peut supprimer les données selon ses réglages, l’espace
        disponible ou le mode de navigation. Ce prototype ne remplace pas une
        sauvegarde et ne fournit aucun service de récupération.
      </p>
      <h2>Effacer la démonstration</h2>
      <p>
        La commande d’effacement du tableau de bord supprimera les brouillons et
        documents fictifs conservés par ce prototype dans ce navigateur.
      </p>
      <p>
        <Link href="/confidentialite">Lire l’avis de confidentialité</Link>
      </p>
    </main>
  );
}