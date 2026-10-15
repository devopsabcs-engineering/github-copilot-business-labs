"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Problème dans la démonstration</p>
      <h1>La page ne peut pas être affichée</h1>
      <p>
        Une erreur locale a interrompu cette page. Aucune donnée n’a été transmise
        à un organisme public.
      </p>
      <div className="actions">
        <Button onClick={reset}>Réessayer</Button>
        <Link className="lien-secondaire" href="/">
          Retourner à l’accueil
        </Link>
      </div>
    </main>
  );
}