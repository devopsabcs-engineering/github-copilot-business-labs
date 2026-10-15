"use client";

import { useFormContext } from "react-hook-form";

import type { ValeursAssistant } from "./champs-etapes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EtapeOrganisation() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ValeursAssistant>();
  const erreurRaison = errors.organisation?.raisonSociale;
  const erreurCourriel = errors.organisation?.courrielDemonstration;

  return (
    <div className="grille-formulaire">
      <div className="groupe-champ">
        <Label htmlFor="organisation-raisonSociale">
          Nom fictif de l’organisation <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="organisation-raisonSociale"
          autoComplete="organization"
          aria-required="true"
          aria-invalid={erreurRaison ? "true" : undefined}
          aria-describedby={erreurRaison ? "erreur-raison-sociale" : undefined}
          {...register("organisation.raisonSociale", {
            required: "Saisissez le nom fictif de l’organisation.",
            maxLength: {
              value: 200,
              message: "Le nom doit contenir au plus 200 caractères.",
            },
          })}
        />
        {erreurRaison ? (
          <p id="erreur-raison-sociale" className="message-erreur">
            {erreurRaison.message}
          </p>
        ) : null}
      </div>

      <div className="groupe-champ">
        <Label htmlFor="organisation-courrielDemonstration">
          Courriel fictif de la personne-ressource <span aria-hidden="true">*</span>
        </Label>
        <p id="aide-courriel">Utilisez une adresse de démonstration, jamais une adresse réelle.</p>
        <Input
          id="organisation-courrielDemonstration"
          type="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={erreurCourriel ? "true" : undefined}
          aria-describedby={`aide-courriel${erreurCourriel ? " erreur-courriel" : ""}`}
          {...register("organisation.courrielDemonstration", {
            required: "Saisissez un courriel fictif.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Saisissez un courriel fictif dans un format valide.",
            },
          })}
        />
        {erreurCourriel ? (
          <p id="erreur-courriel" className="message-erreur">
            {erreurCourriel.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}