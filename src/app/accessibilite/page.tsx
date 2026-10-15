import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibilité",
};

export default function AccessibilitePage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">À propos du prototype</p>
      <h1>Accessibilité</h1>
      <p className="introduction">
        La démonstration vise une expérience conforme aux principes WCAG 2.2 AA,
        sans revendiquer une certification officielle.
      </p>
      <h2>Mesures intégrées</h2>
      <ul>
        <li>Navigation au clavier et repères de focus visibles</li>
        <li>Structure de titres et libellés explicites</li>
        <li>Messages d’erreur annoncés et associés aux actions</li>
        <li>Information transmise par le texte et les icônes, pas seulement la couleur</li>
      </ul>
      <h2>Limites</h2>
      <p>
        Le prototype doit encore faire l’objet d’essais manuels avec des technologies
        d’assistance avant toute publication. Il ne représente aucun engagement
        d’accessibilité d’un organisme public.
      </p>
    </main>
  );
}