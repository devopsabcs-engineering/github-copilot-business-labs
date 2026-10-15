import Link from "next/link";

export default function NotFound() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Page introuvable</p>
      <h1>Cette page n’existe pas</h1>
      <p>
        L’adresse demandée ne correspond à aucune page de la démonstration.
        Aucune donnée locale n’a été modifiée.
      </p>
      <p>
        <Link href="/">Retourner à l’accueil</Link>
      </p>
    </main>
  );
}