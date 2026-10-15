import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const MODULE_IDS = [
  "lab-00",
  "lab-01",
  "lab-02",
  "lab-03",
  "lab-04",
  "lab-05",
  "lab-06",
  "lab-07",
  "lab-cap",
] as const;

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.querySelectorAll("body *"))
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          bounds: `${Math.round(bounds.left)}..${Math.round(bounds.right)}`,
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
            element.className && typeof element.className === "string"
              ? `.${element.className.trim().replaceAll(" ", ".")}`
              : ""
          }`,
        };
      })
      .filter(({ bounds }) => Number(bounds.split("..")[1]) > window.innerWidth + 1)
      .slice(0, 10),
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.documentWidth, JSON.stringify(dimensions.offenders)).toBeLessThanOrEqual(
    dimensions.viewportWidth + 1,
  );
}

async function expectNoSeriousAxeFindings(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) =>
      impact === "serious" || impact === "critical",
    ),
  ).toEqual([]);
}

test.describe("laboratoire bilingue", () => {
  test("conserve les ancres stables pendant le changement de langue", async ({
    page,
  }) => {
    await page.goto("/lab/en#lab-05");
    await expect(page.locator("main")).toHaveAttribute("lang", "en-CA");

    for (const moduleId of MODULE_IDS) {
      await expect(page.locator(`#${moduleId}`)).toBeAttached();
    }

    const frenchLink = page.getByRole("link", { name: "Français" });
    await expect(frenchLink).toHaveAttribute("href", "/lab/fr#lab-05");
    await frenchLink.click();
    await expect(page).toHaveURL(/\/lab\/fr#lab-05$/);
    await expect(page.locator("main")).toHaveAttribute("lang", "fr-CA");
    await expect(page.locator("#lab-05")).toBeVisible();

    const englishLink = page.getByRole("link", { name: "English" });
    await expect(englishLink).toHaveAttribute("href", "/lab/en#lab-05");
    await englishLink.click();
    await expect(page).toHaveURL(/\/lab\/en#lab-05$/);
    await expect(page.locator("main")).toHaveAttribute("lang", "en-CA");
  });

  test("rend chaque module, ses étapes et son point de contrôle", async ({
    page,
  }) => {
    await page.goto("/lab/en");

    for (const moduleId of MODULE_IDS) {
      const lesson = page.locator(`#${moduleId}`);
      await expect(lesson).toBeAttached();
      await expect(lesson.locator('[id^="step-"]')).not.toHaveCount(0);
      await expect(lesson.locator('[id^="check-"]')).toHaveCount(1);

      const moduleLink = page.locator(`.lab-module-nav a[href="#${moduleId}"]`);
      await expect(moduleLink).toHaveCount(1);
      await moduleLink.click();
      await expect(page).toHaveURL(new RegExp(`#${moduleId}$`));
    }

    await expect(
      page.getByText("npm run test -- lab-content fundamentals-lab"),
    ).toBeVisible();
    await expect(
      page.getByText(
        "The eligibility tests pass and the diff contains no production behaviour change.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText("npm run test:e2e -- --project=chromium", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("reste accessible, utilisable au clavier et sans mouvement imposé", async ({
    page,
  }, testInfo: TestInfo) => {
    test.skip(
      !["chromium", "mobile-320"].includes(testInfo.project.name),
      "La vérification ciblée couvre les profils bureau et 320 px.",
    );

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/lab/fr");

    await expect(
      page.getByText(/Utilisez uniquement des renseignements fictifs/),
    ).toBeVisible();
    await expect(page.getByText(/ne téléverse pas/)).toBeVisible();
    await expect(page.getByText(/N’indiquez aucune durée de conservation/)).toBeVisible();

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
    const outline = await focused.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(outline.style).not.toBe("none");
    expect(outline.width).toBeGreaterThan(0);

    const transitionDuration = await page.locator("body").evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).transitionDuration),
    );
    expect(transitionDuration).toBeLessThanOrEqual(0.00001);

    await expectNoSeriousAxeFindings(page);
    await expectNoOverflow(page);
  });

  test("préserve les deux langues avec espacement, contraste forcé, zoom et 320 px", async ({
    page,
  }, testInfo: TestInfo) => {
    test.skip(
      !["chromium", "mobile-320"].includes(testInfo.project.name),
      "Les modes ciblés couvrent le bureau à 200 % et le profil 320 px.",
    );

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });

    for (const locale of ["en", "fr"] as const) {
      await page.goto(`/lab/${locale}`);
      const textSpacingStyle = await page.addStyleTag({
        content: `
          main { line-height: 1.5 !important; }
          main p, main li { letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
          main p { margin-bottom: 2em !important; }
        `,
      });
      await expectNoOverflow(page);
      await textSpacingStyle.evaluate((element) => element.parentNode?.removeChild(element));

      if (testInfo.project.name === "chromium") {
        await page.evaluate(() => {
          document.documentElement.style.zoom = "200%";
        });
      }

      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
      expect(
        await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
      ).toBe(true);
      expect(
        await page.locator("body").evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).transitionDuration),
        ),
      ).toBeLessThanOrEqual(0.00001);
      await expectNoOverflow(page);
    }
  });

  test("ne produit aucune requête API ou mutation réseau", async ({ page, baseURL }) => {
    const expectedOrigin = new URL(baseURL!).origin;
    const unexpectedRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        url.origin !== expectedOrigin ||
        url.pathname.startsWith("/api/") ||
        !["GET", "HEAD"].includes(request.method())
      ) {
        unexpectedRequests.push(`${request.method()} ${url.href}`);
      }
    });

    await page.goto("/lab/en");
    await page.getByRole("link", { name: "Français" }).click();
    await expect(page).toHaveURL(/\/lab\/fr#lab-00$/);
    expect(unexpectedRequests).toEqual([]);
  });
});