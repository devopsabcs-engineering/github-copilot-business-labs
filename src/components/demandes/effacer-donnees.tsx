"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { demandesRepository } from "@/lib/stockage/demandes.repository";

export function EffacerDonnees() {
  const [message, setMessage] = useState<string | null>(null);

  async function effacer() {
    const confirmation = window.confirm(
      "Effacer tous les brouillons et PDF fictifs conservés sur cet appareil? Cette action est irréversible.",
    );

    if (!confirmation) {
      return;
    }

    try {
      await demandesRepository.effacerTout();
      setMessage("Toutes les données de démonstration ont été effacées.");
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Les données locales n’ont pas pu être effacées.",
      );
    }
  }

  return (
    <section className="zone-danger" aria-labelledby="titre-effacement">
      <h2 id="titre-effacement">Effacer les données locales</h2>
      <p>Cette commande supprime tous les brouillons et leurs PDF fictifs.</p>
      <Button className="bouton-danger" onClick={effacer}>
        <Trash2 aria-hidden="true" size={20} />
        Effacer les données de démonstration
      </Button>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}