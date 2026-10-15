import { describe, expect, it } from "vitest";

import { creerIdentifiantLocal, creerNumeroDemonstration } from "./identifiants";

describe("identifiants de démonstration", () => {
  it("crée un UUID local", () => {
    expect(creerIdentifiantLocal()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("dérive un numéro de démonstration sans donnée métier", () => {
    expect(
      creerNumeroDemonstration("8ce4d13c-c6ab-4a72-b720-7ebf534671e5"),
    ).toBe("DEMO-2026-8CE4D13C");
  });
});