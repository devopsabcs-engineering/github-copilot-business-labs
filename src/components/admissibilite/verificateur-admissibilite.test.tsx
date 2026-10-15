import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { VerificateurAdmissibilite } from "./verificateur-admissibilite";

afterEach(cleanup);

describe("VerificateurAdmissibilite", () => {
  it("valide à l’action et place le focus sur les réponses manquantes", async () => {
    const utilisateur = userEvent.setup();
    render(<VerificateurAdmissibilite />);

    await utilisateur.click(
      screen.getByRole("button", { name: "Vérifier l’admissibilité" }),
    );

    const resultat = screen.getByRole("alert");
    expect(resultat).toHaveTextContent("Réponses à compléter");
    await waitFor(() => expect(resultat).toHaveFocus());
  });

  it("explique un résultat inadmissible sans proposer de créer un brouillon", async () => {
    const utilisateur = userEvent.setup();
    render(<VerificateurAdmissibilite />);

    for (const option of screen.getAllByRole("radio", { name: "Non" })) {
      await utilisateur.click(option);
    }
    await utilisateur.click(
      screen.getByRole("button", { name: "Vérifier l’admissibilité" }),
    );

    const resultat = screen.getByRole("status");
    expect(resultat).toHaveTextContent("non admissible");
    expect(resultat).toHaveTextContent("Aucun brouillon n’a été créé");
    expect(
      screen.queryByRole("link", { name: "Démarrer une demande fictive" }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(resultat).toHaveFocus());
  });

  it("propose le parcours uniquement après un résultat admissible", async () => {
    const utilisateur = userEvent.setup();
    render(<VerificateurAdmissibilite />);

    for (const option of screen.getAllByRole("radio", { name: "Oui" })) {
      await utilisateur.click(option);
    }
    await utilisateur.click(
      screen.getByRole("button", { name: "Vérifier l’admissibilité" }),
    );

    expect(
      screen.getByRole("link", { name: "Démarrer une demande fictive" }),
    ).toHaveAttribute("href", "/demandes/nouvelle");
  });
});