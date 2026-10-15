import { ETAPES_DEMANDE } from "@/content/fr-CA";
import type { NumeroEtape } from "@/lib/domaine/demande.types";

export function IndicateurEtapes({ etapeActive }: { etapeActive: NumeroEtape }) {
  return (
    <nav className="indicateur-etapes" aria-label="Progression de la demande">
      <ol>
        {ETAPES_DEMANDE.map((etape, index) => {
          const numero = (index + 1) as NumeroEtape;
          return (
            <li key={etape} aria-current={numero === etapeActive ? "step" : undefined}>
              <span>{numero}</span>
              <strong>{etape}</strong>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}