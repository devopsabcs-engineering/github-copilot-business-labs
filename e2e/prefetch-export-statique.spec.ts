import { expect, test } from "@playwright/test";

const ROUTES_CIBLES = ["/demandes", "/lab/en", "/lab/fr", "/programme"];

test("l’export statique sert les préchargements RSC et conserve la navigation", async ({
  page,
}) => {
  const routesPrechargees = new Set<string>();
  const echecsRsc: string[] = [];
  const erreurs404: string[] = [];

  page.on("response", (response) => {
    const url = new URL(response.url());
    if (!url.searchParams.has("_rsc")) return;

    for (const route of ROUTES_CIBLES) {
      if (url.pathname.startsWith(`${route}/`)) routesPrechargees.add(route);
    }

    if (response.status() >= 400) {
      echecsRsc.push(`${response.status()} ${url.pathname}`);
    }
  });
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    const erreur = request.failure()?.errorText;
    const navigationAnnulee = ["net::ERR_ABORTED", "NS_BINDING_ABORTED", "Load request cancelled"].includes(
      erreur ?? "",
    );
    if (url.searchParams.has("_rsc") && !navigationAnnulee) {
      echecsRsc.push(`${erreur ?? "échec réseau"} ${url.pathname}`);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("404")) {
      erreurs404.push(message.text());
    }
  });

  await page.goto("/");
  await expect
    .poll(() => routesPrechargees.has("/programme") && routesPrechargees.has("/demandes"))
    .toBe(true);

  await page.getByRole("link", { name: "Le programme" }).click();
  await expect(page).toHaveURL(/\/programme$/);
  await page.goto("/");
  await page.getByRole("link", { name: "Parcours de démonstration" }).click();
  await expect(page).toHaveURL(/\/demandes$/);

  await page.goto("/lab");
  await expect
    .poll(() => routesPrechargees.has("/lab/en") && routesPrechargees.has("/lab/fr"))
    .toBe(true);

  await page.locator('a[href="/lab/en"]').click();
  await expect(page).toHaveURL(/\/lab\/en$/);
  await page.goto("/lab");
  await page.locator('a[href="/lab/fr"]').click();
  await expect(page).toHaveURL(/\/lab\/fr$/);

  expect([...routesPrechargees].sort()).toEqual([...ROUTES_CIBLES].sort());
  expect(echecsRsc).toEqual([]);
  expect(erreurs404).toEqual([]);
});