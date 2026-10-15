import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { deckNames } from "./prepare-export.mjs";

export const excludedDocuments = [
  { name: "GitHub Copilot for business fundamentals - fr.pdf", sha256: "989f79f04a710dedb87bea1535e1c384a7fa3f319a540e192a931711f5fe0409", blob: "9b102a65f61486db60d20c6e1f9cbc452cd89f90" },
  { name: "GitHub Copilot for Developers Intermediate - fr.pdf", sha256: "68aa1f4c5c1af15322e1a6a75ed63077319044982468bc7c30b34ac434c02f05", blob: "d780f063d58c04b3f2a9f62bba020f72eceb2b1d" },
];
const runtimeRoots = new Set(["node_modules", ".next", "out", "test-results", "playwright-report", "coverage", "build", "next-env.d.ts"]);
const forbiddenSegments = /^(?:\.git|\.vscode|\.copilot-tracking|\.copilot|\.azure|\.env(?:\..*)?|\.npmrc|mcp\.json|node_modules|\.next|test-results|playwright-report|coverage|.*\.(?:pem|key|local|tsbuildinfo))$/i;
const internalContent = /(?:https?:\/\/[^\s"'<>]*(?:pkgs\.visualstudio\.com|dev\.azure\.com)|rq-demandes-de-subventio[n]s|MngEnvMCAP\d+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{60,})\b)/i;

export function inspectBytes(bytes, label) {
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const blob = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  if (excludedDocuments.some((entry) => entry.sha256 === sha256 || entry.blob === blob)) {
    throw new Error(`Prohibited document content: ${label}`);
  }
  if (internalContent.test(bytes.toString("utf8"))) throw new Error(`Internal content or secret signature: ${label}`);
}

export function inspectPath(name) {
  const normalized = decodeURIComponent(name).replaceAll("\\", "/");
  if (normalized.split("/").some((segment) => forbiddenSegments.test(segment)) || excludedDocuments.some((entry) => normalized.toLowerCase().split("/").includes(entry.name.toLowerCase()))) {
    throw new Error(`Prohibited publication path: ${name}`);
  }
}

function inspectLinks(bytes, name) {
  if (name === ".gitignore" || name === "scripts/check-publication.mjs") return;
  const text = bytes.toString("utf8");
  for (const entry of excludedDocuments) {
    if (text.includes(entry.name) || text.includes(encodeURIComponent(entry.name))) throw new Error(`Historical document reference: ${name}`);
  }
}

export async function inspectTree(root, artifact = false, directory = root) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll("\\", "/");
    if (!artifact && directory === root && (runtimeRoots.has(entry.name) || entry.name === ".git")) continue;
    inspectPath(relative);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not a publication candidate: ${relative}`);
    if (entry.isDirectory()) count += await inspectTree(root, artifact, absolute);
    else if (entry.isFile()) {
      const bytes = await readFile(absolute);
      inspectBytes(bytes, relative);
      inspectLinks(bytes, relative);
      if (artifact && relative.startsWith("assets/") && !deckNames.includes(relative.slice(7))) throw new Error(`Unallowlisted download: ${relative}`);
      count += 1;
    } else throw new Error(`Nonregular publication file: ${relative}`);
  }
  return count;
}

export async function inspectGit(root) {
  try { await lstat(path.join(root, ".git")); } catch (error) {
    if (error.code === "ENOENT") return "not available (no Git initialized)";
    throw error;
  }
  const git = (args, encoding = "utf8") => execFileSync("git", ["-C", root, ...args], { encoding, maxBuffer: 128 * 1024 * 1024 });
  const blobs = new Set();
  for (const record of git(["ls-files", "--stage", "-z"]).split("\0").filter(Boolean)) {
    const [header, name] = record.split("\t");
    inspectPath(name);
    if (runtimeRoots.has(name.split("/")[0])) throw new Error(`Runtime file in index: ${name}`);
    const [mode, blob] = header.split(" ");
    if (!["100644", "100755"].includes(mode)) throw new Error(`Nonregular file in index: ${name}`);
    blobs.add(blob);
    inspectLinks(git(["cat-file", "blob", blob], null), name);
  }
  for (const record of git(["rev-list", "--objects", "--all"]).split("\n").filter(Boolean)) {
    const space = record.indexOf(" ");
    const object = space < 0 ? record : record.slice(0, space);
    const name = space < 0 ? "" : record.slice(space + 1);
    if (name) inspectPath(name);
    if (excludedDocuments.some((entry) => entry.blob === object)) throw new Error(`Prohibited reachable object: ${object}`);
    if (git(["cat-file", "-t", object]).trim() === "blob") {
      if (runtimeRoots.has(name.split("/")[0])) throw new Error(`Runtime file in history: ${name}`);
      blobs.add(object);
      inspectLinks(git(["cat-file", "blob", object], null), name);
    }
  }
  for (const blob of blobs) inspectBytes(git(["cat-file", "blob", blob], null), `Git blob ${blob}`);
  return `${blobs.size} unique staged/reachable blobs checked`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const candidate = await inspectTree(root);
  let output = "not built";
  try { await lstat(path.join(root, "out")); output = `${await inspectTree(path.join(root, "out"), true)} files`; }
  catch (error) { if (error.code !== "ENOENT" || process.argv.includes("--require-out")) throw error; }
  if (output !== "not built") {
    const actual = (await readdir(path.join(root, "out", "assets"))).sort();
    if (JSON.stringify(actual) !== JSON.stringify([...deckNames].sort())) throw new Error("Export must contain exactly four current decks.");
  }
  console.log(`Publication check passed: candidate ${candidate} files; out ${output}; Git ${await inspectGit(root)}.`);
}