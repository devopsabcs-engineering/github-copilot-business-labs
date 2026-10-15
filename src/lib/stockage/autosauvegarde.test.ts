import { describe, expect, it, vi } from "vitest";

import {
  AntiRebondAutosauvegarde,
  hydraterSansEcraser,
  resoudreConflit,
} from "./autosauvegarde";

import type { Demande } from "@/lib/domaine/demande.types";

const demandeBase: Demande = {
  schemaVersion: 1,
  id: "00000000-0000-4000-8000-000000000004",
  programmeCode: "PAF-DEMO-2026",
  statut: "BROUILLON",
  etapeCourante: 1,
  evenements: [],
  dateCreation: "2026-07-31T12:00:00.000Z",
  dateModification: "2026-07-31T12:00:00.000Z",
};

describe("autosauvegarde locale", () => {
  it("n'écrase pas un état déjà modifié pendant l'hydratation", () => {
    expect(hydraterSansEcraser("persisté", true)).toEqual({
      statut: "MODIFICATIONS_LOCALES_PRESERVEES",
    });
    expect(hydraterSansEcraser("persisté", false)).toEqual({
      statut: "HYDRATE",
      valeur: "persisté",
    });
  });

  it("conserve la valeur en mémoire lorsqu'une écriture échoue", async () => {
    const enregistrer = vi.fn().mockRejectedValue(new Error("IndexedDB indisponible"));
    const autosauvegarde = new AntiRebondAutosauvegarde(enregistrer);
    autosauvegarde.planifier("état courant");

    await expect(autosauvegarde.enregistrerMaintenant()).rejects.toThrow(
      "IndexedDB indisponible",
    );

    expect(autosauvegarde.aUneValeurEnAttente()).toBe(true);
    autosauvegarde.annuler();
  });

  it("ne force l'écriture qu'après le choix de conserver les changements", () => {
    const versionLocale = { ...demandeBase, projet: { titre: "Local" } };
    const versionRecente = {
      ...demandeBase,
      projet: { titre: "Récent" },
      dateModification: "2026-07-31T12:01:00.000Z",
    };

    expect(
      resoudreConflit(
        "RECHARGER_VERSION_RECENTE",
        versionLocale,
        versionRecente,
      ),
    ).toEqual({ demande: versionRecente, forcer: false });
    expect(
      resoudreConflit(
        "CONSERVER_MES_CHANGEMENTS",
        versionLocale,
        versionRecente,
      ),
    ).toEqual({ demande: versionLocale, forcer: true });
  });
});