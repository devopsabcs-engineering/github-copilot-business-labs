export const NUMEROS_ETAPE = [1, 2, 3, 4, 5] as const;

export type NumeroEtape = (typeof NUMEROS_ETAPE)[number];

export const STATUTS_SIMULES = [
  "BROUILLON",
  "TRANSMISE_SIMULEE",
  "EN_TRAITEMENT_SIMULE",
  "DECISION_SIMULEE",
] as const;

export type StatutSimule = (typeof STATUTS_SIMULES)[number];

export type EvenementSimule = {
  statutPrecedent: StatutSimule | null;
  statutNouveau: StatutSimule;
  dateHeure: string;
};

export type Demande = {
  schemaVersion: 1;
  id: string;
  programmeCode: "PAF-DEMO-2026";
  statut: StatutSimule;
  etapeCourante: NumeroEtape;
  organisation?: {
    identifiantDemonstration: "ORG-DEMO-001";
    raisonSociale?: string;
    courrielDemonstration?: string;
  };
  projet?: {
    titre?: string;
    description?: string;
    montantDemandeCents?: number;
  };
  document?: {
    nomFichier: string;
    typeMime: "application/pdf";
    tailleOctets: number;
    derniereModification: number;
  };
  declarationConfirmee?: boolean;
  numeroDemonstration?: string;
  evenements: EvenementSimule[];
  dateCreation: string;
  dateModification: string;
};