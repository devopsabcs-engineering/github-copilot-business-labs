import { describe, expect, it } from "vitest";

import {
  AVERTISSEMENT_PROTOTYPE,
  CONFIRMATION_DEMONSTRATION,
  ETAPES_DEMANDE,
} from "./fr-CA";

describe("contenu fr-CA", () => {
  it("conserve l'avertissement obligatoire exact", () => {
    expect(AVERTISSEMENT_PROTOTYPE).toBe(
      "Prototype non officiel. Aucune donnée réelle. Aucune transmission à un organisme public.",
    );
  });

  it("conserve la confirmation sans effet juridique", () => {
    expect(CONFIRMATION_DEMONSTRATION).toContain(
      "ne constitue ni une déclaration ni un consentement officiel",
    );
  });

  it("déclare exactement cinq étapes", () => {
    expect(ETAPES_DEMANDE).toHaveLength(5);
  });
});