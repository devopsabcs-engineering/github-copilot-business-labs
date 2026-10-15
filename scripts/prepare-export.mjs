import { copyFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const deckNames = [
  "github-copilot-business-fundamentals-en.pptx",
  "github-copilot-business-fundamentals-en.pdf",
  "github-copilot-business-fundamentals-fr-CA.pptx",
  "github-copilot-business-fundamentals-fr-CA.pdf",
];

export async function prepareExport(output, assets) {
  await stat(path.join(output, "index.html"));
  await mkdir(path.join(output, "assets"), { recursive: true });
  const existing = await readdir(path.join(output, "assets"));
  if (existing.some((name) => !deckNames.includes(name))) {
    throw new Error("Unexpected export asset; refusing to publish an unallowlisted file.");
  }
  for (const name of deckNames) await copyFile(path.join(assets, name), path.join(output, "assets", name));

  const entries = await readdir(output, { recursive: true, withFileTypes: true });
  let aliases = 0;
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".txt")) continue;
    const source = path.join(entry.parentPath, entry.name);
    const segments = path.relative(output, source).split(path.sep);
    const marker = segments.findIndex((segment) => segment.startsWith("__next."));
    if (marker < 0 || marker === segments.length - 1) continue;
    const destination = path.join(output, ...segments.slice(0, marker), segments.slice(marker).join("."));
    const content = await readFile(source);
    try {
      const previous = await readFile(destination);
      if (!previous.equals(content)) throw new Error(`Conflicting RSC alias: ${destination}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await copyFile(source, destination);
    }
    aliases += 1;
  }
  return aliases;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const aliases = await prepareExport(path.join(root, "out"), path.join(root, "assets"));
  console.log(`Prepared four deck downloads and ${aliases} static RSC aliases.`);
}