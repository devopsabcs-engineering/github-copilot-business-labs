import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Request } from "@playwright/test";

const base = "/github-copilot-business-labs";

test("Pages directory indexes, refresh, locale hash, fonts, downloads and RSC", async ({ page, request }) => {
  const failures: string[] = [];
  const rsc = new Set<string>();
  const pendingRsc = new Set<Request>();
  const navigations: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).searchParams.has("_rsc")) pendingRsc.add(request);
  });
  page.on("requestfinished", (request) => pendingRsc.delete(request));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (response.status() >= 400) failures.push(`${response.status()} ${url.pathname}`);
    if (url.searchParams.has("_rsc") && response.ok()) rsc.add(url.pathname);
    if (response.request().isNavigationRequest()) navigations.push(url.pathname);
  });
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("requestfailed", (request) => {
    pendingRsc.delete(request);
    const error = request.failure()?.errorText ?? "unknown";
    if (!/ABORTED|NS_BINDING_ABORTED|^Load request cancelled$/.test(error)) failures.push(`${error} ${request.url()}`);
  });

  await page.goto(`${base}/lab/en/#lab-05`);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr-CA");
  await expect(page.locator("main")).toHaveAttribute("lang", "en-CA");
  await expect(page.locator("main h1")).toBeVisible();
  await expect.poll(() => pendingRsc.size).toBe(0);
  await page.reload();
  const french = page.getByRole("link", { name: "Français", exact: true });
  await expect(french).toHaveAttribute("href", `${base}/lab/fr/#lab-05`);
  await french.click();
  await expect(page).toHaveURL(new RegExp(`${base}/lab/fr/#lab-05$`));
  await expect(page.locator("main")).toHaveAttribute("lang", "fr-CA");
  await expect(page.locator("main h1")).toBeVisible();
  await expect.poll(() => pendingRsc.size).toBe(0);
  await page.reload();
  await expect(page.getByRole("link", { name: "English", exact: true })).toHaveAttribute("href", `${base}/lab/en/#lab-05`);
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/lab/en/#lab-05$`));
  await expect(page.locator("main")).toHaveAttribute("lang", "en-CA");
  expect(new URL(page.url()).hash).toBe("#lab-05");
  expect((await page.locator('link[rel="canonical"]').getAttribute("href"))).toBe(
    "https://devopsabcs-engineering.github.io/github-copilot-business-labs/lab/en/",
  );

  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const sources = [...document.styleSheets].flatMap((sheet) =>
      [...sheet.cssRules].filter((rule) => rule instanceof CSSFontFaceRule).map((rule) => ({
        source: (rule as CSSFontFaceRule).style.getPropertyValue("src"),
        base: sheet.href ?? location.href,
      })),
    );
    const urls = [...new Set(sources.flatMap(({ source, base }) => [...source.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((match) => new URL(match[1], base).href)))];
    return Promise.all(urls.map(async (url) => ({ url, status: (await fetch(url)).status })));
  });
  expect(fonts).toHaveLength(4);
  for (const font of fonts) {
    expect(new URL(font.url).pathname).toMatch(new RegExp(`^${base}/_next/static/`));
    expect(font.status).toBe(200);
  }

  for (const locale of ["en", "fr-CA"]) {
    for (const extension of ["pdf", "pptx"]) {
      const response = await request.get(`${base}/assets/github-copilot-business-fundamentals-${locale}.${extension}`);
      expect(response.status()).toBe(200);
      const bytes = await response.body();
      expect(bytes.subarray(0, extension === "pdf" ? 5 : 2).toString()).toBe(extension === "pdf" ? "%PDF-" : "PK");
    }
  }
  expect((await request.get("/lab/en/")).status()).toBe(404);
  expect((await request.get(`${base}/assets/not-allowlisted.pdf`)).status()).toBe(404);

  await expect.poll(() => pendingRsc.size).toBe(0);
  await page.goto(`${base}/`);
  await expect.poll(() => [...rsc].some((route) => route.startsWith(`${base}/programme/`))).toBe(true);
  const before = navigations.length;
  await page.getByRole("link", { name: "Le programme", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/programme/$`));
  await expect(page.locator("main h1")).toBeVisible();
  expect(navigations.length).toBe(before);
  await expect.poll(() => pendingRsc.size).toBe(0);
  await page.goto(`${base}/lab/`);
  const english = page.locator(`a[href="${base}/lab/en/"]`);
  await english.hover();
  await expect.poll(() => [...rsc].some((route) => route.startsWith(`${base}/lab/en/`))).toBe(true);
  const beforeLab = navigations.length;
  await english.click();
  await expect(page.locator("main")).toHaveAttribute("lang", "en-CA");
  await expect(page.locator("main h1")).toBeVisible();
  expect(navigations.length).toBe(beforeLab);
  await expect.poll(() => pendingRsc.size).toBe(0);
  expect(failures).toEqual([]);
});

test("Pages keyboard, axe, reduced motion and 320px in both locales", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of ["en", "fr"]) {
    await page.goto(`${base}/lab/${locale}/`);
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    expect(await page.locator(":focus").evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await page.getByRole("link", { name: "Passer au contenu principal" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`pages-${locale}.png`), fullPage: false });
  }
});