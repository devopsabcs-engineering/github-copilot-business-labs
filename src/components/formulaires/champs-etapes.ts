import type { NumeroEtape } from "@/lib/domaine/demande.types";

export type ValeursAssistant = {
  organisation: {
    raisonSociale: string;
    courrielDemonstration: string;
  };
  projet: {
    titre: string;
    description: string;
    montantDemandeCents?: number;
  };
  declarationConfirmee: boolean;
};

export type NomChampAssistant =
  | "organisation.raisonSociale"
  | "organisation.courrielDemonstration"
  | "projet.titre"
  | "projet.description"
  | "projet.montantDemandeCents"
  | "declarationConfirmee";

export const CHAMPS_PAR_ETAPE: Record<
  NumeroEtape,
  readonly NomChampAssistant[]
> = {
  1: ["organisation.raisonSociale", "organisation.courrielDemonstration"],
  2: [
    "projet.titre",
    "projet.description",
    "projet.montantDemandeCents",
  ],
  3: [],
  4: ["declarationConfirmee"],
  5: [],
};