import type { Demande } from "@/lib/domaine/demande.types";

import { db, type DocumentLocal, type PortailAideFinanciereDb } from "./db";
import {
  ErreurStockageLocal,
  normaliserErreurStockage,
} from "./demandes.repository";

export class DocumentsRepository {
  constructor(private readonly database: PortailAideFinanciereDb = db) {}

  async lire(demandeId: string): Promise<DocumentLocal | null> {
    try {
      return (await this.database.documents.get(demandeId)) ?? null;
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }

  async enregistrer(
    demande: Demande,
    blob: Blob,
    dateModificationAttendue: string,
    options: { forcer?: boolean } = {},
  ): Promise<Demande> {
    if (!demande.document) {
      throw new TypeError("Les métadonnées du document sont requises.");
    }

    const contenu =
      typeof blob.arrayBuffer === "function" ? await blob.arrayBuffer() : blob;

    try {
      return await this.database.transaction(
        "rw",
        this.database.demandes,
        this.database.documents,
        async () => {
          const versionPersistante = await this.database.demandes.get(demande.id);

          if (!versionPersistante) {
            throw new ErreurStockageLocal("DEMANDE_INTROUVABLE");
          }

          if (
            !options.forcer &&
            versionPersistante.dateModification !== dateModificationAttendue
          ) {
            throw new ErreurStockageLocal("CONFLIT_MODIFICATION");
          }

          await this.database.demandes.put(demande);
          await this.database.documents.put({
            demandeId: demande.id,
            blob: contenu,
          });
          return demande;
        },
      );
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }

  async supprimer(demandeId: string): Promise<void> {
    try {
      await this.database.documents.delete(demandeId);
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }
}

export const documentsRepository = new DocumentsRepository();