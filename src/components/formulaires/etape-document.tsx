"use client";

import { SelecteurPdfLocal } from "@/components/fichier/selecteur-pdf-local";
import { useAssistant } from "@/components/demandes/assistant-provider";

export function EtapeDocument() {
  const { demande, adopterDemande } = useAssistant();

  return (
    <div className="grille-formulaire">
      {demande.document ? (
        <p className="document-present">
          Document conservé : <strong>{demande.document.nomFichier}</strong>
        </p>
      ) : null}
      <SelecteurPdfLocal
        demande={demande}
        onDemandeEnregistree={adopterDemande}
      />
    </div>
  );
}