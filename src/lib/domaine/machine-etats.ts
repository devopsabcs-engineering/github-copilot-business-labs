import type { StatutSimule } from "./demande.types";

const TRANSITIONS: Readonly<Partial<Record<StatutSimule, StatutSimule>>> = {
  BROUILLON: "TRANSMISE_SIMULEE",
  TRANSMISE_SIMULEE: "EN_TRAITEMENT_SIMULE",
  EN_TRAITEMENT_SIMULE: "DECISION_SIMULEE",
};

export function statutSuivant(statut: StatutSimule): StatutSimule | null {
  return TRANSITIONS[statut] ?? null;
}

export function transitionEstPermise(
  statutActuel: StatutSimule,
  statutVise: StatutSimule,
): boolean {
  return statutSuivant(statutActuel) === statutVise;
}

export function avancerStatut(statut: StatutSimule): StatutSimule {
  const suivant = statutSuivant(statut);

  if (!suivant) {
    throw new Error("Le statut simulé ne peut plus avancer.");
  }

  return suivant;
}