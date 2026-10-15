import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Demande } from "@/lib/domaine/demande.types";

import { PortailAideFinanciereDb } from "./db";
import { DemandesRepository } from "./demandes.repository";
import { DocumentsRepository } from "./documents.repository";

const ID_DEMANDE = "00000000-0000-4000-8000-000000000002";

function creerDemande(): Demande {
  return {
    schemaVersion: 1,
    id: ID_DEMANDE,
    programmeCode: "PAF-DEMO-2026",
    statut: "BROUILLON",
    etapeCourante: 1,
    evenements: [],
    dateCreation: "2026-07-31T12:00:00.000Z",
    dateModification: "2026-07-31T12:00:00.000Z",
  };
}

describe("DocumentsRepository", () => {
  let database: PortailAideFinanciereDb;
  let demandes: DemandesRepository;
  let documents: DocumentsRepository;

  beforeEach(() => {
    database = new PortailAideFinanciereDb(`test-documents-${crypto.randomUUID()}`);
    demandes = new DemandesRepository(database);
    documents = new DocumentsRepository(database);
  });

  afterEach(async () => {
    await database.delete();
  });

  it("enregistre les métadonnées et le Blob dans la même opération", async () => {
    const demande = creerDemande();
    await demandes.creer(demande);
    const blob = new Blob(["PDF fictif"], { type: "application/pdf" });
    const avecDocument = {
      ...demande,
      document: {
        nomFichier: "preuve.pdf",
        typeMime: "application/pdf",
        tailleOctets: blob.size,
        derniereModification: 123,
      },
      dateModification: "2026-07-31T12:01:00.000Z",
    } satisfies Demande;

    await documents.enregistrer(avecDocument, blob, demande.dateModification);

    await expect(demandes.lire(ID_DEMANDE)).resolves.toEqual(avecDocument);
    await expect(documents.lire(ID_DEMANDE)).resolves.toMatchObject({
      demandeId: ID_DEMANDE,
      blob,
    });
  });

  it("ne remplace pas le Blob lorsqu'une version plus récente existe", async () => {
    const demande = creerDemande();
    await demandes.creer(demande);
    const blobRecent = { marque: "récent" } as unknown as Blob;
    const versionRecente = {
      ...demande,
      document: {
        nomFichier: "recent.pdf",
        typeMime: "application/pdf",
        tailleOctets: 6,
        derniereModification: 123,
      },
      dateModification: "2026-07-31T12:01:00.000Z",
    } satisfies Demande;
    await documents.enregistrer(versionRecente, blobRecent, demande.dateModification);

    const blobLocal = { marque: "local" } as unknown as Blob;
    const versionLocale = {
      ...versionRecente,
      document: {
        nomFichier: "local.pdf",
        typeMime: "application/pdf",
        tailleOctets: 5,
        derniereModification: 456,
      },
      dateModification: "2026-07-31T12:02:00.000Z",
    } satisfies Demande;

    await expect(
      documents.enregistrer(versionLocale, blobLocal, demande.dateModification),
    ).rejects.toMatchObject({ code: "CONFLIT_MODIFICATION" });
    await expect(demandes.lire(ID_DEMANDE)).resolves.toEqual(versionRecente);
    const documentPersistant = await documents.lire(ID_DEMANDE);
    expect(documentPersistant?.blob).toEqual({ marque: "récent" });
  });

  it("supprime une demande et son document dans une transaction", async () => {
    const demande = creerDemande();
    await demandes.creer(demande);
    await database.documents.add({
      demandeId: ID_DEMANDE,
      blob: new Blob(["PDF"], { type: "application/pdf" }),
    });

    await demandes.supprimer(ID_DEMANDE);

    await expect(demandes.lire(ID_DEMANDE)).rejects.toMatchObject({
      code: "DEMANDE_INTROUVABLE",
    });
    await expect(documents.lire(ID_DEMANDE)).resolves.toBeNull();
  });

  it("efface la base complète", async () => {
    await demandes.creer(creerDemande());
    await database.documents.add({
      demandeId: ID_DEMANDE,
      blob: new Blob(["PDF"], { type: "application/pdf" }),
    });

    await demandes.effacerTout();

    await expect(database.demandes.count()).resolves.toBe(0);
    await expect(database.documents.count()).resolves.toBe(0);
  });
});