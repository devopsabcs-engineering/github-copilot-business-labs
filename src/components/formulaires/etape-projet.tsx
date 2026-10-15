"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { ValeursAssistant } from "./champs-etapes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyserMontantEnCents } from "@/lib/format/montant";

export function EtapeProjet() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ValeursAssistant>();
  const erreurTitre = errors.projet?.titre;
  const erreurDescription = errors.projet?.description;
  const erreurMontant = errors.projet?.montantDemandeCents;

  return (
    <div className="grille-formulaire">
      <div className="groupe-champ">
        <Label htmlFor="projet-titre">
          Titre fictif du projet <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="projet-titre"
          aria-required="true"
          aria-invalid={erreurTitre ? "true" : undefined}
          aria-describedby={erreurTitre ? "erreur-projet-titre" : undefined}
          {...register("projet.titre", {
            required: "Saisissez le titre fictif du projet.",
            maxLength: {
              value: 200,
              message: "Le titre doit contenir au plus 200 caractères.",
            },
          })}
        />
        {erreurTitre ? (
          <p id="erreur-projet-titre" className="message-erreur">
            {erreurTitre.message}
          </p>
        ) : null}
      </div>

      <div className="groupe-champ">
        <Label htmlFor="projet-description">
          Description fictive <span aria-hidden="true">*</span>
        </Label>
        <p id="aide-description">Décrivez le projet en 50 à 2 000 caractères.</p>
        <textarea
          id="projet-description"
          className="champ champ-texte"
          aria-required="true"
          aria-invalid={erreurDescription ? "true" : undefined}
          aria-describedby={`aide-description${erreurDescription ? " erreur-description" : ""}`}
          {...register("projet.description", {
            required: "Décrivez le projet fictif.",
            minLength: {
              value: 50,
              message: "La description doit contenir au moins 50 caractères.",
            },
            maxLength: {
              value: 2_000,
              message: "La description doit contenir au plus 2 000 caractères.",
            },
          })}
        />
        {erreurDescription ? (
          <p id="erreur-description" className="message-erreur">
            {erreurDescription.message}
          </p>
        ) : null}
      </div>

      <div className="groupe-champ">
        <Label htmlFor="projet-montantDemandeCents">
          Montant demandé fictif <span aria-hidden="true">*</span>
        </Label>
        <p id="aide-montant">Maximum de 50 000,00 $.</p>
        <Controller
          control={control}
          name="projet.montantDemandeCents"
          rules={{
            required: "Saisissez le montant demandé.",
            min: { value: 1, message: "Le montant doit être supérieur à 0 $." },
            max: {
              value: 5_000_000,
              message: "Le montant doit être de 50 000,00 $ ou moins.",
            },
          }}
          render={({ field }) => (
            <Input
              id="projet-montantDemandeCents"
              inputMode="decimal"
              aria-required="true"
              aria-invalid={erreurMontant ? "true" : undefined}
              aria-describedby={`aide-montant${erreurMontant ? " erreur-montant" : ""}`}
              value={field.value === undefined ? "" : String(field.value / 100).replace(".", ",")}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(analyserMontantEnCents(event.currentTarget.value) ?? undefined)
              }
            />
          )}
        />
        {erreurMontant ? (
          <p id="erreur-montant" className="message-erreur">
            {erreurMontant.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}