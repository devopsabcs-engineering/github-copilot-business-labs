"use client";

import { CircleCheck, CircleDashed } from "lucide-react";
import Link from "next/link";

import { useAssistant } from "./assistant-provider";

import { ETAPES_DEMANDE } from "@/content/fr-CA";

export function SommaireDemande() {
  const { demande } = useAssistant();
  const sectionsCompletes = [
    Boolean(
      demande.organisation?.raisonSociale &&
        demande.organisation.courrielDemonstration,
    ),
    Boolean(
      demande.projet?.titre &&
        demande.projet.description &&
        demande.projet.montantDemandeCents,
    ),
    Boolean(demande.document),
    demande.declarationConfirmee === true,
    false,
  ];

  return (
    <>
      <p>Reprenez une section ou vérifiez l’état du brouillon conservé localement.</p>
      <ol className="sommaire-sections">
        {ETAPES_DEMANDE.map((titre, index) => {
          const numero = index + 1;
          const complete = sectionsCompletes[index];
          return (
            <li key={titre}>
              {complete ? (
                <CircleCheck aria-hidden="true" size={22} />
              ) : (
                <CircleDashed aria-hidden="true" size={22} />
              )}
              <div>
                <Link href={`/demandes/dossier/etape/${numero}?id=${demande.id}`}>
                  {numero}. {titre}
                </Link>
                <span>{complete ? "Section remplie" : "À compléter"}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}