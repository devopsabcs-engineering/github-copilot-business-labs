import { describe, expect, it } from "vitest";

import {
  demandeBrouillonSchema,
  demandeTransmissionSchema,
} from "./demande.schemas";

const base = {
  schemaVersion: 1,
  id: "8ce4d13c-c6ab-4a72-b720-7ebf534671e5",
  programmeCode: "PAF-DEMO-2026",
  statut: "BROUILLON",
  etapeCourante: 1,
  evenements: [],
  dateCreation: "2026-07-31T12:00:00.000Z",
  dateModification: "2026-07-31T12:00:00.000Z",
} as const;

describe("schémas de demande", () => {
  it("accepte un brouillon incomplet", () => {
    expect(demandeBrouillonSchema.safeParse(base).success).toBe(true);
  });

  it("refuse une transmission incomplète", () => {
    expect(demandeTransmissionSchema.safeParse(base).success).toBe(false);
  });
});