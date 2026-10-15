import { describe, expect, it } from "vitest";

import { evaluerAdmissibilite } from "./admissibilite";

describe("admissibilité fictive", () => {
  it("retourne un résultat positif sans créer de demande", () => {
    expect(
      evaluerAdmissibilite({
        entrepriseOuOrganisme: true,
        projetAuQuebec: true,
        donneesFictivesConfirmees: true,
      }),
    ).toEqual({ admissible: true, motifs: [] });
  });

  it("explique chaque critère non respecté", () => {
    const resultat = evaluerAdmissibilite({
      entrepriseOuOrganisme: false,
      projetAuQuebec: false,
      donneesFictivesConfirmees: false,
    });

    expect(resultat.admissible).toBe(false);
    expect(resultat.motifs).toHaveLength(3);
  });
});