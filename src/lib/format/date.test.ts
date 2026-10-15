import { describe, expect, it } from "vitest";

import { formaterDateHeure, formaterDateLongue } from "./date";

describe("format de date fr-CA", () => {
  const instant = "2026-03-15T18:30:00.000Z";

  it("présente une date longue", () => {
    expect(formaterDateLongue(instant)).toBe("15 mars 2026");
  });

  it("présente l'heure de Toronto", () => {
    expect(formaterDateHeure(instant)).toBe("15 mars 2026 à 14 h 30");
  });
});