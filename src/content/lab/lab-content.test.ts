import { describe, expect, it } from "vitest";

import {
  getLabContent,
  LAB_CONTENT_BY_LOCALE,
  LAB_ROUTE_LOCALES,
  type LabContent,
} from ".";

function stableContract(content: LabContent) {
  return {
    applicationLinks: content.applicationLinks.map(({ id, href }) => ({ id, href })),
    modules: content.modules.map((module) => ({
      id: module.id,
      order: module.order,
      fileIds: module.files.map((file) => file.id),
      filePaths: module.files.map((file) => file.path),
      stepIds: module.steps.map((step) => step.id),
      promptIds: module.steps.flatMap((step) =>
        step.prompts.map((prompt) => prompt.id),
      ),
      commands: module.steps.flatMap((step) =>
        step.commands.map((command) => ({ id: command.id, value: command.value })),
      ),
      checkpointId: module.checkpoint.id,
      troubleshootingIds: module.troubleshooting.map((item) => item.id),
      knowledgeCheckIds: module.knowledgeChecks.map((item) => item.id),
      navigation: {
        previous: module.navigation.previous?.id ?? null,
        next: module.navigation.next?.id ?? null,
      },
    })),
  };
}

describe("lab content contract", () => {
  it("exposes only the statically supported locales", () => {
    expect(LAB_ROUTE_LOCALES).toEqual(["en", "fr"]);
    expect(getLabContent("en")?.locale).toBe("en-CA");
    expect(getLabContent("fr")?.locale).toBe("fr-CA");
    expect(getLabContent("es")).toBeUndefined();
  });

  it("keeps stable IDs, file references, commands, and navigation aligned", () => {
    expect(stableContract(LAB_CONTENT_BY_LOCALE.fr)).toEqual(
      stableContract(LAB_CONTENT_BY_LOCALE.en),
    );
  });

  it("includes the complete release-contract curriculum and required grammar", () => {
    for (const content of Object.values(LAB_CONTENT_BY_LOCALE)) {
      expect(content.modules.map((module) => module.id)).toEqual([
        "LAB-00",
        "LAB-01",
        "LAB-02",
        "LAB-03",
        "LAB-04",
        "LAB-05",
        "LAB-06",
        "LAB-07",
        "LAB-CAP",
      ]);
      for (const lesson of content.modules) {
        expect(lesson.title).toBeTruthy();
        expect(lesson.phase).toBeTruthy();
        expect(lesson.duration).toBeTruthy();
        expect(lesson.level).toBeTruthy();
        expect(lesson.summary).toBeTruthy();
        expect(lesson.prerequisites).not.toHaveLength(0);
        expect(lesson.objectives).not.toHaveLength(0);
        expect(lesson.files).not.toHaveLength(0);
        expect(lesson.warnings).not.toHaveLength(0);
        expect(lesson.evidenceNotes).not.toHaveLength(0);
        expect(lesson.steps).not.toHaveLength(0);
        expect(lesson.recovery).not.toHaveLength(0);
        expect(lesson.checkpoint.validation).not.toHaveLength(0);
        expect(lesson.troubleshooting).not.toHaveLength(0);
        expect(lesson.knowledgeChecks).not.toHaveLength(0);
        for (const step of lesson.steps) {
          expect(step.title).toBeTruthy();
          expect(step.instructions).not.toHaveLength(0);
          expect(step.expectedResults).not.toHaveLength(0);
          expect(step.prompts.length + step.commands.length).toBeGreaterThan(0);
        }
      }
      expect(content.modules[0].steps[1].commands[0].value).toBe(
        "npm run test -- lab-content fundamentals-lab",
      );
      expect(content.modules[4].steps[1].commands[0].value).toBe(
        'npm run test:e2e -- --project=chromium --grep "questions incomplètes"',
      );
      expect(content.modules[8].steps[1].commands.map(({ value }) => value)).toEqual([
        "npm run lint",
        "npm run test",
        "npm run build",
        "npm run test:e2e -- --project=chromium",
      ]);
    }
  });

  it("preserves mandatory local-only safety guidance in both languages", () => {
    expect(LAB_CONTENT_BY_LOCALE.en.safetyNotice).toMatch(
      /fictitious information/i,
    );
    expect(LAB_CONTENT_BY_LOCALE.fr.safetyNotice).toMatch(
      /renseignements fictifs/i,
    );
    expect(LAB_CONTENT_BY_LOCALE.en.applicationLanguageNotice).toContain(
      "Canadian French",
    );
    expect(LAB_CONTENT_BY_LOCALE.fr.applicationLanguageNotice).toContain(
      "français canadien",
    );
    expect(JSON.stringify(LAB_CONTENT_BY_LOCALE.en)).toMatch(/does not upload/i);
    expect(JSON.stringify(LAB_CONTENT_BY_LOCALE.fr)).toMatch(/ne téléverse pas/i);
    expect(JSON.stringify(LAB_CONTENT_BY_LOCALE.en)).not.toMatch(
      /retention (?:is|for) \d/i,
    );
  });
});