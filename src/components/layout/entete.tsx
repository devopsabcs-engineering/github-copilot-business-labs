import Link from "next/link";

import { NavigationPrincipale } from "./navigation-principale";

export function Entete() {
  return (
    <header className="entete">
      <div className="conteneur entete-interieur">
        <Link className="marque" href="/">
          {"Bureau de l'essor collectif"}
        </Link>
        <NavigationPrincipale />
      </div>
    </header>
  );
}