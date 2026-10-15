import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { locales, releaseDate, slides } from "./generate-course-decks.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "test-results", "deck-rendered");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSlide(spec, locale, index) {
  const link = spec.labAnchor
    ? `/lab/${locale === "en-CA" ? "en" : "fr"}#${spec.labAnchor}`
    : spec.sourceUrl ?? "";
  return `
    <article class="slide" data-slide-id="${spec.id}">
      <div class="accent"></div>
      <p class="group">${spec.group}</p>
      <h2>${escapeHtml(spec.titles[locale])}</h2>
      <div class="content">
        <ul>${spec.bodies[locale].map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <div class="visual" aria-hidden="true">
          <span>CONTEXT</span><b>↓</b><span>ACT</span><b>↓</b><span>VERIFY</span>
        </div>
      </div>
      <p class="link">${escapeHtml(link)}</p>
      <footer>${spec.id} | ${locale} | ${releaseDate} | ${index + 1}/${slides.length}</footer>
    </article>`;
}

function pageHtml(locale) {
  return `<!doctype html>
  <html lang="${locale}">
    <head><meta charset="utf-8"><style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #e8eef1; color: #14232d; font-family: Aptos, "Segoe UI", sans-serif; }
      main { display: grid; grid-template-columns: repeat(2, 640px); gap: 24px; padding: 24px; width: max-content; }
      .slide { position: relative; width: 640px; height: 360px; overflow: hidden; background: #fff; border: 1px solid #cad6db; box-shadow: 0 3px 12px #12324a22; padding: 28px 34px 25px; }
      .accent { position: absolute; inset: 0 0 auto; height: 6px; background: #2d8c82; }
      .group { margin: 0 0 8px; color: #176b87; font-size: 10px; font-weight: 700; letter-spacing: 1px; }
      h2 { width: 100%; height: 62px; overflow: hidden; margin: 0; color: #12324a; font-size: 21px; line-height: 1.05; letter-spacing: 0; }
      .content { display: grid; grid-template-columns: 1.45fr .75fr; gap: 24px; height: 189px; margin-top: 9px; }
      ul { height: 189px; overflow: hidden; margin: 0; padding-left: 22px; display: grid; align-content: center; gap: 13px; font-size: 14px; line-height: 1.2; }
      li::marker { color: #f0b429; }
      .visual { display: grid; place-content: center; gap: 8px; height: 189px; padding: 18px; border-radius: 6px; background: #12324a; color: #fff; text-align: center; }
      .visual span { min-width: 130px; padding: 10px 8px; border: 1px solid #5d879c; border-radius: 4px; background: #1e465f; font-size: 11px; font-weight: 700; }
      .visual span:last-child { background: #2d8c82; border-color: #2d8c82; }
      .visual b { color: #f0b429; }
      .link { height: 18px; overflow: hidden; margin: 8px 0 0; color: #176b87; font-size: 10px; font-weight: 700; }
      footer { position: absolute; inset: auto 34px 10px; border-top: 1px solid #cad6db; padding-top: 5px; color: #4d626d; font-size: 8px; }
    </style></head>
    <body><main>${slides.map((spec, index) => renderSlide(spec, locale, index)).join("")}</main></body>
  </html>`;
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const locale of Object.keys(locales)) {
    const page = await browser.newPage({ viewport: { width: 1352, height: 900 } });
    await page.setContent(pageHtml(locale), { waitUntil: "load" });
    const overflows = await page.locator(".slide").evaluateAll((elements) => elements.flatMap((slide) => {
      const slideId = slide.getAttribute("data-slide-id");
      return [...slide.querySelectorAll("h2, ul, .link")]
        .filter((element) => element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
        .map((element) => `${slideId}:${element.tagName.toLowerCase()}`);
    }));
    if (overflows.length > 0) throw new Error(`${locale} preview overflow: ${overflows.join(", ")}`);
    await page.screenshot({ path: path.join(outputDirectory, `${locale}.png`), fullPage: true });
    console.log(`${locale}: rendered ${slides.length} slides with no detected text overflow.`);
    await page.close();
  }
} finally {
  await browser.close();
}