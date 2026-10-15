import type { Demande } from "@/lib/domaine/demande.types";

export const CHOIX_CONFLIT = [
  "RECHARGER_VERSION_RECENTE",
  "CONSERVER_MES_CHANGEMENTS",
] as const;

export type ChoixConflit = (typeof CHOIX_CONFLIT)[number];

export type ResultatHydratation<T> =
  | { statut: "HYDRATE"; valeur: T }
  | { statut: "MODIFICATIONS_LOCALES_PRESERVEES" };

export function hydraterSansEcraser<T>(
  valeurPersistante: T,
  aDesModificationsLocales: boolean,
): ResultatHydratation<T> {
  return aDesModificationsLocales
    ? { statut: "MODIFICATIONS_LOCALES_PRESERVEES" }
    : { statut: "HYDRATE", valeur: valeurPersistante };
}

export function resoudreConflit(
  choix: ChoixConflit,
  versionLocale: Demande,
  versionRecente: Demande,
): { demande: Demande; forcer: boolean } {
  if (choix === "RECHARGER_VERSION_RECENTE") {
    return { demande: versionRecente, forcer: false };
  }

  return { demande: versionLocale, forcer: true };
}

type Minuterie = ReturnType<typeof setTimeout>;

export class AntiRebondAutosauvegarde<T> {
  private minuterie: Minuterie | null = null;
  private valeurEnAttente: T | null = null;

  constructor(
    private readonly enregistrer: (valeur: T) => Promise<void>,
    private readonly delaiMs = 1_000,
  ) {}

  planifier(valeur: T): void {
    this.valeurEnAttente = valeur;

    if (this.minuterie) {
      clearTimeout(this.minuterie);
    }

    this.minuterie = setTimeout(() => {
      this.minuterie = null;
      void this.enregistrerMaintenant();
    }, this.delaiMs);
  }

  async enregistrerMaintenant(): Promise<void> {
    if (this.minuterie) {
      clearTimeout(this.minuterie);
      this.minuterie = null;
    }

    const valeur = this.valeurEnAttente;
    if (valeur === null) {
      return;
    }

    await this.enregistrer(valeur);

    if (this.valeurEnAttente === valeur) {
      this.valeurEnAttente = null;
    }
  }

  annuler(): void {
    if (this.minuterie) {
      clearTimeout(this.minuterie);
      this.minuterie = null;
    }
  }

  aUneValeurEnAttente(): boolean {
    return this.valeurEnAttente !== null;
  }
}