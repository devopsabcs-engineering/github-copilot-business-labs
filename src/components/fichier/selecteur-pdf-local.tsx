"use client";

import { FileText, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Demande } from "@/lib/domaine/demande.types";
import { validerPdfLocal } from "@/lib/fichier/pdf-local";
import {
  demandesRepository,
  ErreurStockageLocal,
} from "@/lib/stockage/demandes.repository";
import { documentsRepository } from "@/lib/stockage/documents.repository";

type SelecteurPdfLocalProps = {
  demande: Demande;
  onDemandeEnregistree: (demande: Demande) => void;
};

type ConflitDocument = {
  versionLocale: Demande;
  versionRecente: Demande;
  fichier: File;
};

function prochaineDateModification(dateActuelle: string): string {
  const maintenant = Date.now();
  const dateSuivante = Math.max(maintenant, Date.parse(dateActuelle) + 1);
  return new Date(dateSuivante).toISOString();
}

export function SelecteurPdfLocal({
  demande,
  onDemandeEnregistree,
}: SelecteurPdfLocalProps) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [urlApercu, setUrlApercu] = useState<string | null>(null);
  const [conflit, setConflit] = useState<ConflitDocument | null>(null);
  const idChamp = `document-${demande.id}`;
  const idAide = `${idChamp}-aide`;
  const idErreur = `${idChamp}-erreur`;

  useEffect(() => {
    return () => {
      if (urlApercu) {
        URL.revokeObjectURL(urlApercu);
      }
    };
  }, [urlApercu]);

  useEffect(() => {
    let actif = true;

    async function restaurerApercu() {
      if (!demande.document) {
        return;
      }

      const documentLocal = await documentsRepository.lire(demande.id);
      if (actif && documentLocal) {
        const blob =
          documentLocal.blob instanceof Blob
            ? documentLocal.blob
            : new Blob([documentLocal.blob], {
                type: demande.document.typeMime,
              });
        setUrlApercu(URL.createObjectURL(blob));
      }
    }

    void restaurerApercu();
    return () => {
      actif = false;
    };
  }, [demande.document, demande.id]);

  function afficherApercu(fichier: File): void {
    setUrlApercu(URL.createObjectURL(fichier));
  }

  async function enregistrerFichier(fichier: File): Promise<void> {
    const versionLocale = {
      ...demande,
      document: {
        nomFichier: fichier.name,
        typeMime: "application/pdf",
        tailleOctets: fichier.size,
        derniereModification: fichier.lastModified,
      },
      dateModification: prochaineDateModification(demande.dateModification),
    } satisfies Demande;

    try {
      await documentsRepository.enregistrer(
        versionLocale,
        fichier,
        demande.dateModification,
      );
      onDemandeEnregistree(versionLocale);
      afficherApercu(fichier);
      setErreur(null);
      setConflit(null);
      setMessage(`${fichier.name} est conservé uniquement sur cet appareil.`);
    } catch (cause) {
      if (
        cause instanceof ErreurStockageLocal &&
        cause.code === "CONFLIT_MODIFICATION"
      ) {
        const versionRecente = await demandesRepository.lire(demande.id);
        setConflit({ versionLocale, versionRecente, fichier });
      }

      setErreur(
        cause instanceof Error
          ? cause.message
          : "Le document n’a pas pu être conservé sur cet appareil.",
      );
      setMessage(null);
    }
  }

  async function gererSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const resultat = validerPdfLocal(event.currentTarget.files ?? []);

    if (!resultat.valide) {
      setErreur(resultat.message);
      setMessage(null);
      setConflit(null);
      return;
    }

    await enregistrerFichier(resultat.fichier);
  }

  async function rechargerVersionRecente(): Promise<void> {
    if (!conflit) {
      return;
    }

    onDemandeEnregistree(conflit.versionRecente);
    setConflit(null);
    setErreur(null);
    setMessage("La version récente a été rechargée.");
  }

  async function conserverMesChangements(): Promise<void> {
    if (!conflit) {
      return;
    }

    try {
      await documentsRepository.enregistrer(
        conflit.versionLocale,
        conflit.fichier,
        conflit.versionRecente.dateModification,
        { forcer: true },
      );
      onDemandeEnregistree(conflit.versionLocale);
      afficherApercu(conflit.fichier);
      setConflit(null);
      setErreur(null);
      setMessage("Vos changements ont été conservés sur cet appareil.");
    } catch (cause) {
      setErreur(
        cause instanceof Error
          ? cause.message
          : "Le document n’a pas pu être conservé sur cet appareil.",
      );
    }
  }

  return (
    <div>
      <Label htmlFor={idChamp}>Document justificatif fictif</Label>
      <p id={idAide}>PDF, 5 Mo maximum. Aucun document n’est transmis.</p>
      <Input
        id={idChamp}
        type="file"
        accept="application/pdf,.pdf"
        multiple={false}
        aria-invalid={erreur ? "true" : undefined}
        aria-describedby={`${idAide}${erreur ? ` ${idErreur}` : ""}`}
        onChange={gererSelection}
      />

      {erreur ? (
        <p id={idErreur} className="message-erreur" role="alert">
          <TriangleAlert aria-hidden="true" size={20} />
          {erreur}
        </p>
      ) : null}

      {conflit ? (
        <div role="group" aria-label="Résoudre le conflit de modification">
          <Button onClick={rechargerVersionRecente}>
            Recharger la version récente
          </Button>
          <Button onClick={conserverMesChangements}>
            Conserver mes changements
          </Button>
        </div>
      ) : null}

      {message ? <p role="status">{message}</p> : null}

      {urlApercu ? (
        <a href={urlApercu} target="_blank" rel="noreferrer">
          <FileText aria-hidden="true" size={20} />
          Ouvrir le PDF local
        </a>
      ) : null}
    </div>
  );
}