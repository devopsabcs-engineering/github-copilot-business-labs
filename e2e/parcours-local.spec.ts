import { expect, test } from "@playwright/test";
import path from "node:path";

import { effacerIndexedDb } from "./helpers/indexeddb";

const PDF_FICTIF = path.join(process.cwd(), "e2e", "fixtures", "preuve-fictive.pdf");

test.describe.configure({ mode: "serial" });

async function creerBrouillon(page: Parameters<typeof effacerIndexedDb>[0]) {
  await page.goto("/demandes/nouvelle");
  await page.getByRole("button", { name: "Créer le brouillon local" }).click();
  await expect(page).toHaveURL(/\/demandes\/dossier\/etape\/1\?id=[0-9a-f-]+$/);
  return new URL(page.url()).searchParams.get("id") as string;
}

test.beforeEach(async ({ page }) => {
  await effacerIndexedDb(page);
});

test("brouillon: crée avant navigation et restaure les champs locaux", async ({
  page,
}) => {
  const id = await creerBrouillon(page);

  await page.getByLabel("Nom fictif de l’organisation").fill("Atelier Boréal fictif");
  await page
    .getByLabel("Courriel fictif de la personne-ressource")
    .fill("contact@example.test");
  await page.getByRole("button", { name: "Enregistrer et quitter" }).click();

  await expect(page).toHaveURL(/\/demandes$/);
  await expect(page.getByText("Projet sans titre")).toBeVisible();
  await page.getByRole("link", { name: "Ouvrir le dossier" }).click();
  await expect(page).toHaveURL(`/demandes/dossier?id=${id}`);
  await page.getByRole("link", { name: "1. Organisation et contact" }).click();
  await expect(page.getByLabel("Nom fictif de l’organisation")).toHaveValue(
    "Atelier Boréal fictif",
  );
  await expect(
    page.getByLabel("Courriel fictif de la personne-ressource"),
  ).toHaveValue("contact@example.test");
});

test("parcours: valide les cinq étapes et s'arrête à la vérification", async ({
  page,
}) => {
  await creerBrouillon(page);

  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Corrigez les éléments suivants" }),
  ).toBeFocused();
  await page.getByLabel("Nom fictif de l’organisation").fill("Collectif Démo");
  await page
    .getByLabel("Courriel fictif de la personne-ressource")
    .fill("demo@example.test");
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByLabel("Titre fictif du projet").fill("Laboratoire local fictif");
  await page
    .getByLabel("Description fictive")
    .fill(
      "Ce projet fictif sert uniquement à vérifier le parcours local accessible du prototype.",
    );
  await page.getByLabel("Montant demandé fictif").fill("12500,00");
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByLabel("Document justificatif fictif").setInputFiles(PDF_FICTIF);
  await expect(page.getByText(/preuve-fictive\.pdf est conservé/)).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByLabel(/Je confirme avoir vérifié/).check();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.getByRole("heading", { name: "Vérification", level: 1 })).toBeVisible();
  await expect(page.getByText("Laboratoire local fictif")).toBeVisible();
  await expect(page.getByText("preuve-fictive.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Vérifier la demande" }).click();
  await expect(page.getByRole("heading", { name: "Vérification réussie" })).toBeVisible();
  await expect(page).toHaveURL(/\/demandes\/dossier\/etape\/5\?id=/);
  await expect(page.getByText(/Aucune demande n’a été transmise/)).toBeVisible();
});

test("pdf: restaure le document local après rechargement sans requête réseau", async ({
  page,
  baseURL,
}) => {
  const origineLocale = new URL(baseURL!).origin;
  const id = await creerBrouillon(page);
  await page.goto(`/demandes/dossier/etape/3?id=${id}`);
  const prechargementsStatiques: string[] = [];
  const requetesPendantSelection: string[] = [];
  const collecter = (requete: { method(): string; url(): string }) => {
    const methode = requete.method();
    const url = new URL(requete.url());
    const lectureStatiqueLocale =
      url.origin === origineLocale &&
      !url.pathname.startsWith("/api/") &&
      ["GET", "HEAD"].includes(methode);

    if (lectureStatiqueLocale) {
      if (methode === "HEAD") {
        prechargementsStatiques.push(`${methode} ${url.pathname}`);
      }
      return;
    }

    requetesPendantSelection.push(`${methode} ${requete.url()}`);
  };
  page.on("request", collecter);

  await page.getByLabel("Document justificatif fictif").setInputFiles(PDF_FICTIF);
  await expect(page.getByRole("link", { name: "Ouvrir le PDF local" })).toBeVisible();
  expect(requetesPendantSelection).toEqual([]);
  expect(prechargementsStatiques.every((requete) => requete.startsWith("HEAD "))).toBe(
    true,
  );
  page.off("request", collecter);

  await page.reload();
  await expect(page.getByText("Document conservé : preuve-fictive.pdf")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ouvrir le PDF local" })).toBeVisible();
});