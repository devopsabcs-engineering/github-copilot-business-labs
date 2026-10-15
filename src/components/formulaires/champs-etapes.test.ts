import { describe, expect, it } from "vitest";

import { CHAMPS_PAR_ETAPE } from "./champs-etapes";

describe("champs par étape", () => {
  it("déclare exactement les cinq étapes sans champ en double", () => {
    expect(Object.keys(CHAMPS_PAR_ETAPE)).toEqual(["1", "2", "3", "4", "5"]);

    const champs = Object.values(CHAMPS_PAR_ETAPE).flat();
    expect(new Set(champs).size).toBe(champs.length);
  });

  it("réserve la déclaration à l'étape 4", () => {
    expect(CHAMPS_PAR_ETAPE[4]).toEqual(["declarationConfirmee"]);
  });
});