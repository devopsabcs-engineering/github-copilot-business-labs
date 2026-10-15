const ESPACES_DE_GROUPE = /[\s\u00a0\u202f]/g;

export function analyserMontantEnCents(valeur: string): number | null {
  const normalisee = valeur
    .replace(ESPACES_DE_GROUPE, "")
    .replace(/\$$/, "")
    .trim()
    .replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalisee)) {
    return null;
  }

  const montant = Number(normalisee);
  return Number.isFinite(montant) ? Math.round(montant * 100) : null;
}

export function formaterMontant(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new TypeError("Le montant doit être exprimé en cents entiers.");
  }

  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}