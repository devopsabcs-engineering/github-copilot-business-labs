import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SommaireErreurs } from "./sommaire-erreurs";

describe("SommaireErreurs", () => {
  it("reçoit le focus et lie chaque message à sa destination", async () => {
    render(
      <SommaireErreurs
        erreurs={[
          {
            id: "organisation-raisonSociale",
            message: "Saisissez le nom fictif de l’organisation.",
          },
          {
            id: "document-local",
            message: "Sélectionnez un document PDF fictif.",
            href: "/demandes/dossier/etape/3?id=demo",
          },
        ]}
      />,
    );

    const sommaire = screen.getByRole("alert");
    await waitFor(() => expect(sommaire).toHaveFocus());
    expect(
      screen.getByRole("link", {
        name: "Saisissez le nom fictif de l’organisation.",
      }),
    ).toHaveAttribute("href", "#organisation-raisonSociale");
    expect(
      screen.getByRole("link", {
        name: "Sélectionnez un document PDF fictif.",
      }),
    ).toHaveAttribute("href", "/demandes/dossier/etape/3?id=demo");
  });
});