import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Fonction locale indisponible",
};

export default function ServiceIndisponiblePage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">État de repli</p>
      <h1>La fonction locale est indisponible</h1>
      <Alert>
        <AlertTitle>Votre action n’a pas été effectuée</AlertTitle>
        <AlertDescription>
          <p>
            Le navigateur ne permet pas d’utiliser cette fonction de démonstration
            pour le moment. Aucune donnée n’a été transmise.
          </p>
        </AlertDescription>
      </Alert>
      <p>
        Vous pouvez revenir à l’<Link href="/">accueil du prototype</Link> ou
        réessayer dans un navigateur qui autorise le stockage local.
      </p>
    </main>
  );
}