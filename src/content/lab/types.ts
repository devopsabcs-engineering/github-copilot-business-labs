export const LAB_ROUTE_LOCALES = ["en", "fr"] as const;

export type LabRouteLocale = (typeof LAB_ROUTE_LOCALES)[number];
export type LabContentLocale = "en-CA" | "fr-CA";

export type LabCommand = {
  id: string;
  value: string;
};

export type LabPrompt = {
  id: string;
  value: string;
};

export type LabFileReference = {
  id: string;
  path: string;
  purpose: string;
};

export type LabStep = {
  id: string;
  title: string;
  instructions: readonly string[];
  prompts: readonly LabPrompt[];
  commands: readonly LabCommand[];
  expectedResults: readonly string[];
};

export type LabCheckpoint = {
  id: string;
  title: string;
  description: string;
  validation: readonly string[];
};

export type LabTroubleshootingItem = {
  id: string;
  problem: string;
  resolution: string;
};

export type LabKnowledgeCheck = {
  id: string;
  question: string;
  answer: string;
};

export type LabModuleNavigationTarget = {
  id: string;
  label: string;
};

export type LabModule = {
  id: string;
  order: number;
  title: string;
  phase: string;
  duration: string;
  level: string;
  summary: string;
  prerequisites: readonly string[];
  objectives: readonly string[];
  files: readonly LabFileReference[];
  warnings: readonly string[];
  evidenceNotes: readonly string[];
  steps: readonly LabStep[];
  recovery: readonly string[];
  checkpoint: LabCheckpoint;
  troubleshooting: readonly LabTroubleshootingItem[];
  knowledgeChecks: readonly LabKnowledgeCheck[];
  navigation: {
    previous: LabModuleNavigationTarget | null;
    next: LabModuleNavigationTarget | null;
  };
};

export type LabGlossaryEntry = {
  id: string;
  term: string;
  definition: string;
};

export type LabApplicationLink = {
  id: string;
  href: string;
  label: string;
};

export type LabLabels = {
  moduleNavigation: string;
  languageNavigation: string;
  switchLanguage: string;
  phase: string;
  duration: string;
  level: string;
  prerequisites: string;
  objectives: string;
  files: string;
  steps: string;
  prompt: string;
  command: string;
  expectedResults: string;
  warning: string;
  evidenceNotes: string;
  recovery: string;
  checkpoint: string;
  troubleshooting: string;
  knowledgeCheck: string;
  revealAnswer: string;
  glossary: string;
  applicationLinks: string;
  previous: string;
  next: string;
  overview: string;
};

export type LabContent = {
  locale: LabContentLocale;
  routeLocale: LabRouteLocale;
  languageName: string;
  alternateLocale: LabRouteLocale;
  alternateLanguageName: string;
  title: string;
  description: string;
  eyebrow: string;
  introduction: string;
  safetyNotice: string;
  applicationLanguageNotice: string;
  applicationLinks: readonly LabApplicationLink[];
  labels: LabLabels;
  modules: readonly LabModule[];
  glossary: readonly LabGlossaryEntry[];
};