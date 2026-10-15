export function creerIdentifiantLocal(): string {
  return crypto.randomUUID();
}

export function creerNumeroDemonstration(identifiant: string): string {
  const suffixe = identifiant.replaceAll("-", "").slice(0, 8).toUpperCase();

  if (!/^[A-Z0-9]{8}$/.test(suffixe)) {
    throw new TypeError("L'identifiant local ne permet pas de créer un numéro de démonstration.");
  }

  return `DEMO-2026-${suffixe}`;
}