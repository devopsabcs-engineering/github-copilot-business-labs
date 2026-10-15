import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laboratoire GitHub Copilot Business",
  description:
    "Choisir la langue du laboratoire bilingue des fondamentaux de GitHub Copilot Business.",
};

export default function LabPage() {
  return (
    <main id="contenu-principal" className="conteneur lab-chooser" tabIndex={-1}>
      <p className="surtitre">Laboratoire bilingue</p>
      <h1>GitHub Copilot Business</h1>
      <p className="introduction">
        Choisissez une langue pour commencer le laboratoire pratique dans ce
        prototype local. Select a language to begin the hands-on lab in this
        local prototype.
      </p>
      <nav aria-label="Choix de la langue du laboratoire">
        <ul>
          <li>
            <Link className="bouton" href="/lab/fr" hrefLang="fr-CA">
              Français (Canada)
            </Link>
          </li>
          <li>
            <Link
              className="bouton bouton-secondaire"
              href="/lab/en"
              hrefLang="en-CA"
            >
              English (Canada)
            </Link>
          </li>
        </ul>
      </nav>
      <p className="lab-chooser-note">
        L’application d’exercice demeure en français canadien. The exercise
        application remains in Canadian French.
      </p>
    </main>
  );
}