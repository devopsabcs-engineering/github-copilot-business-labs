import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import path from "node:path";

import { effacerIndexedDb } from "./helpers/indexeddb";

const PDF_FICTIF = path.join(process.cwd(), "e2e", "fixtures", "preuve-fictive.pdf");

async function verifierAxe(page: Parameters<typeof effacerIndexedDb>[0]) {
  const resultats = await new AxeBuilder({ page }).analyze();
  expect(resultats.violations).toEqual([]);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await effacerIndexedDb(page);
});

test("confirmation et statuts: simule localement puis avance par commandes", async ({
  page,
}) => {
  await page.goto("/demandes/nouvelle");
  await page.getByRole("button", { name: "Créer le brouillon local" }).click();

  await page.getByLabel("Nom fictif de l’organisation").fill("Collectif Démo");
  await page
    .getByLabel("Courriel fictif de la personne-ressource")
    .fill("demo@example.test");
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByLabel("Titre fictif du projet").fill("Laboratoire local fictif");
  await page
    .getByLabel("Description fictive")
    .fill(
      "Ce projet fictif sert uniquement à vérifier la confirmation et le suivi local simulé.",
    );
  await page.getByLabel("Montant demandé fictif").fill("12500,00");
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByLabel("Document justificatif fictif").setInputFiles(PDF_FICTIF);
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByLabel(/Je confirme avoir vérifié/).check();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(
    page.getByRole("button", { name: "Simuler la transmission" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Vérifier la demande" }).click();
  await expect(
    page.getByRole("button", { name: "Simuler la transmission" }),
  ).toBeVisible();

  const requetesSuspectes: string[] = [];
  page.on("request", (requete) => {
    if (!["GET", "HEAD"].includes(requete.method()) || requete.url().includes("/api/")) {
      requetesSuspectes.push(`${requete.method()} ${requete.url()}`);
    }
  });
  await page.getByRole("button", { name: "Simuler la transmission" }).click();

  await expect(page).toHaveURL(/\/demandes\/dossier\/confirmation\?id=/);
  await expect(
    page.getByRole("heading", { name: "Aucune demande officielle n’a été créée" }),
  ).toBeVisible();
  await expect(page.getByText(/ni un reçu, ni une preuve de dépôt/)).toBeVisible();
  await expect(page.getByText(/Aucun délai de traitement/)).toBeVisible();
  await expect(page.getByText(/^DEMO-2026-[A-F0-9]{8}$/)).toBeVisible();
  expect(requetesSuspectes).toEqual([]);
  await verifierAxe(page);

  await page.getByRole("link", { name: "Voir le suivi simulé" }).click();
  await expect(page).toHaveURL(/\/demandes\/dossier\/suivi\?id=/);
  await expect(page.getByText(/Tous les statuts sont simulés/)).toBeVisible();
  await verifierAxe(page);

  const statutTransmission = page.locator("li[aria-current='step']");
  await expect(
    statutTransmission.getByRole("heading", { name: "Transmission simulée" }),
  ).toBeVisible();
  await expect(statutTransmission.locator("svg")).toBeVisible();
  expect(await statutTransmission.evaluate((element) => getComputedStyle(element).color)).not.toBe(
    "rgba(0, 0, 0, 0)",
  );

  await page
    .getByRole("button", { name: "Avancer vers le traitement simulé" })
    .click();
  await expect(
    page
      .locator("li[aria-current='step']")
      .getByRole("heading", { name: "Traitement simulé" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Avancer vers la décision simulée" })
    .click();
  await expect(
    page
      .locator("li[aria-current='step']")
      .getByRole("heading", { name: "Décision simulée" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Avancer vers/ })).toHaveCount(0);
  await expect(page.getByText(/Aucun minuteur n’est utilisé/)).toBeVisible();
});