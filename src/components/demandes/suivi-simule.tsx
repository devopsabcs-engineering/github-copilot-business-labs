"use client";

import {
  CircleAlert,
  CircleCheck,
  FilePenLine,
  Hourglass,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { useAssistant } from "./assistant-provider";

import { Button, ButtonLink } from "@/components/ui/button";
import type { StatutSimule } from "@/lib/domaine/demande.types";
import { formaterDateHeure } from "@/lib/format/date";

const PRESENTATION_STATUTS: ReadonlyArray<{
  statut: StatutSimule;
  libelle: string;
  description: string;
  icone: LucideIcon;
  classe: string;
}> = [
  {
    statut: "BROUILLON",
    libelle: "Brouillon local",
    description: "Données fictives conservées sur cet appareil.",
    icone: FilePenLine,
    classe: "statut-brouillon",
  },
  {
    statut: "TRANSMISE_SIMULEE",
    libelle: "Transmission simulée",
    description: "Aucune transmission réelle n’a eu lieu.",
    icone: Send,
    classe: "statut-transmis",
  },
  {
    statut: "EN_TRAITEMENT_SIMULE",
    libelle: "Traitement simulé",
    description: "Aucune analyse administrative n’est effectuée.",
    icone: Hourglass,
    classe: "statut-traitement",
  },
  {
    statut: "DECISION_SIMULEE",
    libelle: "Décision simulée",
    description: "Aucune décision officielle ou financière n’est rendue.",
    icone: CircleCheck,
    classe: "statut-decision",
  },
];

function prochaineCommande(statut: StatutSimule): {
  cible: StatutSimule;
  libelle: string;
} | null {
  if (statut === "TRANSMISE_SIMULEE") {
    return {
      cible: "EN_TRAITEMENT_SIMULE",
      libelle: "Avancer vers le traitement simulé",
    };
  }
  if (statut === "EN_TRAITEMENT_SIMULE") {
    return {
      cible: "DECISION_SIMULEE",
      libelle: "Avancer vers la décision simulée",
    };
  }
  return null;
}

export function SuiviSimule() {
  const { avancerSimulation, demande } = useAssistant();
  const [miseAJourEnCours, setMiseAJourEnCours] = useState(false);
  const indexCourant = PRESENTATION_STATUTS.findIndex(
    ({ statut }) => statut === demande.statut,
  );
  const commande = prochaineCommande(demande.statut);

  async function avancer() {
    if (!commande) {
      return;
    }
    setMiseAJourEnCours(true);
    await avancerSimulation(commande.cible);
    setMiseAJourEnCours(false);
  }

  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Démonstration locale</p>
      <h1>Suivi simulé</h1>
      <div className="alerte suivi-avertissement" role="note">
        <CircleAlert aria-hidden="true" size={28} />
        <p>
          Tous les statuts sont simulés et conservés uniquement sur cet appareil.
          Ils ne reflètent aucun traitement, délai ou résultat réel.
        </p>
      </div>
      {demande.numeroDemonstration ? (
        <p>
          Numéro de démonstration : <strong>{demande.numeroDemonstration}</strong>
        </p>
      ) : null}
      <ol className="chronologie-statuts" aria-label="Chronologie locale simulée">
        {PRESENTATION_STATUTS.map((presentation, index) => {
          const Icone = presentation.icone;
          const evenement = demande.evenements.find(
            ({ statutNouveau }) => statutNouveau === presentation.statut,
          );
          const dateHeure =
            presentation.statut === "BROUILLON"
              ? demande.dateCreation
              : evenement?.dateHeure;
          const atteint = index <= indexCourant;
          const courant = index === indexCourant;

          return (
            <li
              key={presentation.statut}
              className={`${presentation.classe} ${atteint ? "statut-atteint" : "statut-a-venir"}`}
              aria-current={courant ? "step" : undefined}
            >
              <span className="icone-statut">
                <Icone aria-hidden="true" size={24} />
              </span>
              <div>
                <h2>{presentation.libelle}</h2>
                <p>{presentation.description}</p>
                <p className="date-statut">
                  {dateHeure ? formaterDateHeure(dateHeure) : "Étape non atteinte"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p>
        La chronologie avance uniquement lorsque vous utilisez une commande de
        démonstration. Aucun minuteur n’est utilisé.
      </p>
      <div className="actions">
        {commande ? (
          <Button disabled={miseAJourEnCours} onClick={avancer}>
            {commande.libelle}
          </Button>
        ) : null}
        {demande.statut === "BROUILLON" ? (
          <ButtonLink href={`/demandes/dossier/etape/5?id=${demande.id}`}>
            Retourner à la vérification
          </ButtonLink>
        ) : null}
        <ButtonLink className="bouton-secondaire" href="/demandes">
          Retourner aux demandes locales
        </ButtonLink>
      </div>
    </main>
  );
}