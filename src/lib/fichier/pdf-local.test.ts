import { describe, expect, it } from "vitest";

import { TAILLE_MAX_PDF_OCTETS, validerPdfLocal } from "./pdf-local";

function creerFichier(
  nom = "preuve.pdf",
  type = "application/pdf",
  taille = 10,
): File {
  return new File([new Uint8Array(taille)], nom, { type, lastModified: 123 });
}

describe("validerPdfLocal", () => {
  it("accepte un seul PDF à la taille maximale", () => {
    const fichier = creerFichier(
      "PREUVE.PDF",
      "application/pdf",
      TAILLE_MAX_PDF_OCTETS,
    );

    expect(validerPdfLocal([fichier])).toEqual({ valide: true, fichier });
  });

  it.each([
    { fichiers: [] as File[], code: "AUCUN_FICHIER" },
    {
      fichiers: [creerFichier(), creerFichier("autre.pdf")],
      code: "PLUSIEURS_FICHIERS",
    },
    { fichiers: [creerFichier("preuve.txt")], code: "EXTENSION_INVALIDE" },
    {
      fichiers: [creerFichier("preuve.pdf", "text/plain")],
      code: "TYPE_MIME_INVALIDE",
    },
    { fichiers: [creerFichier("preuve.pdf", "application/pdf", 0)], code: "FICHIER_VIDE" },
    {
      fichiers: [
        creerFichier(
          "preuve.pdf",
          "application/pdf",
          TAILLE_MAX_PDF_OCTETS + 1,
        ),
      ],
      code: "FICHIER_TROP_VOLUMINEUX",
    },
  ])("refuse la sélection invalide $code", ({ fichiers, code }) => {
    expect(validerPdfLocal(fichiers)).toMatchObject({ valide: false, code });
  });
});