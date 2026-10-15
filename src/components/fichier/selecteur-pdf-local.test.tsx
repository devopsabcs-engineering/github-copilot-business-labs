import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Demande } from "@/lib/domaine/demande.types";
import { db } from "@/lib/stockage/db";
import { demandesRepository } from "@/lib/stockage/demandes.repository";
import { documentsRepository } from "@/lib/stockage/documents.repository";

import { SelecteurPdfLocal } from "./selecteur-pdf-local";

const demande: Demande = {
  schemaVersion: 1,
  id: "00000000-0000-4000-8000-000000000003",
  programmeCode: "PAF-DEMO-2026",
  statut: "BROUILLON",
  etapeCourante: 1,
  evenements: [],
  dateCreation: "2026-07-31T12:00:00.000Z",
  dateModification: "2026-07-31T12:00:00.000Z",
};

describe("SelecteurPdfLocal", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await demandesRepository.creer(demande);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:apercu-local");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    cleanup();
    vi.restoreAllMocks();
    await db.delete();
  });

  it("lie une erreur descriptive au champ fichier", () => {
    render(<SelecteurPdfLocal demande={demande} onDemandeEnregistree={vi.fn()} />);
    const champ = screen.getByLabelText("Document justificatif fictif");

    fireEvent.change(champ, {
      target: { files: [new File(["texte"], "preuve.txt", { type: "text/plain" })] },
    });

    const erreur = screen.getByRole("alert");
    expect(erreur).toHaveTextContent("Le nom du fichier doit se terminer par .pdf.");
    expect(champ).toHaveAttribute("aria-invalid", "true");
    expect(champ).toHaveAccessibleDescription(
      "PDF, 5 Mo maximum. Aucun document n’est transmis. Le nom du fichier doit se terminer par .pdf.",
    );
  });

  it("conserve le PDF local sans requête réseau et révoque son URL", async () => {
    const onDemandeEnregistree = vi.fn();
    const fetchEspion = vi.spyOn(globalThis, "fetch");
    const { unmount } = render(
      <SelecteurPdfLocal
        demande={demande}
        onDemandeEnregistree={onDemandeEnregistree}
      />,
    );
    const fichier = new File(["PDF fictif"], "preuve.pdf", {
      type: "application/pdf",
      lastModified: 123,
    });

    fireEvent.change(screen.getByLabelText("Document justificatif fictif"), {
      target: { files: [fichier] },
    });

    await waitFor(() => expect(onDemandeEnregistree).toHaveBeenCalledOnce());
    await expect(documentsRepository.lire(demande.id)).resolves.not.toBeNull();
    expect(fetchEspion).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Ouvrir le PDF local" })).toHaveAttribute(
      "href",
      "blob:apercu-local",
    );

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:apercu-local");
  });
});