export const TAILLE_MAX_PDF_OCTETS = 5 * 1024 * 1024;

export type CodeErreurPdfLocal =
  | "AUCUN_FICHIER"
  | "PLUSIEURS_FICHIERS"
  | "EXTENSION_INVALIDE"
  | "TYPE_MIME_INVALIDE"
  | "FICHIER_VIDE"
  | "FICHIER_TROP_VOLUMINEUX";

const MESSAGES_ERREUR: Record<CodeErreurPdfLocal, string> = {
  AUCUN_FICHIER: "Sélectionnez un fichier PDF.",
  PLUSIEURS_FICHIERS: "Sélectionnez un seul fichier PDF.",
  EXTENSION_INVALIDE: "Le nom du fichier doit se terminer par .pdf.",
  TYPE_MIME_INVALIDE: "Le fichier sélectionné doit être de type PDF.",
  FICHIER_VIDE: "Le fichier PDF ne peut pas être vide.",
  FICHIER_TROP_VOLUMINEUX: "Le fichier PDF doit avoir une taille maximale de 5 Mo.",
};

export type ResultatValidationPdf =
  | { valide: true; fichier: File }
  | { valide: false; code: CodeErreurPdfLocal; message: string };

function invalide(code: CodeErreurPdfLocal): ResultatValidationPdf {
  return { valide: false, code, message: MESSAGES_ERREUR[code] };
}

export function validerPdfLocal(
  fichiers: FileList | readonly File[],
): ResultatValidationPdf {
  const liste = Array.from(fichiers);

  if (liste.length === 0) {
    return invalide("AUCUN_FICHIER");
  }

  if (liste.length > 1) {
    return invalide("PLUSIEURS_FICHIERS");
  }

  const fichier = liste[0];
  if (!fichier.name.toLocaleLowerCase("fr-CA").endsWith(".pdf")) {
    return invalide("EXTENSION_INVALIDE");
  }

  if (fichier.type !== "application/pdf") {
    return invalide("TYPE_MIME_INVALIDE");
  }

  if (fichier.size === 0) {
    return invalide("FICHIER_VIDE");
  }

  if (fichier.size > TAILLE_MAX_PDF_OCTETS) {
    return invalide("FICHIER_TROP_VOLUMINEUX");
  }

  return { valide: true, fichier };
}