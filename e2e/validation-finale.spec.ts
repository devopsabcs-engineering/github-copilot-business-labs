import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { effacerIndexedDb } from "./helpers/indexeddb";

test.describe.configure({ mode: "serial" });

const PDF_FICTIF = path.join(process.cwd(), "e2e", "fixtures", "preuve-fictive.pdf");
const FICHIER_INVALIDE = path.join(
  process.cwd(),
  "e2e",
  "fixtures",
  "preuve-invalide.txt",
);

const ROUTES_STATIQUES = [
  "/",
  "/programme",
  "/aide/document-pdf",
  "/aide/donnees-locales",
  "/aide/statuts-simules",
  "/accessibilite",
  "/confidentialite",
  "/nous-joindre",
  "/service-indisponible",
  "/lab",
  "/lab/en",
  "/lab/fr",
];

async function verifierAxeEtDebordement(page: Page) {
  await expect.poll(() => page.title()).not.toBe("");
  const resultats = await new AxeBuilder({ page }).analyze();
  expect(resultats.violations, `Violations axe sur ${page.url()}`).toEqual([]);

  const dimensions = await page.evaluate(() => ({
    largeurDocument: document.documentElement.scrollWidth,
    largeurFenetre: window.innerWidth,
  }));
  expect(
    dimensions.largeurDocument,
    `Débordement horizontal sur ${page.url()}`,
  ).toBeLessThanOrEqual(dimensions.largeurFenetre + 1);
}

async function capturer(page: Page, testInfo: TestInfo, nom: string) {
  const dossier = path.join(process.cwd(), "playwright-report", "captures-finales");
  await mkdir(dossier, { recursive: true });
  const chemin = path.join(dossier, `${nom}.png`);
  await page.screenshot({ fullPage: true, path: chemin });
  await testInfo.attach(nom, {
    path: chemin,
    contentType: "image/png",
  });
}

async function creerBrouillon(page: Page) {
  await page.goto("/demandes/nouvelle");
  await page.getByRole("button", { name: "Créer le brouillon local" }).click();
  await expect(page).toHaveURL(/\/demandes\/dossier\/etape\/1\?id=[0-9a-f-]+$/);
  return new URL(page.url()).searchParams.get("id") as string;
}

test.beforeEach(async ({ page }) => {
  await effacerIndexedDb(page);
});

test(
  "axe et débordement: chaque famille de pages statiques",
  async ({ page }) => {
    test.setTimeout(180_000);
    for (const route of ROUTES_STATIQUES) {
      await page.goto(route);
      await verifierAxeEtDebordement(page);
    }
  },
);

test("inadmissibilité: conserve le focus et ne crée aucun brouillon", async ({
  page,
}) => {
  await page.goto("/programme/admissibilite");
  await page.locator('input[name="entrepriseOuOrganisme"][value="non"]').check();
  await page.locator('input[name="projetAuQuebec"][value="oui"]').check();
  await page.locator('input[name="donneesFictivesConfirmees"][value="oui"]').check();
  await page.getByRole("button", { name: "Vérifier l’admissibilité" }).click();

  const resultat = page.getByRole("status");
  await expect(resultat).toBeFocused();
  await expect(
    resultat.getByRole("heading", {
      name: "Résultat : non admissible à la démonstration",
    }),
  ).toBeVisible();

  await page.goto("/demandes");
  await expect(
    page.getByRole("heading", { name: "Aucun brouillon sur cet appareil" }),
  ).toBeVisible();
  await verifierAxeEtDebordement(page);
});

test("PDF, persistance, effacement et identifiant inconnu", async ({ page }) => {
  const id = await creerBrouillon(page);
  await page.goto(`/demandes/dossier/etape/3?id=${id}`);

  await page.getByLabel("Document justificatif fictif").setInputFiles(FICHIER_INVALIDE);
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Le nom du fichier doit se terminer par .pdf." }),
  ).toBeVisible();

  await page.getByLabel("Document justificatif fictif").setInputFiles(PDF_FICTIF);
  await expect(page.getByRole("link", { name: "Ouvrir le PDF local" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Document conservé : preuve-fictive.pdf")).toBeVisible();

  await page.goto("/demandes");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Effacer les données de démonstration" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Toutes les données de démonstration ont été effacées.",
  );
  await expect(
    page.getByRole("heading", { name: "Aucun brouillon sur cet appareil" }),
  ).toBeVisible();

  await page.goto("/demandes/dossier?id=00000000-0000-4000-8000-000000000000");
  await expect(
    page.getByRole("heading", { name: "Demande introuvable sur cet appareil" }),
  ).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "introuvable" })).toBeVisible();
});

test("clavier, zoom 200 %, mouvement réduit et captures", async ({
  page,
}, testInfo) => {
  test.skip(
    !["chromium", "mobile-320"].includes(testInfo.project.name),
    "Captures requises sur profils bureau et mobile seulement.",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  const elementActif = page.locator(":focus");
  await expect(elementActif).toBeVisible();
  const styleFocus = await elementActif.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(styleFocus.outlineStyle).not.toBe("none");
  expect(Number.parseFloat(styleFocus.outlineWidth)).toBeGreaterThan(0);

  const dureeTransition = await page.locator("body").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration),
  );
  expect(dureeTransition).toBeLessThanOrEqual(0.00001);

  if (testInfo.project.name === "chromium") {
    await page.evaluate(() => {
      document.documentElement.style.zoom = "200%";
    });
  }
  await verifierAxeEtDebordement(page);
  await capturer(page, testInfo, `accueil-${testInfo.project.name}`);

  await page.goto("/programme/admissibilite");
  await verifierAxeEtDebordement(page);
  await capturer(page, testInfo, `admissibilite-${testInfo.project.name}`);

  await page.goto("/demandes");
  await verifierAxeEtDebordement(page);
  await capturer(page, testInfo, `tableau-de-bord-${testInfo.project.name}`);

  const id = await creerBrouillon(page);
  await page
    .getByLabel("Nom fictif de l’organisation")
    .fill("Organisation fictive au nom volontairement très long pour vérifier le contenu français canadien");
  await verifierAxeEtDebordement(page);
  await capturer(page, testInfo, `assistant-${testInfo.project.name}`);

  await page.getByRole("button", { name: "Enregistrer et quitter" }).click();
  await page.getByRole("link", { name: "Ouvrir le dossier" }).click();
  await page.getByRole("link", { name: "1. Organisation et contact" }).click();
  await expect(page.getByLabel("Nom fictif de l’organisation")).toHaveValue(/volontairement/);
  await verifierAxeEtDebordement(page);
  expect(id).toMatch(/^[0-9a-f-]+$/);
});