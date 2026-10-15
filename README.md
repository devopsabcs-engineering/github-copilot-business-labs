---
title: GitHub Copilot Business Labs
description: Local bilingual learning repository for a fictitious Canadian French grant application and GitHub Copilot Business fundamentals
ms.date: 2026-10-14
ms.topic: overview
---

[Français canadien](README.fr.md)

<!-- readme-release: RLS-COPILOT-BUSINESS-2026-10-14 | 1.0.0 | 2026-10-14 -->
<!-- readme-safety: non-official, fictitious-data-only, local-only, no-official-submission, retention-duration-not-asserted -->

<!-- readme-section:purpose -->
## Purpose

This repository contains a **non-official, local prototype** of a grant
application experience. It is a learning environment, not a government
service. Use invented information only. The prototype does not create, send,
receive, assess, or decide an official application.

The repository also supports a bilingual GitHub Copilot Business fundamentals
course. The release contract is dated **2026-10-14**, has identifier
`RLS-COPILOT-BUSINESS-2026-10-14`, and is currently version
`1.0.0`. Product facts can change after that date.

<!-- readme-section:application-and-lab -->
## Application and lab

The Next.js application presents a Canadian French public-service-style
journey. A learner can check a fictitious scenario, create a local draft,
attach a fictitious PDF, review the application, simulate submission, and
advance through simulated statuses.

The application interface remains in Canadian French. The bilingual learning
entry point is `/lab`; the complete current courses are `/lab/en` and
`/lab/fr`. Each course links its exercises to the local application and keeps
the same stable module anchors when switching languages. The local prototype
is distinct from GitHub's official product documentation and from any
official grant submission process.

<!-- readme-section:prerequisites -->
## Prerequisites

Use a current Node.js and npm installation. The baseline captured on
2026-10-14 used Windows on Arm64, Node.js `v26.7.0`, npm `12.0.1`, VS Code
`1.141.0`, and Playwright `1.61.1`. The repository also uses locally installed
Playwright browsers for its full browser matrix.

The GitHub Copilot exercises require a GitHub Copilot Business seat, the
organization policies selected by the facilitator, an authenticated VS Code
session, and the GitHub Copilot extension. The extension version was not
locally discoverable when the baseline was recorded, so verify it before each
facilitated delivery.

Before discussing commercial, legal, privacy, or model terms, identify the
purchasing channel and governing agreement. GitHub-direct terms do not govern
Microsoft purchasing channels, and model-provider footnotes can impose
different conditions even when a model is visible in the client.

<!-- readme-section:installation -->
## Installation

Install the locked dependency graph from the repository root:

```bash
npm ci
```

Start the development server and open <http://localhost:3000>:

```bash
npm run dev
```

On Windows, the helper accepts optional `-HostName` and `-Port` parameters and
detects an existing project server:

```powershell
pwsh ./Start-App.ps1
```

<!-- readme-section:commands -->
## Commands

Run the documentation and release-contract checks:

```bash
npm run check:docs
npm run check:release -- --scope contract
npm run check:publication
npm run test:publication
```

Run lint, unit tests, the static export, and browser tests:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Serve an already built static export with the same server used by Playwright:

```bash
npm run serve:e2e
```

Regenerate the current presentation and PDF pairs, then validate their
rendering contract, when the source generator changes:

```bash
npm run generate:decks
npm run check:deck-render
```

The browser configuration runs `npm run build && npm run serve:e2e`
automatically. On Windows, the full helper runs lint, unit tests, build, and
E2E tests in sequence:

```powershell
pwsh ./Test-All.ps1
```

<!-- readme-section:architecture -->
## Architecture

The project uses Next.js 16, React 19, TypeScript 6, Dexie, IndexedDB, Zod,
Vitest, Playwright, and axe-core. Next.js produces a static export in `out/`.
There is no application backend, account system, authentication flow,
telemetry integration, upload endpoint, or official transmission service.

Domain schemas and state rules live under `src/lib/domaine/`. Browser storage
adapters live under `src/lib/stockage/`. Pages use the App Router under
`src/app/`, and reusable interface code lives under `src/components/`.
Playwright tests exercise the production static export rather than relying on
the development server.

<!-- readme-section:routes -->
## Routes and workflow

The current static application exposes these route families:

| Route | Purpose |
| --- | --- |
| `/` | Prototype overview and safety boundary |
| `/programme` | Fictitious program details |
| `/programme/admissibilite` | Local eligibility scenario |
| `/demandes` | Local draft dashboard and erasure control |
| `/demandes/nouvelle` | Draft creation |
| `/demandes/dossier?id=...` | Local application summary |
| `/demandes/dossier/etape/1?id=...` | Steps 1 through 5 of the local assistant |
| `/demandes/dossier/confirmation?id=...` | Simulated submission confirmation |
| `/demandes/dossier/suivi?id=...` | Simulated status tracking |
| `/aide/document-pdf` | Fictitious PDF guidance |
| `/aide/donnees-locales` | Local data guidance |
| `/aide/statuts-simules` | Simulated status guidance |
| `/accessibilite` | Accessibility scope and limits |
| `/confidentialite` | Prototype privacy notice |
| `/nous-joindre` | Non-official contact guidance |
| `/service-indisponible` | Local failure state |
| `/lab` | Bilingual learning entry point |
| `/lab/en` | English GitHub Copilot Business fundamentals lab |
| `/lab/fr` | Canadian French GitHub Copilot Business fundamentals lab |

Query-string identifiers select browser-local records. They are not server
identifiers and do not make a draft available on another browser or origin.

<!-- readme-section:local-data-and-privacy -->
## Local data and privacy

Dexie stores drafts and fictitious PDF blobs in the IndexedDB database
`portail-aide-financiere`. Data is scoped to the browser profile and exact
origin used to open the prototype. Changing device, browser, port, hostname,
or publication address can therefore show a different local data set.

Use **Effacer les données de démonstration** on `/demandes` to clear this
prototype's drafts and fictitious PDFs after confirmation. Browser settings
can also remove IndexedDB data without notice. Do not enter personal,
confidential, protected, or production information. No retention duration is
asserted for either this browser prototype or GitHub Copilot Business; consult
the current applicable service terms before a real deployment or delivery.

<!-- readme-section:static-export-and-hosting -->
## Static export and hosting

The default build exports directory indexes under `/github-copilot-business-labs`.
The intended address is <https://devopsabcs-engineering.github.io/github-copilot-business-labs/>;
preparation does not mean that this site has been published.
`scripts/serve-static-export.mjs` mounts `out/` at that same base on
`127.0.0.1:3000`, using ordinary directory indexes without RSC rewrites.
Export preparation copies only the four current decks and materializes the
flattened RSC alias files needed by ordinary static hosts. Fonts are bundled locally.

The existing domain E2E suite builds root mode with `NEXT_PUBLIC_BASE_PATH` set
to an empty string. The separate Pages suite uses the production subpath:

```bash
npm run test:pages
```

The Pages workflow accepts manual dispatch only. Build, docs, release,
publication, lint, unit, browser, and production dependency audit gates must pass.
Deployment also requires the dispatch `deploy` input and repository variable
`PAGES_RELEASE_APPROVED=true`. Keep that variable unset while approval is pending;
configure required reviewers on the `github-pages` environment before enabling it.
Only `out/` is uploaded. No workflow has been run as part of preparing this candidate.

<!-- readme-section:accessibility -->
## Accessibility

The prototype targets WCAG 2.2 Level AA principles without claiming
certification. It includes semantic headings, explicit labels, visible focus,
keyboard navigation, announced errors, reduced-motion handling, and text that
does not rely on colour alone. Automated tests use axe-core and check
horizontal overflow across desktop browser profiles and a 320-pixel viewport.

Manual keyboard, zoom, reading-order, and assistive-technology review remains
required before publication. The presentation sources also require PowerPoint
Accessibility Checker and human reading-order review before distribution.

<!-- readme-section:learning-assets -->
## Learning assets

Current release artifacts:

* [English GitHub Copilot Business fundamentals source](assets/github-copilot-business-fundamentals-en.pptx)
* [English GitHub Copilot Business fundamentals PDF](assets/github-copilot-business-fundamentals-en.pdf)
* [Canadian French GitHub Copilot Business fundamentals source](assets/github-copilot-business-fundamentals-fr-CA.pptx)
* [Canadian French GitHub Copilot Business fundamentals PDF](assets/github-copilot-business-fundamentals-fr-CA.pdf)

<!-- public-derivative: historical-pdfs-excluded -->

This is a sanitized derivative of an internal learning prototype, not a fork
or mirror of its history. Two historical source PDFs are intentionally excluded.
Internal planning, local configuration, credentials, and original Git history
are not distributed. The four current artifacts were regenerated with public
lab links; their curriculum claims retain the dated source record in the manifest.

<!-- readme-section:contributing -->
## Contributing

Keep changes focused and preserve the prototype's non-official, fictitious,
local-only boundary. Do not add a backend, authentication, telemetry, real
upload, or official submission wording without an explicit architecture and
privacy review. Preserve exact code identifiers, commands, routes, and French
UI labels when updating learning material.

Update both READMEs when shared facts change. Run `npm run check:docs`, lint,
focused tests, and the release-contract check before review. Structural parity
does not prove translation quality, so changes to either language also require
a fluent semantic review.

<!-- readme-section:freshness -->
## Freshness

Repository and GitHub Copilot product facts were checked on **2026-10-14**.
Before every release, recheck the sources and ownership rules in
[`assets/copilot-business-release-manifest.yml`](assets/copilot-business-release-manifest.yml).
Recheck pricing, AI-credit allowances and token-priced usage, purchasing
channels, model availability and provider footnotes, preview features,
feature matrices, agent limits, MCP policy, metrics coverage, and
service-specific privacy terms at the cadence assigned in that manifest.

Do not copy a dated commercial or product claim into the durable course body.
Do not add an exact retention duration until it has been verified against the
live terms that apply to the purchasing channel and service surface.

<!-- readme-section:known-caveats -->
## Known caveats

The 2026-10-14 release is checked through lint, unit tests, static export,
browser tests, deck generation and rendering, README parity, and the release
contract. A Turbopack development-server hydration failure was isolated during
Phase 1; production static-export E2E coverage passes through
`npm run build && npm run serve:e2e`. This is a test-architecture workaround,
not a claimed application-code fix.

An earlier baseline did not establish facilitator edit-and-save behaviour.
That check, presentation/PDF assistive-technology review, and fluent bilingual
review remain pending. Local tool discovery alone does not complete them.
The original production audit reported one critical and three high findings;
run `npm audit --omit=dev` against this candidate. Static hosting is not a waiver.
Dependency remediation must use the supported dependency-upgrade workflow.
No public release or deployment is approved, and no passing CI status is asserted.
