"use client";

import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  evaluerAdmissibilite,
  type ReponsesAdmissibilite,
  type ResultatAdmissibilite,
} from "@/lib/domaine/admissibilite";

const QUESTIONS = [
  {
    id: "entrepriseOuOrganisme",
    texte: "Présentez-vous une entreprise ou un organisme fictif?",
  },
  {
    id: "projetAuQuebec",
    texte: "Le projet de démonstration se déroule-t-il au Québec?",
  },
  {
    id: "donneesFictivesConfirmees",
    texte: "Confirmez-vous utiliser uniquement des données fictives?",
  },
] as const;

type EtatResultat =
  | { type: "incomplet"; questions: string[] }
  | { type: "evalue"; resultat: ResultatAdmissibilite }
  | null;

export function VerificateurAdmissibilite() {
  const resultatRef = useRef<HTMLDivElement>(null);
  const [etatResultat, setEtatResultat] = useState<EtatResultat>(null);

  function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const donnees = new FormData(event.currentTarget);
    const questionsSansReponse = QUESTIONS.filter(
      ({ id }) => !donnees.has(id),
    ).map(({ texte }) => texte);

    if (questionsSansReponse.length > 0) {
      setEtatResultat({ type: "incomplet", questions: questionsSansReponse });
      requestAnimationFrame(() => resultatRef.current?.focus());
      return;
    }

    const reponses = Object.fromEntries(
      QUESTIONS.map(({ id }) => [id, donnees.get(id) === "oui"]),
    ) as ReponsesAdmissibilite;

    setEtatResultat({
      type: "evalue",
      resultat: evaluerAdmissibilite(reponses),
    });
    requestAnimationFrame(() => resultatRef.current?.focus());
  }

  return (
    <div>
      <form aria-describedby="precision-verification" noValidate onSubmit={soumettre}>
        <p id="precision-verification">
          Répondez aux trois questions, puis lancez la vérification. Ce contrôle
          est fictif et ne crée aucun dossier.
        </p>

        {QUESTIONS.map(({ id, texte }, index) => (
          <fieldset
            key={id}
            className="mt-6 grid gap-3 rounded border border-bordure bg-surface p-4"
          >
            <legend className="px-1 font-semibold">
              {index + 1}. {texte}
            </legend>
            <label className="flex min-h-12 cursor-pointer items-center gap-2">
              <input className="size-5 accent-marque" name={id} type="radio" value="oui" />
              Oui
            </label>
            <label className="flex min-h-12 cursor-pointer items-center gap-2">
              <input className="size-5 accent-marque" name={id} type="radio" value="non" />
              Non
            </label>
          </fieldset>
        ))}

        <div className="actions">
          <Button type="submit">Vérifier l’admissibilité</Button>
        </div>
      </form>

      {etatResultat ? (
        <div
          ref={resultatRef}
          aria-live="polite"
          className="alerte mt-8"
          role={etatResultat.type === "incomplet" ? "alert" : "status"}
          tabIndex={-1}
        >
          {etatResultat.type === "incomplet" ? (
            <ResultatIncomplet questions={etatResultat.questions} />
          ) : (
            <ResultatEvalue resultat={etatResultat.resultat} />
          )}
        </div>
      ) : null}
    </div>
  );
}

function ResultatIncomplet({ questions }: { questions: string[] }) {
  return (
    <>
      <h2 className="flex items-center gap-2">
        <TriangleAlert aria-hidden="true" /> Réponses à compléter
      </h2>
      <p>Répondez aux questions suivantes avant de vérifier l’admissibilité :</p>
      <ul>
        {questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>
    </>
  );
}

function ResultatEvalue({ resultat }: { resultat: ResultatAdmissibilite }) {
  if (resultat.admissible) {
    return (
      <>
        <h2 className="flex items-center gap-2">
          <CircleCheck aria-hidden="true" /> Résultat : admissible à la démonstration
        </h2>
        <p>
          Vos réponses respectent les trois critères fictifs. Ce résultat ne
          confirme aucune admissibilité à un programme réel.
        </p>
        <Link className="bouton" href="/demandes/nouvelle">
          Démarrer une demande fictive
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="flex items-center gap-2">
        <CircleX aria-hidden="true" /> Résultat : non admissible à la démonstration
      </h2>
      <p>Aucun brouillon n’a été créé. Voici les critères non respectés :</p>
      <ul>
        {resultat.motifs.map((motif) => (
          <li key={motif}>{motif}</li>
        ))}
      </ul>
      <p>Vous pouvez modifier vos réponses et relancer la vérification.</p>
    </>
  );
}