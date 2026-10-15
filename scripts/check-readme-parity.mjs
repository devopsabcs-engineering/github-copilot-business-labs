import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = parse(
  await readFile(
    path.join(root, "assets", "copilot-business-release-manifest.yml"),
    "utf8",
  ),
);
const packageJson = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
const failures = [];
const safetyKeys = [
  "non-official",
  "fictitious-data-only",
  "local-only",
  "no-official-submission",
  "retention-duration-not-asserted",
];
const requiredCommands = [
  "npm ci",
  "npm run dev",
  "pwsh ./Start-App.ps1",
  "npm run check:docs",
  "npm run check:release -- --scope contract",
  "npm run lint",
  "npm run test",
  "npm run build",
  "npm run test:e2e",
  "npm run serve:e2e",
  "npm run generate:decks",
  "npm run check:deck-render",
  "pwsh ./Test-All.ps1",
];
const requiredRoutes = [
  "/",
  "/programme",
  "/programme/admissibilite",
  "/demandes",
  "/demandes/nouvelle",
  "/demandes/dossier?id=...",
  "/demandes/dossier/etape/1?id=...",
  "/demandes/dossier/confirmation?id=...",
  "/demandes/dossier/suivi?id=...",
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
const routeSources = [
  "src/app/page.tsx",
  "src/app/programme/page.tsx",
  "src/app/programme/admissibilite/page.tsx",
  "src/app/demandes/page.tsx",
  "src/app/demandes/nouvelle/page.tsx",
  "src/app/demandes/dossier/page.tsx",
  "src/app/demandes/dossier/etape/[numero]/page.tsx",
  "src/app/demandes/dossier/confirmation/page.tsx",
  "src/app/demandes/dossier/suivi/page.tsx",
  "src/app/aide/document-pdf/page.tsx",
  "src/app/aide/donnees-locales/page.tsx",
  "src/app/aide/statuts-simules/page.tsx",
  "src/app/accessibilite/page.tsx",
  "src/app/confidentialite/page.tsx",
  "src/app/nous-joindre/page.tsx",
  "src/app/service-indisponible/page.tsx",
  "src/app/lab/page.tsx",
  "src/app/lab/[locale]/page.tsx",
];
const currentAssetPaths = [
  ...manifest.artifacts
    .filter((artifact) =>
      artifact.status === "current" &&
      ["pptx-source", "generated-pdf"].includes(artifact.kind),
    )
    .map((artifact) => artifact.path),
];
const documents = [
  { path: "README.md", reciprocal: "README.fr.md" },
  { path: "README.fr.md", reciprocal: "README.md" },
];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extractFrontmatter(content, documentPath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert(Boolean(match), `${documentPath} requires YAML frontmatter.`);
  if (!match) return {};

  try {
    return parse(match[1]);
  } catch (error) {
    failures.push(`${documentPath} has invalid YAML frontmatter: ${error.message}`);
    return {};
  }
}

function extractMarkers(content, expression) {
  return [...content.matchAll(expression)].map((match) => match[1].trim());
}

function extractCommands(content) {
  const commands = [];
  for (const fence of content.matchAll(
    /^```(?:bash|powershell)\r?\n([\s\S]*?)^```/gm,
  )) {
    for (const line of fence[1].split(/\r?\n/)) {
      const command = line.trim();
      if (/^(?:npm|pwsh)\b/.test(command)) commands.push(command);
    }
  }
  return commands;
}

function extractLocalLinks(content) {
  return [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1].split("#", 1)[0])
    .filter(
      (target) =>
        target.length > 0 &&
        !target.startsWith("http://") &&
        !target.startsWith("https://") &&
        !target.startsWith("mailto:"),
    );
}

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

const reports = [];
for (const command of requiredCommands.filter((value) =>
  value.startsWith("npm run "),
)) {
  const scriptName = command.slice("npm run ".length).split(" ", 1)[0];
  assert(
    typeof packageJson.scripts?.[scriptName] === "string",
    `Documented npm script is not registered in package.json: ${scriptName}.`,
  );
}
for (const routeSource of routeSources) {
  assert(
    await pathExists(path.join(root, routeSource)),
    `Documented route source does not exist: ${routeSource}.`,
  );
}

for (const document of documents) {
  const absolutePath = path.join(root, document.path);
  const content = await readFile(absolutePath, "utf8");
  const frontmatter = extractFrontmatter(content, document.path);
  const sectionKeys = extractMarkers(
    content,
    /<!--\s*readme-section:([a-z0-9-]+)\s*-->/g,
  );
  const safetyMarker = content.match(/<!--\s*readme-safety:\s*([^>]+?)\s*-->/);
  const safetyValues = safetyMarker
    ? safetyMarker[1].split(",").map((value) => value.trim())
    : [];
  const releaseMarker = content.match(/<!--\s*readme-release:\s*([^>]+?)\s*-->/);
  const expectedRelease = [
    manifest.release.id,
    manifest.release.version,
    String(manifest.release.date),
  ].join(" | ");
  const commands = extractCommands(content);
  const links = extractLocalLinks(content);

  assert(frontmatter.title, `${document.path} frontmatter requires title.`);
  assert(
    frontmatter.description,
    `${document.path} frontmatter requires description.`,
  );
  assert(
    String(frontmatter["ms.date"]) === String(manifest.release.date),
    `${document.path} ms.date must match ${manifest.release.date}.`,
  );
  assert(
    !/^#\s+/m.test(content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")),
    `${document.path} must not add an H1 when frontmatter provides the title.`,
  );
  assert(!/\bTODO\b/i.test(content), `${document.path} must not contain TODO text.`);
  assert(
    JSON.stringify(sectionKeys) ===
      JSON.stringify(manifest.release.readmeSectionKeys),
    `${document.path} section markers must exactly match the manifest order: ${manifest.release.readmeSectionKeys.join(", ")}.`,
  );
  assert(
    new Set(sectionKeys).size === sectionKeys.length,
    `${document.path} section markers must be unique.`,
  );
  assert(
    safetyKeys.every((key) => safetyValues.includes(key)),
    `${document.path} is missing one or more safety markers: ${safetyKeys.join(", ")}.`,
  );
  assert(
    releaseMarker?.[1].trim() === expectedRelease,
    `${document.path} release marker must be: ${expectedRelease}.`,
  );
  assert(
    links.includes(document.reciprocal),
    `${document.path} must link to ${document.reciprocal}.`,
  );
  for (const command of requiredCommands) {
    assert(
      commands.includes(command),
      `${document.path} is missing fenced command: ${command}.`,
    );
  }
  for (const route of requiredRoutes) {
    assert(
      content.includes(`\`${route}\``),
      `${document.path} is missing route: ${route}.`,
    );
  }
  for (const assetPath of currentAssetPaths) {
    assert(
      links.some((link) => decodeURIComponent(link) === assetPath),
      `${document.path} must link to current release asset: ${assetPath}.`,
    );
  }
  assert(content.includes("<!-- public-derivative: historical-pdfs-excluded -->"), `${document.path} must disclose the historical PDF exclusion.`);
  assert(!links.some((link) => decodeURIComponent(link).startsWith("assets/GitHub Copilot")), `${document.path} must not link to historical source PDFs.`);
  for (const link of links) {
    const decoded = decodeURIComponent(link);
    const target = path.resolve(path.dirname(absolutePath), decoded);
    assert(
      target === root || target.startsWith(`${root}${path.sep}`),
      `${document.path} link escapes the repository: ${link}.`,
    );
    assert(
      await pathExists(target),
      `${document.path} local link does not exist: ${link}.`,
    );
  }

  reports.push({ ...document, commands, sectionKeys });
}

assert(
  JSON.stringify(reports[0].commands) === JSON.stringify(reports[1].commands),
  "README fenced commands must match in content and order.",
);
assert(
  JSON.stringify(reports[0].sectionKeys) ===
    JSON.stringify(reports[1].sectionKeys),
  "README section-key order must match between locales.",
);

if (failures.length > 0) {
  console.error(`README parity validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `README parity validation passed: ${reports.length} locales, ${reports[0].sectionKeys.length} sections, ${reports[0].commands.length} commands, ${requiredRoutes.length} routes.`,
);
console.log(
  "Structural parity passed. Fluent English and Canadian French review remains a human gate.",
);