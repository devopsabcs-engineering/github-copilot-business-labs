import Dexie, { type EntityTable } from "dexie";

import type { Demande } from "@/lib/domaine/demande.types";

export const NOM_BASE_DONNEES = "portail-aide-financiere";

export type DocumentLocal = {
  demandeId: string;
  blob: Blob | ArrayBuffer;
};

export class PortailAideFinanciereDb extends Dexie {
  demandes!: EntityTable<Demande, "id">;
  documents!: EntityTable<DocumentLocal, "demandeId">;

  constructor(nom = NOM_BASE_DONNEES) {
    super(nom);

    this.version(1).stores({
      demandes: "&id, statut, dateModification",
      documents: "&demandeId",
    });
  }
}

export const db = new PortailAideFinanciereDb();