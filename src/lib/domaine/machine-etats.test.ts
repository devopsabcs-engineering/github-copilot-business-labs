import { describe, expect, it } from "vitest";

import { STATUTS_SIMULES } from "./demande.types";
import { avancerStatut, transitionEstPermise } from "./machine-etats";

describe("machine d'états simulée", () => {
  it("autorise uniquement les trois transitions successives", () => {
    expect(transitionEstPermise("BROUILLON", "TRANSMISE_SIMULEE")).toBe(true);
    expect(
      transitionEstPermise("TRANSMISE_SIMULEE", "EN_TRAITEMENT_SIMULE"),
    ).toBe(true);
    expect(
      transitionEstPermise("EN_TRAITEMENT_SIMULE", "DECISION_SIMULEE"),
    ).toBe(true);
    expect(transitionEstPermise("BROUILLON", "DECISION_SIMULEE")).toBe(false);
    expect(
      transitionEstPermise("EN_TRAITEMENT_SIMULE", "TRANSMISE_SIMULEE"),
    ).toBe(false);
    expect(
      transitionEstPermise("TRANSMISE_SIMULEE", "TRANSMISE_SIMULEE"),
    ).toBe(false);
  });

  it("refuse d'avancer après la décision simulée", () => {
    expect(() => avancerStatut("DECISION_SIMULEE")).toThrow(
      "Le statut simulé ne peut plus avancer.",
    );
  });

  it("ne définit aucun statut administratif hors démonstration", () => {
    expect(STATUTS_SIMULES).toEqual([
      "BROUILLON",
      "TRANSMISE_SIMULEE",
      "EN_TRAITEMENT_SIMULE",
      "DECISION_SIMULEE",
    ]);
  });
});