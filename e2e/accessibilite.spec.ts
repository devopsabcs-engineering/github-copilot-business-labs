import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("l'accueil est visible et sans violation axe critique", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Programme Élan local", level: 1 }),
  ).toBeVisible();

  const resultats = await new AxeBuilder({ page }).analyze();
  const violationsCritiques = resultats.violations.filter(
    ({ impact }) => impact === "critical",
  );

  expect(violationsCritiques).toEqual([]);
});