const LONGUEUR_SUFFIXE = 8;

export function genererNumeroDemonstration(idDemande: string): string {
  let empreinte = 0x811c9dc5;

  for (const caractere of idDemande) {
    empreinte ^= caractere.charCodeAt(0);
    empreinte = Math.imul(empreinte, 0x01000193);
  }

  const suffixe = (empreinte >>> 0)
    .toString(16)
    .toUpperCase()
    .padStart(LONGUEUR_SUFFIXE, "0");

  return `DEMO-2026-${suffixe}`;
}