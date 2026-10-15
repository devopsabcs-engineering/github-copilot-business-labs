"use client";

import { useWatch } from "react-hook-form";

import { useAssistant } from "@/components/demandes/assistant-provider";
import { CONFIRMATION_DEMONSTRATION } from "@/content/fr-CA";
import { formaterMontant } from "@/lib/format/montant";

export function EtapeVerification({ demandeComplete }: { demandeComplete: boolean }) {
  const { demande } = useAssistant();
  const valeurs = useWatch();
  const montant = valeurs.projet?.montantDemandeCents as number | undefined;

  return (
    <div className="verification-demande">
      {demandeComplete ? (
        <div className="alerte" role="status">
          <h2>Vérification réussie</h2>
          <p>
            Les cinq sections sont complètes. Aucune demande n’a été transmise.
            Vous pouvez maintenant simuler la transmission; cette action demeure
            entièrement locale et non officielle.
          </p>
        </div>
      ) : null}
      <section>
        <h2>1. Organisation et contact</h2>
        <dl>
          <dt>Organisation</dt>
          <dd>{valeurs.organisation?.raisonSociale || "À compléter"}</dd>
          <dt>Courriel</dt>
          <dd>{valeurs.organisation?.courrielDemonstration || "À compléter"}</dd>
        </dl>
      </section>
      <section>
        <h2>2. Projet et montant</h2>
        <dl>
          <dt>Titre</dt>
          <dd>{valeurs.projet?.titre || "À compléter"}</dd>
          <dt>Description</dt>
          <dd>{valeurs.projet?.description || "À compléter"}</dd>
          <dt>Montant</dt>
          <dd>{montant ? formaterMontant(montant) : "À compléter"}</dd>
        </dl>
      </section>
      <section>
        <h2>3. Document</h2>
        <p>{demande.document?.nomFichier ?? "À sélectionner"}</p>
      </section>
      <section>
        <h2>4. Déclaration</h2>
        <p>
          {valeurs.declarationConfirmee
            ? CONFIRMATION_DEMONSTRATION
            : "Confirmation à compléter"}
        </p>
      </section>
      <section>
        <h2>5. Vérification</h2>
        <p>Activez « Vérifier la demande » pour contrôler les cinq sections.</p>
      </section>
    </div>
  );
}