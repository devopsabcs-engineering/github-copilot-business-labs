import { describe, expect, it } from "vitest";

import { analyserMontantEnCents, formaterMontant } from "./montant";

describe("format monétaire fr-CA", () => {
  it.each(["1 234,56", "1\u00a0234,56", "1\u202f234,56", "1234.56"])(
    "analyse %s en cents entiers",
    (valeur) => {
      expect(analyserMontantEnCents(valeur)).toBe(123_456);
    },
  );

  it("présente le montant en dollars canadiens", () => {
    const resultat = formaterMontant(123_456).replace(/[\u00a0\u202f]/g, " ");
    expect(resultat).toBe("1 234,56 $");
  });
});