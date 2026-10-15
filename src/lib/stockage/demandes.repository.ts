import { db, type PortailAideFinanciereDb } from "./db";

import { demandeTransmissionSchema } from "@/lib/domaine/demande.schemas";
import type { Demande } from "@/lib/domaine/demande.types";
import { transitionEstPermise } from "@/lib/domaine/machine-etats";
import { genererNumeroDemonstration } from "@/lib/domaine/numero-demonstration";

export type CodeErreurStockage =
  | "CONFLIT_MODIFICATION"
  | "DEMANDE_INTROUVABLE"
  | "QUOTA_DEPASSE"
  | "STOCKAGE_INDISPONIBLE";

const MESSAGES_ERREUR: Record<CodeErreurStockage, string> = {
  CONFLIT_MODIFICATION:
    "Cette demande a été modifiée dans un autre onglet. Rechargez la version récente ou conservez explicitement vos changements.",
  DEMANDE_INTROUVABLE: "Cette demande est introuvable sur cet appareil.",
  QUOTA_DEPASSE:
    "L’espace de stockage local est insuffisant. Vos changements en mémoire sont conservés.",
  STOCKAGE_INDISPONIBLE:
    "Le stockage local est temporairement indisponible. Vos changements en mémoire sont conservés.",
};

export class ErreurStockageLocal extends Error {
  constructor(
    public readonly code: CodeErreurStockage,
    options?: ErrorOptions,
  ) {
    super(MESSAGES_ERREUR[code], options);
    this.name = "ErreurStockageLocal";
  }
}

export class ErreurSimulationLocale extends Error {
  constructor(
    public readonly code: "DEMANDE_INCOMPLETE" | "TRANSITION_INTERDITE",
  ) {
    super(
      code === "DEMANDE_INCOMPLETE"
        ? "La demande fictive doit être complète avant la simulation."
        : "Cette transition de statut simulé n’est pas permise.",
    );
    this.name = "ErreurSimulationLocale";
  }
}

function contientErreurQuota(erreur: unknown, dejaVues = new Set<unknown>()): boolean {
  if (!erreur || dejaVues.has(erreur)) {
    return false;
  }

  dejaVues.add(erreur);

  if (
    typeof erreur === "object" &&
    "name" in erreur &&
    erreur.name === "QuotaExceededError"
  ) {
    return true;
  }

  if (typeof erreur === "object") {
    const enveloppe = erreur as { cause?: unknown; inner?: unknown };
    return (
      contientErreurQuota(enveloppe.cause, dejaVues) ||
      contientErreurQuota(enveloppe.inner, dejaVues)
    );
  }

  return false;
}

export function normaliserErreurStockage(erreur: unknown): ErreurStockageLocal {
  if (erreur instanceof ErreurStockageLocal) {
    return erreur;
  }

  return new ErreurStockageLocal(
    contientErreurQuota(erreur) ? "QUOTA_DEPASSE" : "STOCKAGE_INDISPONIBLE",
    { cause: erreur },
  );
}

function dateSuivante(dateActuelle: string, dateProposee: string): string {
  return new Date(
    Math.max(Date.parse(dateProposee), Date.parse(dateActuelle) + 1),
  ).toISOString();
}

export class DemandesRepository {
  constructor(private readonly database: PortailAideFinanciereDb = db) {}

  async creer(demande: Demande): Promise<Demande> {
    try {
      await this.database.demandes.add(demande);
      return demande;
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }

  async lire(id: string): Promise<Demande> {
    try {
      const demande = await this.database.demandes.get(id);

      if (!demande) {
        throw new ErreurStockageLocal("DEMANDE_INTROUVABLE");
      }

      return demande;
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }

  async lister(): Promise<Demande[]> {
    try {
      return await this.database.demandes.orderBy("dateModification").reverse().toArray();
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }

  async mettreAJour(
    demande: Demande,
    dateModificationAttendue: string,
    options: { forcer?: boolean } = {},
  ): Promise<Demande> {
    try {
      return await this.database.transaction(
        "rw",
        this.database.demandes,
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
          return demande;
        },
      );
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }

  async simulerTransmission(
    demande: Demande,
    dateModificationAttendue: string,
  ): Promise<Demande> {
    if (!demandeTransmissionSchema.safeParse(demande).success) {
      throw new ErreurSimulationLocale("DEMANDE_INCOMPLETE");
    }

    try {
      return await this.database.transaction(
        "rw",
        this.database.demandes,
        async () => {
          const versionPersistante = await this.database.demandes.get(demande.id);

          if (!versionPersistante) {
            throw new ErreurStockageLocal("DEMANDE_INTROUVABLE");
          }

          if (versionPersistante.dateModification !== dateModificationAttendue) {
            throw new ErreurStockageLocal("CONFLIT_MODIFICATION");
          }

          if (
            versionPersistante.statut !== "BROUILLON" ||
            versionPersistante.numeroDemonstration
          ) {
            throw new ErreurSimulationLocale("TRANSITION_INTERDITE");
          }

          const dateHeure = dateSuivante(
            versionPersistante.dateModification,
            demande.dateModification,
          );
          const demandeTransmise = {
            ...demande,
            statut: "TRANSMISE_SIMULEE",
            numeroDemonstration: genererNumeroDemonstration(demande.id),
            evenements: [
              ...versionPersistante.evenements,
              {
                statutPrecedent: "BROUILLON",
                statutNouveau: "TRANSMISE_SIMULEE",
                dateHeure,
              },
            ],
            dateModification: dateHeure,
          } satisfies Demande;

          await this.database.demandes.put(demandeTransmise);
          return demandeTransmise;
        },
      );
    } catch (erreur) {
      if (erreur instanceof ErreurSimulationLocale) {
        throw erreur;
      }
      throw normaliserErreurStockage(erreur);
    }
  }

  async avancerStatutSimule(
    id: string,
    statutVise: Demande["statut"],
    dateProposee = new Date().toISOString(),
  ): Promise<Demande> {
    try {
      return await this.database.transaction(
        "rw",
        this.database.demandes,
        async () => {
          const demande = await this.database.demandes.get(id);

          if (!demande) {
            throw new ErreurStockageLocal("DEMANDE_INTROUVABLE");
          }

          if (
            statutVise === "TRANSMISE_SIMULEE" ||
            !transitionEstPermise(demande.statut, statutVise)
          ) {
            throw new ErreurSimulationLocale("TRANSITION_INTERDITE");
          }

          const dateHeure = dateSuivante(demande.dateModification, dateProposee);
          const demandeAvancee = {
            ...demande,
            statut: statutVise,
            evenements: [
              ...demande.evenements,
              {
                statutPrecedent: demande.statut,
                statutNouveau: statutVise,
                dateHeure,
              },
            ],
            dateModification: dateHeure,
          } satisfies Demande;

          await this.database.demandes.put(demandeAvancee);
          return demandeAvancee;
        },
      );
    } catch (erreur) {
      if (erreur instanceof ErreurSimulationLocale) {
        throw erreur;
      }
      throw normaliserErreurStockage(erreur);
    }
  }

  async supprimer(id: string): Promise<void> {
    try {
      await this.database.transaction(
        "rw",
        this.database.demandes,
        this.database.documents,
        async () => {
          const demandeExiste = await this.database.demandes.get(id);

          if (!demandeExiste) {
            throw new ErreurStockageLocal("DEMANDE_INTROUVABLE");
          }

          await this.database.documents.delete(id);
          await this.database.demandes.delete(id);
        },
      );
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }

  async effacerTout(): Promise<void> {
    try {
      await this.database.transaction(
        "rw",
        this.database.demandes,
        this.database.documents,
        async () => {
          await this.database.documents.clear();
          await this.database.demandes.clear();
        },
      );
    } catch (erreur) {
      throw normaliserErreurStockage(erreur);
    }
  }
}

export const demandesRepository = new DemandesRepository();