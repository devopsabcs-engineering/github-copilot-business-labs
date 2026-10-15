"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  CHAMPS_PAR_ETAPE,
  type NomChampAssistant,
  type ValeursAssistant,
} from "./champs-etapes";
import type { ErreurSommaire } from "./sommaire-erreurs";

import { useAssistant } from "@/components/demandes/assistant-provider";
import { Button } from "@/components/ui/button";
import { demandeTransmissionSchema } from "@/lib/domaine/demande.schemas";
import type { NumeroEtape } from "@/lib/domaine/demande.types";

const TOUS_LES_CHAMPS = Object.values(CHAMPS_PAR_ETAPE).flat();

type NavigationEtapeProps = {
  demandeComplete: boolean;
  numero: NumeroEtape;
  onErreursGlobales: (erreurs: ErreurSommaire[]) => void;
  onVerificationReussie: () => void;
};

export function NavigationEtape({
  demandeComplete,
  numero,
  onErreursGlobales,
  onVerificationReussie,
}: NavigationEtapeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const {
    demande,
    construireDemandeCourante,
    enregistrerMaintenant,
    simulerTransmission,
  } = useAssistant();
  const { clearErrors, getFieldState, setError, trigger } =
    useFormContext<ValeursAssistant>();
  const [navigationEnCours, setNavigationEnCours] = useState(false);

  function numeroEtapeDuChamp(champ: NomChampAssistant): NumeroEtape {
    if (champ.startsWith("organisation.")) {
      return 1;
    }
    if (champ.startsWith("projet.")) {
      return 2;
    }
    return 4;
  }

  function erreursDesChamps(
    champs: readonly NomChampAssistant[],
    liensVersEtapes = false,
  ): ErreurSommaire[] {
    return champs.flatMap((champ) => {
      const message = getFieldState(champ).error?.message;
      return message
        ? [{
            id: champ.replaceAll(".", "-"),
            message,
            href: liensVersEtapes && id
              ? `/demandes/dossier/etape/${numeroEtapeDuChamp(champ)}?id=${id}`
              : undefined,
          }]
        : [];
    });
  }

  async function validerEtape(): Promise<boolean> {
    clearErrors();
    const valide = await trigger(CHAMPS_PAR_ETAPE[numero], { shouldFocus: false });
    const erreurs = erreursDesChamps(CHAMPS_PAR_ETAPE[numero]);

    if (numero === 3 && !demande.document) {
      erreurs.push({
        id: `document-${demande.id}`,
        message: "Sélectionnez un document PDF fictif.",
      });
    }

    onErreursGlobales(erreurs);
    return valide && erreurs.length === 0;
  }

  async function continuer() {
    if (!(await validerEtape())) {
      return;
    }

    const prochaineEtape = (numero + 1) as NumeroEtape;
    setNavigationEnCours(true);
    const enregistre = await enregistrerMaintenant(prochaineEtape);
    setNavigationEnCours(false);
    if (enregistre && id) {
      router.push(`/demandes/dossier/etape/${prochaineEtape}?id=${id}`);
    }
  }

  async function precedent() {
    const etapePrecedente = (numero - 1) as NumeroEtape;
    setNavigationEnCours(true);
    const enregistre = await enregistrerMaintenant(etapePrecedente);
    setNavigationEnCours(false);
    if (enregistre && id) {
      router.push(`/demandes/dossier/etape/${etapePrecedente}?id=${id}`);
    }
  }

  async function quitter() {
    setNavigationEnCours(true);
    const enregistre = await enregistrerMaintenant(numero);
    setNavigationEnCours(false);
    if (enregistre) {
      router.push("/demandes");
    }
  }

  async function verifierDemande() {
    clearErrors();
    const champsValides = await trigger(TOUS_LES_CHAMPS, { shouldFocus: false });
    const erreurs = erreursDesChamps(TOUS_LES_CHAMPS, true);
    const resultat = demandeTransmissionSchema.safeParse(
      construireDemandeCourante(5),
    );

    if (!demande.document) {
      erreurs.push({
        id: `document-${demande.id}`,
        message: "Sélectionnez un document PDF fictif.",
        href: id ? `/demandes/dossier/etape/3?id=${id}` : undefined,
      });
    }

    if (!resultat.success) {
      for (const probleme of resultat.error.issues) {
        const chemin = probleme.path.join(".") as NomChampAssistant;
        if (TOUS_LES_CHAMPS.includes(chemin) && !getFieldState(chemin).error) {
          const message = "Corrigez ce champ avant la vérification finale.";
          setError(chemin, { type: "manual", message });
          erreurs.push({
            id: chemin.replaceAll(".", "-"),
            message,
            href: id
              ? `/demandes/dossier/etape/${numeroEtapeDuChamp(chemin)}?id=${id}`
              : undefined,
          });
        }
      }
    }

    onErreursGlobales(erreurs);
    if (!champsValides || erreurs.length > 0 || !resultat.success) {
      return;
    }

    const enregistre = await enregistrerMaintenant(5);
    if (enregistre) {
      onVerificationReussie();
    }
  }

  async function transmettreSimulation() {
    setNavigationEnCours(true);
    const transmise = await simulerTransmission();
    setNavigationEnCours(false);
    if (transmise && id) {
      router.push(`/demandes/dossier/confirmation?id=${id}`);
    }
  }

  return (
    <div className="navigation-etape">
      <div className="actions">
        {numero > 1 ? (
          <Button className="bouton-secondaire" disabled={navigationEnCours} onClick={precedent}>
            Précédent
          </Button>
        ) : null}
        {numero < 5 ? (
          <Button disabled={navigationEnCours} onClick={continuer}>
            Continuer
          </Button>
        ) : demandeComplete ? (
          <Button disabled={navigationEnCours} onClick={transmettreSimulation}>
            Simuler la transmission
          </Button>
        ) : (
          <Button disabled={navigationEnCours} onClick={verifierDemande}>
            Vérifier la demande
          </Button>
        )}
      </div>
      <Button className="bouton-lien" disabled={navigationEnCours} onClick={quitter}>
        Enregistrer et quitter
      </Button>
    </div>
  );
}