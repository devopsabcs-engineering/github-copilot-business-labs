"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { FilePlus2 } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { formaterDateHeure } from "@/lib/format/date";
import { demandesRepository } from "@/lib/stockage/demandes.repository";

export function ListeDemandes() {
  const demandes = useLiveQuery(() => demandesRepository.lister());

  if (demandes === undefined) {
    return <p role="status">Chargement des demandes locales…</p>;
  }

  if (demandes.length === 0) {
    return (
      <section className="etat-vide" aria-labelledby="titre-etat-vide">
        <FilePlus2 aria-hidden="true" size={36} />
        <h2 id="titre-etat-vide">Aucun brouillon sur cet appareil</h2>
        <p>Créez une demande fictive pour commencer le parcours en cinq étapes.</p>
        <ButtonLink href="/demandes/nouvelle">Démarrer une demande</ButtonLink>
      </section>
    );
  }

  return (
    <section aria-labelledby="titre-liste-demandes">
      <div className="entete-section">
        <h2 id="titre-liste-demandes">Brouillons enregistrés</h2>
        <ButtonLink href="/demandes/nouvelle">Nouvelle demande</ButtonLink>
      </div>
      <ul className="liste-demandes">
        {demandes.map((demande) => (
          <li key={demande.id} className="carte-demande">
            <div>
              <strong>{demande.projet?.titre || "Projet sans titre"}</strong>
              <p>
                Étape {demande.etapeCourante} sur 5 · Modifié le{" "}
                {formaterDateHeure(demande.dateModification)}
              </p>
            </div>
            <Link href={`/demandes/dossier?id=${demande.id}`}>Ouvrir le dossier</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}