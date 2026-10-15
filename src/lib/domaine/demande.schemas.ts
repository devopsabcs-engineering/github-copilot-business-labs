import { z } from "zod";

import { NUMEROS_ETAPE, STATUTS_SIMULES } from "./demande.types";

const organisationBrouillonSchema = z.object({
  identifiantDemonstration: z.literal("ORG-DEMO-001"),
  raisonSociale: z.string().trim().max(200).optional(),
  courrielDemonstration: z.string().trim().email().optional(),
});

const projetBrouillonSchema = z.object({
  titre: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2_000).optional(),
  montantDemandeCents: z.number().int().positive().max(5_000_000).optional(),
});

export const documentFictifSchema = z.object({
  nomFichier: z.string().trim().min(1),
  typeMime: z.literal("application/pdf"),
  tailleOctets: z.number().int().positive().max(5 * 1024 * 1024),
  derniereModification: z.number().int().nonnegative(),
});

const baseDemandeSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().uuid(),
  programmeCode: z.literal("PAF-DEMO-2026"),
  statut: z.enum(STATUTS_SIMULES),
  etapeCourante: z.union(NUMEROS_ETAPE.map((numero) => z.literal(numero))),
  numeroDemonstration: z.string().regex(/^DEMO-2026-[A-Z0-9]{8}$/).optional(),
  evenements: z.array(
    z.object({
      statutPrecedent: z.enum(STATUTS_SIMULES).nullable(),
      statutNouveau: z.enum(STATUTS_SIMULES),
      dateHeure: z.string().datetime(),
    }),
  ),
  dateCreation: z.string().datetime(),
  dateModification: z.string().datetime(),
});

export const demandeBrouillonSchema = baseDemandeSchema.extend({
  organisation: organisationBrouillonSchema.optional(),
  projet: projetBrouillonSchema.optional(),
  document: documentFictifSchema.optional(),
  declarationConfirmee: z.boolean().optional(),
});

export const demandeTransmissionSchema = baseDemandeSchema.extend({
  organisation: organisationBrouillonSchema.extend({
    raisonSociale: z.string().trim().min(1).max(200),
    courrielDemonstration: z.string().trim().email(),
  }),
  projet: projetBrouillonSchema.extend({
    titre: z.string().trim().min(1).max(200),
    description: z.string().trim().min(50).max(2_000),
    montantDemandeCents: z.number().int().positive().max(5_000_000),
  }),
  document: documentFictifSchema,
  declarationConfirmee: z.literal(true),
});