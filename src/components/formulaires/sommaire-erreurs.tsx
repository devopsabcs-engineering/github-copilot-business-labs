"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

export type ErreurSommaire = {
  id: string;
  message: string;
  href?: string;
};

export function SommaireErreurs({ erreurs }: { erreurs: ErreurSommaire[] }) {
  const sommaireRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (erreurs.length > 0) {
      requestAnimationFrame(() => sommaireRef.current?.focus());
    }
  }, [erreurs]);

  if (erreurs.length === 0) {
    return null;
  }

  return (
    <div
      ref={sommaireRef}
      className="sommaire-erreurs"
      role="alert"
      tabIndex={-1}
    >
      <h2>
        <TriangleAlert aria-hidden="true" size={24} /> Corrigez les éléments suivants
      </h2>
      <ul>
        {erreurs.map((erreur) => (
          <li key={`${erreur.id}-${erreur.message}`}>
            <a href={erreur.href ?? `#${erreur.id}`}>{erreur.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}