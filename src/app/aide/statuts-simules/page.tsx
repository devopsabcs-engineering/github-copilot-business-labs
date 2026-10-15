import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statuts simulés",
};

const STATUTS = [
  ["Brouillon", "La demande fictive est en préparation dans ce navigateur."],
  [
    "Transmise (simulation)",
    "L’action locale de simulation a été effectuée. Aucun organisme n’a reçu de demande.",
  ],
  [
    "En traitement (simulation)",
    "La chronologie de démonstration a avancé. Aucune analyse réelle n’a lieu.",
  ],
  [
    "Décision (simulation)",
    "Le scénario a atteint son dernier état. Il ne s’agit pas d’une décision administrative.",
  ],
] as const;

export default function StatutsSimulesPage() {
  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Aide par tâche</p>
      <h1>Comprendre les quatre statuts simulés</h1>
      <p className="introduction">
        Ces états illustrent une chronologie locale. Ils ne représentent ni
        réception, ni traitement, ni décision par un organisme public.
      </p>
      {STATUTS.map(([nom, description]) => (
        <section key={nom} aria-labelledby={`statut-${nom.split(" ")[0]}`}>
          <h2 id={`statut-${nom.split(" ")[0]}`}>{nom}</h2>
          <p>{description}</p>
        </section>
      ))}
    </main>
  );
}