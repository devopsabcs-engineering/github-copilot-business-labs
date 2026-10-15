import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { parse } from "yaml";

import { excludedDocuments, inspectBytes, inspectPath, inspectTree } from "./check-publication.mjs";
import { deckNames, prepareExport } from "./prepare-export.mjs";

test("reject prohibited paths, encoded names, config, secrets and renamed internal files", () => {
  for (const entry of excludedDocuments) {
    assert.throws(() => inspectPath(`assets/${entry.name}`));
    assert.throws(() => inspectPath(`renamed/${encodeURIComponent(entry.name)}`));
  }
  for (const name of [".git/config", ".vscode/settings.json", ".copilot-tracking/note.md", ".env", "key.pem", "nested/mcp.json"]) assert.throws(() => inspectPath(name));
  assert.throws(() => inspectBytes(Buffer.from(`-----BEGIN ${"PRIVATE KEY"}-----`), "renamed.txt"));
  inspectBytes(Buffer.from("public fictitious content"), "safe.txt");
});

test("export copies only four decks, writes byte-identical aliases, and rejects contamination", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "public-export-"));
  try {
    const output = path.join(root, "out");
    const assets = path.join(root, "assets");
    await mkdir(path.join(output, "lab", "en", "__next.route", "lab", "en"), { recursive: true });
    await mkdir(assets);
    await writeFile(path.join(output, "index.html"), "<!doctype html>");
    const content = "RSC public payload";
    await writeFile(path.join(output, "lab", "en", "__next.route", "lab", "en", "__PAGE__.txt"), content);
    for (const name of deckNames) await writeFile(path.join(assets, name), "current deck");
    await writeFile(path.join(assets, "not-a-current-deck.pdf"), "not copied");
    assert.equal(await prepareExport(output, assets), 1);
    assert.deepEqual((await readdir(path.join(output, "assets"))).sort(), [...deckNames].sort());
    assert.equal(await readFile(path.join(output, "lab", "en", "__next.route.lab.en.__PAGE__.txt"), "utf8"), content);
    assert.equal(await prepareExport(output, assets), 1);
    await inspectTree(output, true);
    await writeFile(path.join(output, "assets", "unexpected.pdf"), "bad");
    await assert.rejects(prepareExport(output, assets));
    await assert.rejects(inspectTree(output, true));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("workflow is manual-only, audit-gated, out-only and deployment-guarded", async () => {
  const workflow = parse(await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(workflow.on), ["workflow_dispatch"]);
  assert.deepEqual(workflow.permissions, { contents: "read" });
  assert.equal(workflow.jobs.deploy.permissions.pages, "write");
  assert.equal(workflow.jobs.deploy.permissions["id-token"], "write");
  assert.match(workflow.jobs.deploy.if, /PAGES_RELEASE_APPROVED/);
  assert.match(workflow.jobs.deploy.if, /inputs.deploy/);
  const steps = workflow.jobs.build.steps;
  assert(steps.some((step) => step.run === "npm audit --omit=dev" && !step["continue-on-error"]));
  assert.equal(steps.find((step) => step.uses?.startsWith("actions/upload-pages-artifact@")).with.path, "out");
});