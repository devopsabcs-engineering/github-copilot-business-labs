import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import unzipper from "unzipper";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "assets", "copilot-business-release-manifest.yml");
const requestedScope = process.argv.includes("--scope")
  ? process.argv[process.argv.indexOf("--scope") + 1]
  : "contract";
const failures = [];
const publicUrl = "https://devopsabcs-engineering.github.io/github-copilot-business-labs";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/github-copilot-business-labs";
const routeHref = (route) => `${basePath}${route === "/" ? "/" : `${route}${basePath ? "/" : ""}`}`;

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function uniqueIds(items, label) {
  assert(Array.isArray(items) && items.length > 0, `${label} must be a non-empty array.`);
  if (!Array.isArray(items)) return new Set();
  const ids = items.map((item) => item?.id);
  assert(ids.every((id) => typeof id === "string" && id.length > 0), `${label} entries require IDs.`);
  assert(new Set(ids).size === ids.length, `${label} IDs must be unique.`);
  return new Set(ids);
}

function requiredFields(items, fields, label) {
  for (const item of items ?? []) {
    for (const field of fields) {
      assert(item?.[field] !== undefined && item?.[field] !== "", `${label} ${item?.id ?? "<unknown>"} requires ${field}.`);
    }
  }
}

function xmlText(xml) {
  return [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
    .map((match) => match[1])
    .join(" ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"');
}

async function inspectPptx(artifact, slideRecords, release) {
  const absolutePath = path.join(root, artifact.path);
  const archive = await unzipper.Open.file(absolutePath);
  const slideFiles = archive.files
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.path))
    .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
  const noteFiles = archive.files
    .filter((entry) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(entry.path))
    .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
  assert(slideFiles.length === slideRecords.length, `${artifact.id} must contain ${slideRecords.length} slides.`);
  assert(noteFiles.length === slideRecords.length, `${artifact.id} must contain speaker notes for every slide.`);

  const locale = artifact.locale;
  const routeLocale = locale === "en-CA" ? "en" : "fr";
  const titles = [];
  for (let index = 0; index < slideFiles.length; index += 1) {
    const slideXml = (await slideFiles[index].buffer()).toString("utf8");
    const text = xmlText(slideXml);
    const expected = slideRecords[index];
    assert(text.includes(expected.id), `${artifact.id} slide ${index + 1} is missing ${expected.id}.`);
    assert(text.includes(expected.titles[locale]), `${artifact.id} slide ${index + 1} is missing its localized title.`);
    const notes = xmlText((await noteFiles[index].buffer()).toString("utf8"));
    assert(notes.includes(expected.id), `${artifact.id} notes ${index + 1} are missing ${expected.id}.`);
    for (const claimId of expected.claims ?? []) {
      assert(notes.includes(claimId), `${artifact.id} notes ${index + 1} are missing claim ${claimId}.`);
    }
    for (const match of slideXml.matchAll(/<a:off x="(\d+)" y="(\d+)"\/><a:ext cx="(\d+)" cy="(\d+)"\/>/g)) {
      const [, x, y, width, height] = match.map(Number);
      assert(x + width <= 12192000, `${artifact.id} slide ${index + 1} contains an object beyond the 16:9 width.`);
      assert(y + height <= 6858000, `${artifact.id} slide ${index + 1} contains an object beyond the 16:9 height.`);
    }
    titles.push(expected.titles[locale]);
  }
  assert(new Set(titles).size === titles.length, `${artifact.id} slide titles must be unique.`);
  const presentationText = (await Promise.all(slideFiles.map(async (entry) => xmlText((await entry.buffer()).toString("utf8"))))).join("\n");
  assert(presentationText.includes(release.version), `${artifact.id} must include release version ${release.version}.`);
  assert(presentationText.includes(String(release.date)), `${artifact.id} must include release date ${release.date}.`);
  const relationshipText = (await Promise.all(
    archive.files
      .filter((entry) => /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(entry.path))
      .map(async (entry) => (await entry.buffer()).toString("utf8")),
  )).join("\n");
  for (const moduleId of ["LAB-00", "LAB-01", "LAB-02", "LAB-03", "LAB-04", "LAB-05", "LAB-06", "LAB-07", "LAB-CAP"]) {
    const anchor = moduleId.toLowerCase();
    assert(
      relationshipText.includes(`${publicUrl}/lab/${routeLocale}/#${anchor}`),
      `${artifact.id} must link to /lab/${routeLocale}#${anchor}.`,
    );
  }
}

async function inspectPdf(artifact, slideRecords, release) {
  const absolutePath = path.join(root, artifact.path);
  const buffer = await readFile(absolutePath);
  const source = buffer.toString("latin1");
  const pageCount = [...source.matchAll(/\/Type \/Page\b/g)].length;
  assert(buffer.subarray(0, 8).toString("ascii") === "%PDF-1.7", `${artifact.id} must be a PDF 1.7 file.`);
  assert(pageCount === slideRecords.length, `${artifact.id} must contain ${slideRecords.length} pages, found ${pageCount}.`);
  assert(source.includes(`/Lang (${artifact.locale})`), `${artifact.id} must declare document language ${artifact.locale}.`);
  assert(source.includes("/StructTreeRoot"), `${artifact.id} must include a structure tree.`);
  assert(source.includes("/MarkInfo << /Marked true >>"), `${artifact.id} must identify marked content.`);
  assert(source.includes("/Type /Outlines"), `${artifact.id} must include bookmarks.`);
  assert(source.includes("/Subtype /Link"), `${artifact.id} must include link annotations.`);
  assert(source.includes("/S /URI"), `${artifact.id} must include URI actions.`);
  assert(source.includes("/Title ("), `${artifact.id} must include title metadata.`);
  assert(source.includes(`/CreationDate (${`D:${release.date.replaceAll("-", "")}000000Z`})`), `${artifact.id} must use the release date in metadata.`);
  assert([...source.matchAll(/\bBT\b/g)].length >= slideRecords.length, `${artifact.id} must contain extractable text operators.`);
  for (const slide of slideRecords) assert(source.includes(slide.id), `${artifact.id} is missing page identifier ${slide.id}.`);
  const routeLocale = artifact.locale === "en-CA" ? "en" : "fr";
  for (const moduleId of ["LAB-00", "LAB-01", "LAB-02", "LAB-03", "LAB-04", "LAB-05", "LAB-06", "LAB-07", "LAB-CAP"]) {
    const anchor = moduleId.toLowerCase();
    assert(
      source.includes(`${publicUrl}/lab/${routeLocale}/#${anchor}`),
      `${artifact.id} must link to /lab/${routeLocale}#${anchor}.`,
    );
  }
}

async function exists(absolutePath) {
  try {
    await stat(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function staticRoutePath(route) {
  const normalized = route === "/" ? "index" : route.replace(/^\//, "").replace(/\/$/, "");
  const candidates = [
    path.join(root, "out", `${normalized}.html`),
    path.join(root, "out", normalized, "index.html"),
  ];
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

async function inspectStaticLinks(moduleIds) {
  const requiredRoutes = [
    "/",
    "/programme",
    "/programme/admissibilite",
    "/demandes",
    "/aide/document-pdf",
    "/confidentialite",
    "/accessibilite",
    "/lab",
    "/lab/en",
    "/lab/fr",
  ];
  for (const route of requiredRoutes) {
    assert(Boolean(await staticRoutePath(route)), `Built static output is missing route ${route}.`);
  }

  for (const locale of ["en", "fr"]) {
    const route = `/lab/${locale}`;
    const routePath = await staticRoutePath(route);
    if (!routePath) continue;
    const html = await readFile(routePath, "utf8");
    for (const moduleId of moduleIds) {
      const anchor = moduleId.toLowerCase();
      assert(html.includes(`id="${anchor}"`), `${route} is missing anchor #${anchor}.`);
      assert(html.includes(`href="#${anchor}"`), `${route} is missing navigation link #${anchor}.`);
    }
    const alternate = locale === "en" ? "fr" : "en";
    assert(html.includes(`${routeHref(`/lab/${alternate}`)}#lab-00`), `${route} is missing its locale-switch anchor.`);
    for (const applicationRoute of ["/", "/programme/admissibilite", "/demandes", "/aide/document-pdf", "/confidentialite", "/accessibilite"]) {
      assert(html.includes(`href="${routeHref(applicationRoute)}"`), `${route} is missing application link ${applicationRoute}.`);
    }
  }

  const homePath = await staticRoutePath("/");
  if (homePath) {
    const homeHtml = await readFile(homePath, "utf8");
    assert(homeHtml.includes(`href="${routeHref("/lab")}"`), "Built global navigation must link to /lab.");
  }
}

assert(["all", "contract", "deck", "links"].includes(requestedScope), `Unsupported scope: ${requestedScope}.`);

const manifest = parse(await readFile(manifestPath, "utf8"));
for (const section of ["release", "testedEnvironment", "curriculum", "labPrototype", "slides", "terminology", "claims", "claimDispositions", "artifacts", "validation"]) {
  assert(manifest?.[section] !== undefined, `Missing required section: ${section}.`);
}

assert(Array.isArray(manifest.release?.locales) && manifest.release.locales.length === 2, "Release must declare two locales.");
assert(new Set(manifest.release?.locales).size === manifest.release?.locales.length, "Release locales must be unique.");
assert(Array.isArray(manifest.release?.readmeSectionKeys) && manifest.release.readmeSectionKeys.length > 0, "README section keys must be declared.");
assert(new Set(manifest.release?.readmeSectionKeys).size === manifest.release?.readmeSectionKeys.length, "README section keys must be unique.");

const outcomeIds = uniqueIds(manifest.curriculum?.conceptualOutcomes, "Conceptual outcomes");
const moduleIds = uniqueIds(manifest.curriculum?.modules, "Curriculum modules");
const slideIds = uniqueIds(manifest.slides, "Slides");
uniqueIds(manifest.terminology, "Terminology");
const claimIds = uniqueIds(manifest.claims, "Claims");
const dispositionIds = uniqueIds(manifest.claimDispositions, "Claim dispositions");
uniqueIds(manifest.artifacts, "Artifacts");
uniqueIds([...(manifest.validation?.automated ?? []), ...(manifest.validation?.manual ?? []), manifest.validation?.contract].filter(Boolean), "Validation records");

assert(outcomeIds.size === 7, "Exactly seven conceptual outcomes are required.");
assert(moduleIds.size === 9, "Eight lab modules plus one capstone are required.");
assert(claimIds.size === 42 && [...claimIds].every((id, index) => id === `E${String(index + 1).padStart(2, "0")}`), "Claims E01 through E42 are required without gaps.");
assert(dispositionIds.size === claimIds.size && [...claimIds].every((id) => dispositionIds.has(id)), "Every claim requires exactly one disposition.");

requiredFields(manifest.claims, ["statement", "classification", "volatility", "source", "accessed", "owner", "recheck"], "Claim");
requiredFields(manifest.artifacts, ["kind", "path", "status", "requiredNow"], "Artifact");
requiredFields(manifest.slides, ["modules", "titles", "claims"], "Slide");
requiredFields(manifest.terminology, manifest.release?.locales ?? [], "Terminology");

const labPrototype = manifest.labPrototype;
assert(typeof labPrototype?.id === "string" && labPrototype.id.length > 0, "Lab prototype requires an ID.");
assert(moduleIds.has(labPrototype?.module), `Lab prototype maps unknown module ${labPrototype?.module}.`);
assert(outcomeIds.has(labPrototype?.outcome), `Lab prototype maps unknown outcome ${labPrototype?.outcome}.`);
for (const locale of manifest.release?.locales ?? []) {
  assert(typeof labPrototype?.content?.[locale]?.title === "string" && labPrototype.content[locale].title.length > 0, `Lab prototype requires title ${locale}.`);
  assert(typeof labPrototype?.content?.[locale]?.objective === "string" && labPrototype.content[locale].objective.length > 0, `Lab prototype requires objective ${locale}.`);
}
assert(
  Object.keys(labPrototype?.content ?? {}).length === (manifest.release?.locales?.length ?? 0),
  "Lab prototype content must match the declared release locales.",
);

for (const module of manifest.curriculum?.modules ?? []) {
  assert(Array.isArray(module.outcomes) && module.outcomes.length > 0, `Module ${module.id} requires outcome mappings.`);
  for (const outcome of module.outcomes ?? []) assert(outcomeIds.has(outcome), `Module ${module.id} maps unknown outcome ${outcome}.`);
}
for (const slide of manifest.slides ?? []) {
  for (const locale of manifest.release?.locales ?? []) assert(typeof slide.titles?.[locale] === "string", `Slide ${slide.id} requires title ${locale}.`);
  for (const moduleId of slide.modules ?? []) assert(moduleIds.has(moduleId), `Slide ${slide.id} maps unknown module ${moduleId}.`);
  for (const claimId of slide.claims ?? []) assert(claimIds.has(claimId), `Slide ${slide.id} maps unknown claim ${claimId}.`);
}
const mappedClaimIds = new Set((manifest.slides ?? []).flatMap((slide) => slide.claims ?? []));
for (const disposition of manifest.claimDispositions ?? []) {
  assert(["slide", "lab", "facilitator-only", "source-only"].includes(disposition.disposition), `Claim ${disposition.id} has unsupported disposition ${disposition.disposition}.`);
  if (disposition.disposition === "slide") {
    assert(mappedClaimIds.has(disposition.id), `Slide claim ${disposition.id} must be mapped to at least one stable slide ID.`);
  } else {
    assert(!mappedClaimIds.has(disposition.id), `Non-slide claim ${disposition.id} must not be mapped to a slide.`);
    assert(typeof disposition.rationale === "string" && disposition.rationale.length >= 20, `Non-slide claim ${disposition.id} requires a material rationale.`);
  }
}
for (const claimId of mappedClaimIds) {
  assert(manifest.claimDispositions?.find((item) => item.id === claimId)?.disposition === "slide", `Mapped claim ${claimId} must have slide disposition.`);
}
assert(manifest.release?.presentation?.slideCount === manifest.slides?.length, "Presentation slide count must match the slide manifest.");
assert(manifest.release?.presentation?.aspectRatio === "16:9", "Presentation aspect ratio must remain 16:9.");

const paths = new Set();
for (const artifact of manifest.artifacts ?? []) {
  assert(!path.isAbsolute(artifact.path), `Artifact ${artifact.id} path must be repository-relative.`);
  assert(!paths.has(artifact.path), `Artifact path must be unique: ${artifact.path}.`);
  paths.add(artifact.path);
  const present = await exists(path.join(root, artifact.path));
  assert(!artifact.requiredNow || present, `Required artifact is missing: ${artifact.path}.`);
  assert(artifact.requiredNow || artifact.status === "planned" || present, `Absent artifact ${artifact.id} must be planned.`);
  if (artifact.status === "current") {
    assert(artifact.requiredNow === true, `Current artifact ${artifact.id} must be required now.`);
    assert(artifact.releaseId === manifest.release.id, `Current artifact ${artifact.id} must declare release ID ${manifest.release.id}.`);
    assert(artifact.releaseVersion === manifest.release.version, `Current artifact ${artifact.id} must declare release version ${manifest.release.version}.`);
    assert(String(artifact.releaseDate) === String(manifest.release.date), `Current artifact ${artifact.id} must declare release date ${manifest.release.date}.`);
  }
}

assert(!manifest.artifacts?.some((artifact) => artifact.kind === "historical-pdf"), "Public manifest must not require historical documents.");
assert(manifest.release?.historicalPdfPolicy === "excluded-from-public-derivative", "Historical source PDFs must remain excluded.");

for (const artifact of manifest.artifacts?.filter((item) => item.kind === "pptx-source" && item.requiredNow) ?? []) {
  if (await exists(path.join(root, artifact.path))) await inspectPptx(artifact, manifest.slides, manifest.release);
}
for (const artifact of manifest.artifacts?.filter((item) => item.kind === "generated-pdf" && item.requiredNow) ?? []) {
  if (await exists(path.join(root, artifact.path))) await inspectPdf(artifact, manifest.slides, manifest.release);
}

assert(manifest.release?.hosting?.status === "prepared-not-deployed", "Hosting preparation must not claim deployment.");
assert(manifest.release?.hosting?.releaseApproval === "pending", "Public release approval must remain pending.");
assert(manifest.release?.status === "released", "The final Phase 6 release status must be released.");
assert(manifest.release?.facilitatorEditing?.status === "pending-manual-validation", "Facilitator editing must remain pending until manually observed.");
assert(manifest.release?.retentionDurationPolicy === "excluded-until-live-verification", "Exact retention duration must remain excluded.");
assert(
  manifest.testedEnvironment?.baseline?.hydrationDisposition === "turbopack-dev-server-failure-isolated-by-production-static-export-e2e-workaround-not-application-code-fix",
  "Hydration disposition must describe the production static-export E2E workaround without claiming an application-code fix.",
);

if (["all", "links"].includes(requestedScope)) {
  await inspectStaticLinks(moduleIds);
}
assert(
  manifest.testedEnvironment?.baseline?.hydrationValidationCommand === "npm run build && npm run serve:e2e",
  "Hydration validation command must match the Playwright production static-export server path.",
);

if (failures.length > 0) {
  console.error(`Release contract validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Release contract validation passed: ${moduleIds.size} modules, ${slideIds.size} slides, ${claimIds.size} claims, ${manifest.artifacts.length} artifacts.`);