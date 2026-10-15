"use client";

import { CircleAlert, Send } from "lucide-react";

import { useAssistant } from "./assistant-provider";

import { ButtonLink } from "@/components/ui/button";

export function ConfirmationSimulee() {
  const { demande } = useAssistant();
  const transmissionSimulee =
    demande.statut !== "BROUILLON" && Boolean(demande.numeroDemonstration);

  return (
    <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
      <p className="surtitre">Démonstration locale</p>
      <h1>Confirmation simulée</h1>
      <div className="alerte confirmation-avertissement" role="alert">
        <CircleAlert aria-hidden="true" size={28} />
        <div>
          <h2>Aucune demande officielle n’a été créée</h2>
          <p>
            Cette page ne constitue ni un reçu, ni une preuve de dépôt. Aucun
            délai de traitement n’est fourni et aucune donnée n’a été transmise.
          </p>
        </div>
      </div>
      {transmissionSimulee ? (
        <section className="confirmation-numero" aria-labelledby="titre-numero-demo">
          <Send aria-hidden="true" size={32} />
          <div>
            <h2 id="titre-numero-demo">Numéro de démonstration</h2>
            <strong>{demande.numeroDemonstration}</strong>
            <p>Ce numéro sert uniquement à retrouver cette simulation locale.</p>
          </div>
        </section>
      ) : (
        <p role="alert">
          La transmission simulée n’a pas été effectuée pour ce brouillon.
        </p>
      )}
      <div className="actions">
        {transmissionSimulee ? (
          <ButtonLink href={`/demandes/dossier/suivi?id=${demande.id}`}>
            Voir le suivi simulé
          </ButtonLink>
        ) : (
          <ButtonLink href={`/demandes/dossier/etape/5?id=${demande.id}`}>
            Retourner à la vérification
          </ButtonLink>
        )}
        <ButtonLink className="bouton-secondaire" href="/demandes">
          Retourner aux demandes locales
        </ButtonLink>
      </div>
    </main>
  );
}