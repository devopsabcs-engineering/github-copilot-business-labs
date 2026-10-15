import { describe, expect, it } from "vitest";

import { genererNumeroDemonstration } from "./numero-demonstration";

describe("numéro de démonstration", () => {
  it("produit un numéro déterministe au format attendu", () => {
    const id = "00000000-0000-4000-8000-000000000001";

    expect(genererNumeroDemonstration(id)).toBe("DEMO-2026-CF703DA2");
    expect(genererNumeroDemonstration(id)).toBe(
      genererNumeroDemonstration(id),
    );
  });

  it("ne dépend d’aucune donnée métier", () => {
    const premier = genererNumeroDemonstration(
      "00000000-0000-4000-8000-000000000001",
    );
    const second = genererNumeroDemonstration(
      "00000000-0000-4000-8000-000000000002",
    );

    expect(premier).toMatch(/^DEMO-2026-[A-F0-9]{8}$/);
    expect(second).toMatch(/^DEMO-2026-[A-F0-9]{8}$/);
    expect(second).not.toBe(premier);
  });
});