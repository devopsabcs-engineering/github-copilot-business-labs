"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { CHAMPS_PAR_ETAPE, type ValeursAssistant } from "./champs-etapes";
import { EtapeDeclaration } from "./etape-declaration";
import { EtapeDocument } from "./etape-document";
import { EtapeOrganisation } from "./etape-organisation";
import { EtapeProjet } from "./etape-projet";
import { EtapeVerification } from "./etape-verification";
import { IndicateurEtapes } from "./indicateur-etapes";
import { NavigationEtape } from "./navigation-etape";
import { type ErreurSommaire, SommaireErreurs } from "./sommaire-erreurs";

import { ETAPES_DEMANDE } from "@/content/fr-CA";
import type { NumeroEtape } from "@/lib/domaine/demande.types";

const COMPOSANTS_ETAPE = {
  1: EtapeOrganisation,
  2: EtapeProjet,
  3: EtapeDocument,
  4: EtapeDeclaration,
} as const;

export function AssistantEtape({ numero }: { numero: NumeroEtape }) {
  const titreRef = useRef<HTMLHeadingElement>(null);
  const [erreursGlobales, setErreursGlobales] = useState<ErreurSommaire[]>([]);
  const [demandeComplete, setDemandeComplete] = useState(false);
  const { getFieldState, formState } = useFormContext<ValeursAssistant>();
  const ComposantEtape =
    numero === 5 ? null : COMPOSANTS_ETAPE[numero as 1 | 2 | 3 | 4];
  const erreursChamps = CHAMPS_PAR_ETAPE[numero].flatMap((champ) => {
    const message = getFieldState(champ).error?.message;
    return message ? [{ id: champ.replaceAll(".", "-"), message }] : [];
  });
  const erreurs = [...erreursChamps, ...erreursGlobales].filter(
    (erreur, index, liste) =>
      liste.findIndex(
        (candidate) =>
          candidate.id === erreur.id && candidate.message === erreur.message,
      ) === index,
  );

  useEffect(() => {
    titreRef.current?.focus();
  }, [numero]);

  useEffect(() => {
    if (formState.isValid) {
      setErreursGlobales((courantes) =>
        courantes.filter((erreur) => erreur.id.startsWith("document-")),
      );
    }
  }, [formState.isValid]);

  return (
    <main id="contenu-principal" className="conteneur page-assistant">
      <IndicateurEtapes etapeActive={numero} />
      <div className="contenu-assistant">
        <p className="surtitre">Étape {numero} sur 5</p>
        <h1 ref={titreRef} tabIndex={-1}>{ETAPES_DEMANDE[numero - 1]}</h1>
        <p className="introduction">
          Les champs marqués d’un astérisque sont obligatoires. Utilisez uniquement
          des données fictives.
        </p>
        <SommaireErreurs erreurs={erreurs} />
        <form noValidate onSubmit={(event) => event.preventDefault()}>
          {ComposantEtape ? <ComposantEtape /> : null}
          {numero === 5 ? (
            <EtapeVerification demandeComplete={demandeComplete} />
          ) : null}
          <NavigationEtape
            demandeComplete={demandeComplete}
            numero={numero}
            onErreursGlobales={setErreursGlobales}
            onVerificationReussie={() => setDemandeComplete(true)}
          />
        </form>
      </div>
    </main>
  );
}