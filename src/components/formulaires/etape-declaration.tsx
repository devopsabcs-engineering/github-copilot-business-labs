"use client";

import { useFormContext } from "react-hook-form";

import type { ValeursAssistant } from "./champs-etapes";

import { CONFIRMATION_DEMONSTRATION } from "@/content/fr-CA";

export function EtapeDeclaration() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ValeursAssistant>();
  const erreur = errors.declarationConfirmee;

  return (
    <div className="groupe-champ">
      <label className="case-declaration" htmlFor="declarationConfirmee">
        <input
          id="declarationConfirmee"
          type="checkbox"
          className="case-a-cocher"
          aria-required="true"
          aria-invalid={erreur ? "true" : undefined}
          aria-describedby={erreur ? "erreur-declaration" : undefined}
          {...register("declarationConfirmee", {
            validate: (valeur) =>
              valeur || "Cochez la confirmation de démonstration pour continuer.",
          })}
        />
        <span>{CONFIRMATION_DEMONSTRATION}</span>
      </label>
      {erreur ? (
        <p id="erreur-declaration" className="message-erreur">
          {erreur.message}
        </p>
      ) : null}
    </div>
  );
}