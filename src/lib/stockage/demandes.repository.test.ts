import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Demande } from "@/lib/domaine/demande.types";

import { PortailAideFinanciereDb } from "./db";
import {
  DemandesRepository,
  ErreurStockageLocal,
  normaliserErreurStockage,
} from "./demandes.repository";

const ID_DEMANDE = "00000000-0000-4000-8000-000000000001";

function creerDemande(dateModification = "2026-07-31T12:00:00.000Z"): Demande {
  return {
    schemaVersion: 1,
    id: ID_DEMANDE,
    programmeCode: "PAF-DEMO-2026",
    statut: "BROUILLON",
    etapeCourante: 1,
    evenements: [],
    dateCreation: "2026-07-31T12:00:00.000Z",
    dateModification,
  };
}

function creerDemandeComplete(): Demande {
  return {
    ...creerDemande(),
    etapeCourante: 5,
    organisation: {
      identifiantDemonstration: "ORG-DEMO-001",
      raisonSociale: "Collectif Démo",
      courrielDemonstration: "demo@example.test",
    },
    projet: {
      titre: "Projet fictif",
      description:
        "Ce projet fictif contient une description assez longue pour la validation complète.",
      montantDemandeCents: 1_250_000,
    },
    document: {
      nomFichier: "preuve-fictive.pdf",
      typeMime: "application/pdf",
      tailleOctets: 100,
      derniereModification: 0,
    },
    declarationConfirmee: true,
    dateModification: "2026-07-31T12:01:00.000Z",
  };
}

describe("DemandesRepository", () => {
  let database: PortailAideFinanciereDb;
  let repository: DemandesRepository;

  beforeEach(() => {
    database = new PortailAideFinanciereDb(`test-demandes-${crypto.randomUUID()}`);
    repository = new DemandesRepository(database);
  });

  afterEach(async () => {
    await database.delete();
  });

  it("refuse une écriture fondée sur une version devenue ancienne", async () => {
    const originale = creerDemande();
    await repository.creer(originale);

    const versionAutreOnglet = {
      ...originale,
      projet: { titre: "Version récente" },
      dateModification: "2026-07-31T12:01:00.000Z",
    } satisfies Demande;
    await repository.mettreAJour(
      versionAutreOnglet,
      originale.dateModification,
    );

    const versionLocale = {
      ...originale,
      projet: { titre: "Version locale" },
      dateModification: "2026-07-31T12:02:00.000Z",
    } satisfies Demande;

    await expect(
      repository.mettreAJour(versionLocale, originale.dateModification),
    ).rejects.toMatchObject({
      code: "CONFLIT_MODIFICATION",
    } satisfies Partial<ErreurStockageLocal>);
    await expect(repository.lire(ID_DEMANDE)).resolves.toEqual(versionAutreOnglet);
  });

  it("signale explicitement un identifiant inconnu", async () => {
    await expect(repository.lire(ID_DEMANDE)).rejects.toMatchObject({
      code: "DEMANDE_INTROUVABLE",
      message: "Cette demande est introuvable sur cet appareil.",
    });
  });

  it("traduit une erreur de quota enveloppée par Dexie", () => {
    const erreur = normaliserErreurStockage({
      inner: new DOMException("Quota atteint", "QuotaExceededError"),
    });

    expect(erreur).toMatchObject({
      code: "QUOTA_DEPASSE",
      message:
        "L’espace de stockage local est insuffisant. Vos changements en mémoire sont conservés.",
    });
  });

  it("refuse une simulation incomplète sans modifier le brouillon", async () => {
    const brouillon = creerDemande();
    await repository.creer(brouillon);

    await expect(
      repository.simulerTransmission(brouillon, brouillon.dateModification),
    ).rejects.toMatchObject({ code: "DEMANDE_INCOMPLETE" });
    await expect(repository.lire(ID_DEMANDE)).resolves.toEqual(brouillon);
  });

  it("écrit le numéro, le statut et l’événement dans une seule simulation", async () => {
    const brouillon = creerDemande();
    const demandeComplete = creerDemandeComplete();
    await repository.creer(brouillon);

    const transmise = await repository.simulerTransmission(
      demandeComplete,
      brouillon.dateModification,
    );

    expect(transmise).toMatchObject({
      statut: "TRANSMISE_SIMULEE",
      numeroDemonstration: "DEMO-2026-CF703DA2",
      dateModification: "2026-07-31T12:01:00.000Z",
    });
    expect(transmise.evenements).toEqual([
      {
        statutPrecedent: "BROUILLON",
        statutNouveau: "TRANSMISE_SIMULEE",
        dateHeure: "2026-07-31T12:01:00.000Z",
      },
    ]);
    await expect(repository.lire(ID_DEMANDE)).resolves.toEqual(transmise);

    await expect(
      repository.simulerTransmission(transmise, transmise.dateModification),
    ).rejects.toMatchObject({ code: "TRANSITION_INTERDITE" });
    await expect(repository.lire(ID_DEMANDE)).resolves.toEqual(transmise);
  });

  it("avance uniquement vers le prochain statut et ajoute un événement", async () => {
    const brouillon = creerDemande();
    await repository.creer(brouillon);
    const transmise = await repository.simulerTransmission(
      creerDemandeComplete(),
      brouillon.dateModification,
    );

    const enTraitement = await repository.avancerStatutSimule(
      ID_DEMANDE,
      "EN_TRAITEMENT_SIMULE",
      "2026-07-31T12:02:00.000Z",
    );

    expect(enTraitement.statut).toBe("EN_TRAITEMENT_SIMULE");
    expect(enTraitement.evenements).toHaveLength(2);
    expect(enTraitement.evenements[1]).toEqual({
      statutPrecedent: "TRANSMISE_SIMULEE",
      statutNouveau: "EN_TRAITEMENT_SIMULE",
      dateHeure: "2026-07-31T12:02:00.000Z",
    });

    await expect(
      repository.avancerStatutSimule(ID_DEMANDE, "DECISION_SIMULEE"),
    ).resolves.toMatchObject({ statut: "DECISION_SIMULEE" });
    await expect(
      repository.avancerStatutSimule(ID_DEMANDE, "TRANSMISE_SIMULEE"),
    ).rejects.toMatchObject({ code: "TRANSITION_INTERDITE" });
    expect(transmise.numeroDemonstration).toBe(enTraitement.numeroDemonstration);
  });

  it("interdit de contourner la validation pour transmettre un brouillon", async () => {
    const brouillon = creerDemande();
    await repository.creer(brouillon);

    await expect(
      repository.avancerStatutSimule(ID_DEMANDE, "TRANSMISE_SIMULEE"),
    ).rejects.toMatchObject({ code: "TRANSITION_INTERDITE" });
    await expect(repository.lire(ID_DEMANDE)).resolves.toEqual(brouillon);
  });
});