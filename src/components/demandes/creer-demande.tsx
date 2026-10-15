"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Demande } from "@/lib/domaine/demande.types";
import { demandesRepository } from "@/lib/stockage/demandes.repository";

export function CreerDemande() {
  const router = useRouter();
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function creer() {
    setCreationEnCours(true);
    setErreur(null);

    const maintenant = new Date().toISOString();
    const demande = {
      schemaVersion: 1,
      id: crypto.randomUUID(),
      programmeCode: "PAF-DEMO-2026",
      statut: "BROUILLON",
      etapeCourante: 1,
      evenements: [],
      dateCreation: maintenant,
      dateModification: maintenant,
    } satisfies Demande;

    try {
      await demandesRepository.creer(demande);
      router.push(`/demandes/dossier/etape/1?id=${demande.id}`);
    } catch (cause) {
      setCreationEnCours(false);
      setErreur(
        cause instanceof Error
          ? cause.message
          : "Le brouillon n’a pas pu être créé sur cet appareil.",
      );
    }
  }

  return (
    <div className="actions-colonne">
      <Button disabled={creationEnCours} onClick={creer}>
        {creationEnCours ? "Création en cours…" : "Créer le brouillon local"}
      </Button>
      {erreur ? <p className="message-erreur" role="alert">{erreur}</p> : null}
    </div>
  );
}