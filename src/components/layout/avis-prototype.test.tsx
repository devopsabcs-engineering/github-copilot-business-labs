import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvisPrototype } from "./avis-prototype";

describe("AvisPrototype", () => {
  it("présente l'avertissement permanent dans une note accessible", () => {
    render(<AvisPrototype />);

    expect(
      screen.getByRole("complementary", { name: "Avis sur le prototype" }),
    ).toHaveTextContent(
      "Prototype non officiel. Aucune donnée réelle. Aucune transmission à un organisme public.",
    );
  });
});