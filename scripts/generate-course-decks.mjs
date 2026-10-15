import PptxGenJS from "pptxgenjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "assets");
export const releaseDate = "2026-10-14";
export const releaseVersion = "1.0.0";
export const labBaseUrl = "https://devopsabcs-engineering.github.io/github-copilot-business-labs";

const palette = {
  navy: "12324A",
  blue: "176B87",
  teal: "2D8C82",
  mint: "DDEFE9",
  cloud: "F4F7F8",
  white: "FFFFFF",
  ink: "14232D",
  muted: "4D626D",
  amber: "F0B429",
  coral: "C8563C",
  border: "CAD6DB",
};

const shapeTypes = new PptxGenJS().ShapeType;

const claims = {
  E01: "Business is the centrally managed organization plan.",
  E02: "Enterprise requires GitHub Enterprise Cloud and includes Business features.",
  E03: "Published plan prices and AI-credit allowances are dated commercial facts.",
  E04: "Overage pricing and unlimited paid-plan completions are dated billing facts.",
  E05: "Copilot is not currently available for GitHub Enterprise Server.",
  E06: "Feature support varies by IDE and the published matrix is preview.",
  E07: "The IDE quickstart requires a plan, extension, and authenticated IDE.",
  E08: "Agent mode can choose files, make edits, and run commands subject to approval.",
  E09: "The cloud agent works asynchronously and delivers pull-request evidence.",
  E10: "Cloud-agent repository, branch, pull-request, and duration limits are dated facts.",
  E11: "Cloud-agent output requires human review and constrained permissions.",
  E12: "Model availability depends on plan and client and changes over time.",
  E13: "Automatic model selection is dynamic and considers service conditions.",
  E14: "Chat model selection does not control inline-suggestion models.",
  E15: "Organization policy governs model switching and bring-your-own-key use.",
  E16: "Customization mechanisms have distinct triggers and locations.",
  E17: "Agent skills are folders loaded on demand and follow an open standard.",
  E18: "MCP connects Copilot to external context and tools across supported surfaces.",
  E19: "Managed MCP policy defaults and subscription boundaries are volatile.",
  E20: "Seat management, not usage metrics, is the license source of truth.",
  E21: "Usage metrics cover some Copilot surfaces and exclude others.",
  E22: "Usage metrics can lag and require careful organization attribution.",
  E23: "Content exclusion is not supported in every editor mode.",
  E24: "GitHub does not own customer inputs or outputs under the cited terms.",
  E25: "GitHub-direct volume terms limit model training absent documented instruction.",
  E26: "Retention is service-specific; no exact duration is asserted.",
  E30: "Preview features can change or be discontinued.",
  E31: "Metrics accuracy can depend on current IDE and extension versions.",
  E32: "Model catalogs and retirement schedules change rapidly.",
  E36: "Seat billing begins when access is granted and mid-cycle grants are prorated.",
  E37: "Organizations support multiple documented seat-assignment workflows.",
  E38: "Enterprise policy spans agents, models, billing, privacy, features, and MCP.",
  E39: "Content exclusion has mode, semantic, symlink, and remote-filesystem limitations.",
  E40: "AI-credit conversion and paid usage are token-, model-, and policy-sensitive.",
  E41: "Responsible use requires understanding purpose, capability, and limitations.",
  E42: "Agentic output can be incorrect or insecure and requires review and testing.",
};

function localized(en, fr) {
  return { "en-CA": en, "fr-CA": fr };
}

function slide(id, group, titleEn, titleFr, bodyEn, bodyFr, options = {}) {
  return {
    id,
    group,
    titles: localized(titleEn, titleFr),
    bodies: localized(bodyEn, bodyFr),
    claims: options.claims ?? [],
    modules: options.modules ?? [],
    labAnchor: options.labAnchor,
    sourceUrl: options.sourceUrl,
    visual: options.visual ?? "cards",
    minutes: options.minutes ?? 3,
  };
}

export const slides = [
  slide("OPEN-001", "OPEN", "GitHub Copilot Business fundamentals", "Fondamentaux de GitHub Copilot Business", [
    "A governance-aware path from assistance to accountable delivery",
    `Facilitator release ${releaseVersion} | ${releaseDate}`,
  ], [
    "Une approche axée sur la gouvernance, de l'assistance à une livraison responsable",
    `Version du présentateur ${releaseVersion} | ${releaseDate}`,
  ], { modules: ["LAB-00"], visual: "hero", minutes: 2 }),
  slide("OPEN-002", "OPEN", "Audience, agenda, and learning rhythm", "Public, programme et rythme d'apprentissage", [
    "Developers, technical leads, administrators, security partners, and adoption owners",
    "Learn a durable concept, practise it in the repository, then capture evidence",
    "Allow about 3 hours plus optional cloud-agent time",
  ], [
    "Développeurs, responsables techniques, administrateurs, partenaires de sécurité et responsables de l'adoption",
    "Apprendre un concept durable, le mettre en pratique dans le dépôt, puis consigner la preuve",
    "Prévoir environ 3 heures, plus le temps facultatif pour l'agent infonuagique",
  ], { visual: "timeline", minutes: 3 }),
  slide("OPEN-003", "OPEN", "Seven outcomes, one evidence trail", "Sept résultats, une seule piste de preuves", [
    "Establish the managed boundary and select verifiable context",
    "Use completion, chat, edit, and agent workflows deliberately",
    "Delegate responsibly, customize with least privilege, and measure adoption carefully",
  ], [
    "Établir la limite gérée et choisir un contexte vérifiable",
    "Utiliser délibérément les suggestions, la conversation, la modification et le mode agent",
    "Déléguer de façon responsable, personnaliser selon le moindre privilège et mesurer l'adoption avec prudence",
  ], { visual: "outcomes", minutes: 3 }),
  slide("OPEN-004", "OPEN", "Prepare the learning environment", "Préparer l'environnement d'apprentissage", [
    "Use a current VS Code client, the Copilot extension, and the licensed GitHub account",
    "Clone this repository and install dependencies before the session",
    "Use fictitious data only; the grant prototype remains local and unofficial",
  ], [
    "Utiliser une version récente de VS Code, l'extension Copilot et le compte GitHub sous licence",
    "Cloner ce dépôt et installer les dépendances avant la séance",
    "Utiliser uniquement des données fictives; le prototype de subvention demeure local et non officiel",
  ], { claims: ["E07"], modules: ["LAB-00"], labAnchor: "lab-00", visual: "checklist", minutes: 4 }),
  slide("MBOUND-001", "MBOUND", "Plan context: capability follows managed access", "Contexte du forfait : la capacité suit l'accès géré", [
    "Business centers organization access, policy, and reporting",
    "Enterprise requires GitHub Enterprise Cloud and includes Business capabilities",
    "Copilot is not currently available for GitHub Enterprise Server; recheck before delivery",
  ], [
    "Business centre l'accès, les stratégies et les rapports de l'organisation",
    "Enterprise exige GitHub Enterprise Cloud et comprend les capacités Business",
    "Copilot n'est pas offert actuellement pour GitHub Enterprise Server; revérifier avant la séance",
  ], { claims: ["E01", "E02", "E03", "E05"], visual: "boundary", minutes: 4 }),
  slide("MBOUND-002", "MBOUND", "Start with a managed trust boundary", "Commencer par une limite de confiance gérée", [
    "Confirm the seat, organization policy, approved surfaces, and repository permission",
    "Use the smallest useful file and tool scope",
    "Keep secrets, credentials, and real applicant data outside prompts and history",
  ], [
    "Confirmer le poste, la stratégie de l'organisation, les surfaces approuvées et les permissions du dépôt",
    "Utiliser la plus petite portée utile de fichiers et d'outils",
    "Garder les secrets, les identifiants et les vraies données de demandeurs hors des requêtes et de l'historique",
  ], { modules: ["LAB-00", "LAB-01"], labAnchor: "lab-00", visual: "boundary", minutes: 5 }),
  slide("RESP-001", "RESP", "Treat every output as a hypothesis", "Traiter chaque résultat comme une hypothèse", [
    "Check correctness, security, licensing, privacy, accessibility, and organizational standards",
    "Ask for evidence, inspect the source, and run the narrowest useful validation",
    "Human approval remains at commands, workflows, merges, and deployment boundaries",
  ], [
    "Vérifier l'exactitude, la sécurité, les licences, la confidentialité, l'accessibilité et les normes de l'organisation",
    "Demander des preuves, examiner la source et exécuter la validation utile la plus ciblée",
    "L'approbation humaine demeure requise pour les commandes, les flux, les fusions et les déploiements",
  ], { claims: ["E41", "E42"], modules: ["LAB-01"], labAnchor: "lab-01", visual: "evidence", minutes: 5 }),
  slide("RESP-002", "RESP", "Prompt for a verifiable result", "Formuler une requête pour obtenir un résultat vérifiable", [
    "Goal: name the observable change",
    "Context: point to exact files, symbols, constraints, and examples",
    "Evidence: request tests, diagnostics, diffs, and stated uncertainty",
  ], [
    "Objectif : nommer le changement observable",
    "Contexte : indiquer les fichiers, symboles, contraintes et exemples exacts",
    "Preuve : demander les tests, diagnostics, différences et incertitudes déclarées",
  ], { modules: ["LAB-01", "LAB-03"], labAnchor: "lab-01", visual: "prompt", minutes: 6 }),
  slide("FLOW-001", "FLOW", "Choose the least autonomous useful mode", "Choisir le mode utile le moins autonome", [
    "Completion for local continuation; chat for explanation and options",
    "Edit for scoped changes; agent mode for iterative multi-step work",
    "Cloud agent for bounded asynchronous work reviewed through a pull request",
  ], [
    "Suggestions pour une suite locale; conversation pour les explications et les options",
    "Modification pour des changements ciblés; mode agent pour un travail itératif en plusieurs étapes",
    "Agent infonuagique pour un travail asynchrone délimité, révisé dans une demande de tirage",
  ], { claims: ["E08", "E09"], visual: "modes", minutes: 5 }),
  slide("FLOW-002", "FLOW", "Completions: keep the acceptance decision local", "Suggestions : garder la décision d'acceptation locale", [
    "Write intent in nearby code, types, tests, and names",
    "Accept only the useful portion and reject plausible-looking drift",
    "Run the focused test before expanding the change",
  ], [
    "Exprimer l'intention dans le code voisin, les types, les tests et les noms",
    "Accepter seulement la partie utile et refuser les écarts qui semblent plausibles",
    "Exécuter le test ciblé avant d'élargir le changement",
  ], { modules: ["LAB-02"], labAnchor: "lab-02", visual: "ide", minutes: 5 }),
  slide("FLOW-003", "FLOW", "Chat: explain, compare, then verify", "Conversation : expliquer, comparer, puis vérifier", [
    "Select the smallest code surface that can answer the question",
    "Ask for assumptions, alternatives, and a falsifiable check",
    "Compare the response with code, documentation, and runtime evidence",
  ], [
    "Sélectionner la plus petite surface de code pouvant répondre à la question",
    "Demander les hypothèses, les options et un contrôle réfutable",
    "Comparer la réponse au code, à la documentation et aux preuves d'exécution",
  ], { modules: ["LAB-02", "LAB-03"], labAnchor: "lab-02", visual: "ide", minutes: 5 }),
  slide("FLOW-004", "FLOW", "Edit workflow: scope before applying", "Flux de modification : délimiter avant d'appliquer", [
    "State files that may change and behavior that must remain stable",
    "Review each hunk; do not accept unrelated cleanup",
    "Compile or test the touched slice immediately",
  ], [
    "Préciser les fichiers modifiables et le comportement qui doit rester stable",
    "Réviser chaque bloc; ne pas accepter les nettoyages sans rapport",
    "Compiler ou tester immédiatement la partie touchée",
  ], { modules: ["LAB-03"], labAnchor: "lab-03", visual: "diff", minutes: 5 }),
  slide("FLOW-005", "FLOW", "Agent mode: grant tools one boundary at a time", "Mode agent : accorder les outils une limite à la fois", [
    "Describe the outcome, constraints, and stop conditions",
    "Review proposed commands and watch for scope expansion",
    "Require a clean diff and executable evidence before completion",
  ], [
    "Décrire le résultat, les contraintes et les conditions d'arrêt",
    "Réviser les commandes proposées et surveiller l'élargissement de la portée",
    "Exiger des différences propres et des preuves exécutables avant de terminer",
  ], { claims: ["E08", "E42"], modules: ["LAB-06"], labAnchor: "lab-06", visual: "agent", minutes: 6 }),
  slide("FLOW-006", "FLOW", "Cloud delegation: define a reviewable task", "Délégation infonuagique : définir une tâche révisable", [
    "Delegate bounded backlog work with acceptance criteria and repository context",
    "As of 2026-10-14, each task is limited to one repository, branch, pull request, and 59-minute session",
    "Never let asynchronous execution bypass required review or deployment gates",
  ], [
    "Déléguer un travail délimité avec des critères d'acceptation et le contexte du dépôt",
    "Au 2026-10-14, chaque tâche est limitée à un dépôt, une branche, une demande de tirage et une séance de 59 minutes",
    "Ne jamais laisser l'exécution asynchrone contourner la révision ou les contrôles de déploiement requis",
  ], { claims: ["E09", "E10", "E11"], modules: ["LAB-07"], labAnchor: "lab-07", visual: "cloud", minutes: 6 }),
  slide("FLOW-007", "FLOW", "Review loop: evidence before merge", "Boucle de révision : la preuve avant la fusion", [
    "Read the task framing, session log, commits, and full diff",
    "Run tests and security checks independently of the agent summary",
    "Record the human judgment that accepted, corrected, or rejected the work",
  ], [
    "Lire la définition de la tâche, le journal de session, les validations et toutes les différences",
    "Exécuter les tests et contrôles de sécurité indépendamment du résumé de l'agent",
    "Consigner le jugement humain ayant accepté, corrigé ou refusé le travail",
  ], { claims: ["E11", "E42"], modules: ["LAB-07", "LAB-CAP"], labAnchor: "lab-07", visual: "evidence", minutes: 5 }),
  slide("CUSTOM-001", "CUSTOM", "Customization is a layered contract", "La personnalisation est un contrat en couches", [
    "Instructions set automatic standards; prompt files package repeatable requests",
    "Custom agents specialize tools and context; skills load relevant procedures on demand",
    "Hooks run deterministic lifecycle commands; MCP connects approved external capabilities",
  ], [
    "Les instructions définissent des normes automatiques; les fichiers de requête regroupent les demandes répétables",
    "Les agents personnalisés spécialisent les outils et le contexte; les compétences chargent les procédures pertinentes au besoin",
    "Les points d'ancrage exécutent des commandes déterministes; MCP relie les capacités externes approuvées",
  ], { claims: ["E16", "E17", "E18"], modules: ["LAB-06"], labAnchor: "lab-06", visual: "stack", minutes: 6 }),
  slide("CUSTOM-002", "CUSTOM", "Instructions and prompt files make intent reviewable", "Les instructions et fichiers de requête rendent l'intention révisable", [
    "Keep organization-independent standards close to the repository",
    "Use path-specific instructions only where their scope is clear",
    "Write prompts with inputs, output shape, validation, and stop conditions",
  ], [
    "Garder les normes indépendantes de l'organisation près du dépôt",
    "Utiliser des instructions propres à un chemin seulement lorsque leur portée est claire",
    "Rédiger les requêtes avec les entrées, le format de sortie, la validation et les conditions d'arrêt",
  ], { claims: ["E16"], modules: ["LAB-06"], labAnchor: "lab-06", visual: "files", minutes: 5 }),
  slide("CUSTOM-003", "CUSTOM", "Skills and hooks separate judgment from determinism", "Les compétences et points d'ancrage séparent jugement et déterminisme", [
    "Use a skill for reusable context, process, scripts, and resources",
    "Use a hook when a command must run predictably at a lifecycle event",
    "Review both as executable supply-chain inputs",
  ], [
    "Utiliser une compétence pour le contexte, le processus, les scripts et les ressources réutilisables",
    "Utiliser un point d'ancrage lorsqu'une commande doit s'exécuter de façon prévisible à une étape du cycle",
    "Réviser les deux comme des éléments exécutables de la chaîne d'approvisionnement",
  ], { claims: ["E16", "E17"], modules: ["LAB-06"], labAnchor: "lab-06", visual: "stack", minutes: 5 }),
  slide("CUSTOM-004", "CUSTOM", "MCP: useful reach requires least privilege", "MCP : une portée utile exige le moindre privilège", [
    "Approve servers, tools, data sources, and authentication paths explicitly",
    "Managed MCP policy scope and defaults depend on how Business or Enterprise access is provided",
    "Treat returned content and tool instructions as untrusted until reviewed",
  ], [
    "Approuver explicitement les serveurs, outils, sources de données et chemins d'authentification",
    "La portée et les valeurs par défaut de la stratégie MCP gérée dépendent de la source de l'accès Business ou Enterprise",
    "Traiter le contenu retourné et les instructions d'outil comme non fiables avant révision",
  ], { claims: ["E18", "E19"], modules: ["LAB-06"], labAnchor: "lab-06", visual: "mcp", minutes: 6 }),
  slide("CUSTOM-005", "CUSTOM", "Model choice: fit, policy, cost, then validation", "Choix du modèle : adéquation, stratégie, coût, puis validation", [
    "Auto is dynamic selection, not a fixed model alias",
    "Visible models still depend on plan, policy, client, rollout, and provider-specific terms",
    "Organization permission governs model switching and bring-your-own-key use",
  ], [
    "La sélection automatique est dynamique et ne désigne pas un modèle fixe",
    "Les modèles visibles dépendent encore du forfait, de la stratégie, du client, du déploiement et des conditions du fournisseur",
    "La stratégie d'organisation régit le changement de modèle et l'utilisation de clés personnelles",
  ], { claims: ["E12", "E13", "E14", "E15"], visual: "decision", minutes: 5 }),
  slide("ADOPT-001", "ADOPT", "Administration sets the usable boundary", "L'administration définit la limite d'utilisation", [
    "Billing begins when access is granted; mid-cycle grants are prorated",
    "Assignment workflows and enterprise policy scope vary by plan, access source, and delegated control",
    "Govern agents, models, AI-credit budgets, privacy, features, and MCP without assuming uniform defaults",
  ], [
    "La facturation commence à l'attribution de l'accès; les attributions en cours de cycle sont calculées au prorata",
    "Les méthodes d'attribution et la portée des stratégies d'entreprise varient selon le forfait, la source d'accès et la délégation",
    "Régir les agents, les modèles, les budgets de crédits IA, la confidentialité, les fonctionnalités et MCP sans présumer de valeurs uniformes",
  ], { claims: ["E19", "E20", "E30", "E36", "E37", "E38", "E40"], visual: "admin", minutes: 6 }),
  slide("ADOPT-002", "ADOPT", "Content exclusion is a partial control", "L'exclusion de contenu est un contrôle partiel", [
    "Coverage varies by feature and client; editor Edit and Agent modes have limitations",
    "Excluded semantics can still be exposed indirectly by allowed content",
    "Keep access control, secret management, scanning, and developer judgment in place",
  ], [
    "La couverture varie selon la fonctionnalité et le client; les modes Modification et Agent ont des limites",
    "Le contenu permis peut révéler indirectement la sémantique exclue",
    "Conserver les contrôles d'accès, la gestion des secrets, l'analyse et le jugement des développeurs",
  ], { claims: ["E23", "E39"], modules: ["LAB-05"], labAnchor: "lab-05", visual: "boundary", minutes: 6 }),
  slide("ADOPT-003", "ADOPT", "Metrics guide questions, not causal claims", "Les mesures orientent les questions, pas les liens de causalité", [
    "Coverage includes selected IDE, CLI, and agent activity, not every Copilot surface",
    "Allow two full UTC days and verify organization attribution and current client telemetry",
    "The 2026-10-06 incident confirms that affected historical agent activity cannot be backfilled",
  ], [
    "La couverture comprend certaines activités dans les EDI, l'interface de ligne de commande et les agents, mais pas toutes les surfaces Copilot",
    "Prévoir deux jours UTC complets et vérifier l'attribution par organisation ainsi que la télémétrie des clients à jour",
    "L'incident du 2026-10-06 confirme que l'activité historique touchée des agents ne peut pas être reconstituée",
  ], { claims: ["E20", "E21", "E22", "E31"], modules: ["LAB-07"], labAnchor: "lab-07", visual: "metrics", minutes: 6 }),
  slide("LAB-00", "LAB", "Lab 00 | Establish the managed trust boundary", "Laboratoire 00 | Établir la limite de confiance gérée", [
    "Inspect the local-only data boundary and permanent safety notice",
    "Run the focused bilingual foundation tests",
    "Checkpoint: state safe context and prohibited data",
  ], [
    "Examiner la limite des données locales et l'avis de sécurité permanent",
    "Exécuter les tests ciblés de la fondation bilingue",
    "Point de contrôle : nommer le contexte sûr et les données interdites",
  ], { modules: ["LAB-00"], labAnchor: "lab-00", visual: "lab", minutes: 15 }),
  slide("LAB-01", "LAB", "Lab 01 | Give Copilot verifiable repository context", "Laboratoire 01 | Fournir un contexte de dépôt vérifiable", [
    "Select exact files and ask for a source-grounded explanation",
    "Separate observed facts from assumptions",
    "Checkpoint: every material statement has a code or documentation anchor",
  ], [
    "Sélectionner les fichiers exacts et demander une explication fondée sur la source",
    "Distinguer les faits observés des hypothèses",
    "Point de contrôle : chaque affirmation importante possède un repère dans le code ou la documentation",
  ], { modules: ["LAB-01"], labAnchor: "lab-01", visual: "lab", minutes: 20 }),
  slide("LAB-02", "LAB", "Lab 02 | Use completion and chat for focused tests", "Laboratoire 02 | Utiliser les suggestions et la conversation pour des tests ciblés", [
    "Use nearby types and tests to shape a bounded suggestion",
    "Compare chat guidance with the real implementation",
    "Checkpoint: focused tests pass and unsupported changes are rejected",
  ], [
    "Utiliser les types et tests voisins pour encadrer une suggestion",
    "Comparer les conseils de la conversation à l'implémentation réelle",
    "Point de contrôle : les tests ciblés réussissent et les changements non fondés sont refusés",
  ], { modules: ["LAB-02"], labAnchor: "lab-02", visual: "lab", minutes: 20 }),
  slide("LAB-03", "LAB", "Lab 03 | Plan and validate a small refactoring", "Laboratoire 03 | Planifier et valider une petite restructuration", [
    "Define invariants and allowed files before editing",
    "Review the plan and each applied hunk",
    "Checkpoint: behavior remains stable under focused validation",
  ], [
    "Définir les invariants et les fichiers permis avant la modification",
    "Réviser le plan et chaque bloc appliqué",
    "Point de contrôle : le comportement demeure stable sous validation ciblée",
  ], { modules: ["LAB-03"], labAnchor: "lab-03", visual: "lab", minutes: 25 }),
  slide("LAB-04", "LAB", "Lab 04 | Generate an accessible browser test", "Laboratoire 04 | Générer un test de navigateur accessible", [
    "Ask for keyboard, semantic, and narrow-viewport evidence",
    "Inspect selectors for user-facing meaning rather than implementation detail",
    "Checkpoint: the test fails for the intended defect and passes after correction",
  ], [
    "Demander des preuves au clavier, sémantiques et sur écran étroit",
    "Examiner les sélecteurs selon le sens pour l'utilisateur plutôt que le détail d'implémentation",
    "Point de contrôle : le test échoue pour le défaut visé et réussit après correction",
  ], { modules: ["LAB-04"], labAnchor: "lab-04", visual: "lab", minutes: 25 }),
  slide("LAB-05", "LAB", "Lab 05 | Review privacy and local file behaviour", "Laboratoire 05 | Réviser la confidentialité et le traitement local des fichiers", [
    "Trace PDF selection and IndexedDB behavior without real applicant data",
    "Challenge overbroad claims about exclusion or retention",
    "Checkpoint: privacy statements match code and current first-party terms",
  ], [
    "Suivre la sélection de PDF et IndexedDB sans données réelles de demandeurs",
    "Remettre en question les affirmations trop larges sur l'exclusion ou la conservation",
    "Point de contrôle : les énoncés de confidentialité correspondent au code et aux modalités actuelles de première partie",
  ], { claims: ["E24", "E25", "E26"], modules: ["LAB-05"], labAnchor: "lab-05", visual: "lab", minutes: 25 }),
  slide("LAB-06", "LAB", "Lab 06 | Use agent mode with explicit guardrails", "Laboratoire 06 | Utiliser le mode agent avec des garde-fous explicites", [
    "Set file, command, and stop boundaries before execution",
    "Approve tools incrementally and inspect every change",
    "Checkpoint: evidence is complete without scope expansion",
  ], [
    "Définir les limites de fichiers, de commandes et d'arrêt avant l'exécution",
    "Approuver les outils progressivement et examiner chaque changement",
    "Point de contrôle : la preuve est complète sans élargissement de la portée",
  ], { claims: ["E08", "E42"], modules: ["LAB-06"], labAnchor: "lab-06", visual: "lab", minutes: 30 }),
  slide("LAB-07", "LAB", "Lab 07 | Delegate, review, and measure responsibly", "Laboratoire 07 | Déléguer, réviser et mesurer de façon responsable", [
    "Use the mock walkthrough when cloud agent access is unavailable",
    "Review task framing, session evidence, pull-request changes, and checks",
    "Checkpoint: propose one enablement action and one guardrail from the evidence",
  ], [
    "Utiliser la simulation lorsque l'agent infonuagique n'est pas accessible",
    "Réviser la tâche, les preuves de session, les changements de la demande de tirage et les contrôles",
    "Point de contrôle : proposer une action d'accompagnement et un garde-fou à partir des preuves",
  ], { claims: ["E09", "E11", "E22"], modules: ["LAB-07"], labAnchor: "lab-07", visual: "lab", minutes: 30 }),
  slide("LAB-CAP", "LAB", "Capstone | From prompt to reviewed evidence", "Projet synthèse | De la requête à la preuve révisée", [
    "Frame one small issue with constraints and acceptance criteria",
    "Produce a reviewed change, tests, security checks, and relevant customization",
    "Reflect on what required human judgment and what evidence supports completion",
  ], [
    "Définir un petit enjeu avec contraintes et critères d'acceptation",
    "Produire un changement révisé, des tests, des contrôles de sécurité et une personnalisation pertinente",
    "Expliquer ce qui a exigé un jugement humain et quelles preuves appuient l'achèvement",
  ], { modules: ["LAB-CAP"], labAnchor: "lab-cap", visual: "capstone", minutes: 35 }),
  slide("APPX-001", "APPX", `Dated appendix | Plans and commercial context (${releaseDate})`, `Annexe datée | Forfaits et contexte commercial (${releaseDate})`, [
    "Business: $19 USD per granted seat per month; 1,900 AI credits per user per month",
    "Enterprise: $39 USD per granted seat per month; 3,900 credits; pooled allowances do not roll over",
    "Additional usage: $0.01 USD per token-priced AI credit; paid completions remain unlimited; verify the purchasing channel",
  ], [
    "Business : 19 $ US par poste attribué par mois; 1 900 crédits IA par utilisateur par mois",
    "Enterprise : 39 $ US par poste attribué par mois; 3 900 crédits; les allocations regroupées ne sont pas reportées",
    "Utilisation supplémentaire : 0,01 $ US par crédit IA calculé selon les jetons; suggestions payantes illimitées; vérifier le canal d'achat",
  ], { claims: ["E03", "E04", "E40"], sourceUrl: "https://docs.github.com/en/copilot/get-started/plans", visual: "volatile", minutes: 3 }),
  slide("APPX-002", "APPX", `Dated appendix | Feature and model volatility (${releaseDate})`, `Annexe datée | Volatilité des fonctionnalités et modèles (${releaseDate})`, [
    "IDE support, model availability, previews, and cloud-agent limits can change",
    "Use live feature, model, retirement, and provider-footnote references on delivery day",
    "No exact retention duration is asserted; verify the service, purchasing channel, provider, and contract",
  ], [
    "La prise en charge des EDI, les modèles, les aperçus et les limites de l'agent infonuagique peuvent changer",
    "Consulter les références actuelles sur les fonctionnalités, les modèles, les retraits et les notes des fournisseurs le jour de la séance",
    "Aucune durée exacte de conservation n'est affirmée; vérifier le service, le canal d'achat, le fournisseur et le contrat",
  ], { claims: ["E06", "E10", "E12", "E26", "E30", "E32"], sourceUrl: "https://docs.github.com/en/copilot/reference/copilot-feature-matrix", visual: "volatile", minutes: 3 }),
  slide("APPX-003", "APPX", "References and freshness ownership", "Références et responsabilité de l'actualité", [
    "Course owner: plans, capabilities, and preview status before every release",
    "Security and privacy owners: exclusions, agents, terms, Trust Center, and retention before delivery",
    "Adoption owner: metrics coverage, lag, attribution, and client requirements before reporting",
  ], [
    "Responsable du cours : forfaits, capacités et aperçus avant chaque version",
    "Responsables de la sécurité et de la confidentialité : exclusions, agents, modalités, Centre de confiance et conservation avant la séance",
    "Responsable de l'adoption : couverture, délai, attribution et exigences clientes avant les rapports",
  ], { claims: ["E20", "E21", "E22", "E26", "E31"], sourceUrl: "https://docs.github.com/en/copilot", visual: "references", minutes: 3 }),
];

export const locales = {
  "en-CA": {
    fileStem: "github-copilot-business-fundamentals-en",
    localeLabel: "English (Canada)",
    facilitator: "Facilitator notes",
    heroEyebrow: "BUSINESS · EVIDENCE · RESPONSIBILITY",
    claimLabel: "Sources",
    labLabel: "Open lab module",
    transition: "Connect this concept to the next workflow and ask for one concrete example.",
    learnerAction: "Ask learners to state the decision, evidence, or boundary they will carry forward.",
    fallback: "If the live product surface is unavailable, use the visual on this slide and the repository lab walkthrough.",
    recovery: "Pause, restate the boundary, and return to the last verified source or passing check.",
    timingLabel: "Timing",
    transitionLabel: "Transition",
    prerequisitesLabel: "Live-demo prerequisites",
    prerequisites: "Current client, authenticated licensed account, permitted policy, and fictitious repository data.",
    fallbackLabel: "Fallback",
    learnerActionLabel: "Expected learner action",
    recoveryLabel: "Recovery",
    linkLabel: "Link",
    noClaim: "No external product claim on this slide.",
    noLink: "none",
  },
  "fr-CA": {
    fileStem: "github-copilot-business-fundamentals-fr-CA",
    localeLabel: "Français (Canada)",
    facilitator: "Notes du présentateur",
    heroEyebrow: "ENTREPRISE · PREUVE · RESPONSABILITÉ",
    claimLabel: "Sources",
    labLabel: "Ouvrir le module",
    transition: "Relier ce concept au prochain flux de travail et demander un exemple concret.",
    learnerAction: "Demander aux participants de nommer la décision, la preuve ou la limite à conserver.",
    fallback: "Si la surface du produit n'est pas accessible, utiliser le visuel de cette diapositive et la simulation du laboratoire.",
    recovery: "Faire une pause, reformuler la limite et revenir à la dernière source vérifiée ou au dernier contrôle réussi.",
    timingLabel: "Durée",
    transitionLabel: "Transition",
    prerequisitesLabel: "Préalables de la démonstration en direct",
    prerequisites: "Client à jour, compte sous licence authentifié, stratégie permissive et données fictives du dépôt.",
    fallbackLabel: "Solution de rechange",
    learnerActionLabel: "Action attendue des participants",
    recoveryLabel: "Récupération",
    linkLabel: "Lien",
    noClaim: "Aucune affirmation externe sur le produit dans cette diapositive.",
    noLink: "aucun",
  },
};

function addText(slideObject, text, options) {
  slideObject.addText(text, {
    fontFace: "Aptos",
    color: palette.ink,
    margin: 0,
    breakLine: false,
    fit: "shrink",
    ...options,
  });
}

function addFooter(slideObject, spec, copy, index) {
  slideObject.addShape(shapeTypes.line, {
    x: 0.65,
    y: 6.92,
    w: 12.02,
    h: 0,
    line: { color: palette.border, width: 1 },
  });
  addText(slideObject, spec.id, {
    x: 0.68,
    y: 7.03,
    w: 2.1,
    h: 0.2,
    fontSize: 9,
    bold: true,
    color: palette.navy,
    altText: `Stable slide identifier ${spec.id}`,
  });
  addText(slideObject, `${copy.localeLabel} | ${releaseDate} | ${index + 1}/${slides.length}`, {
    x: 9.4,
    y: 7.03,
    w: 3.25,
    h: 0.2,
    fontSize: 9,
    color: palette.muted,
    align: "right",
  });
}

function addVisual(slideObject, spec, locale) {
  const x = 7.95;
  const y = 1.62;
  const labels = spec.visual === "evidence"
    ? localized(["SOURCE", "DIFF", "TEST"], ["SOURCE", "DIFFÉRENCES", "TEST"])[locale]
    : spec.visual === "modes"
      ? localized(["COMPLETE", "CHAT", "EDIT", "AGENT"], ["SUGGÉRER", "DISCUTER", "MODIFIER", "AGENT"])[locale]
      : spec.visual === "metrics"
        ? localized(["ADOPTION", "TRUST", "FLOW"], ["ADOPTION", "CONFIANCE", "FLUX"])[locale]
        : spec.visual === "boundary"
          ? localized(["ACCESS", "CONTEXT", "REVIEW"], ["ACCÈS", "CONTEXTE", "RÉVISION"])[locale]
          : localized(["CONTEXT", "ACT", "VERIFY"], ["CONTEXTE", "AGIR", "VÉRIFIER"])[locale];

  slideObject.addShape(shapeTypes.roundRect, {
    x,
    y,
    w: 4.65,
    h: 4.58,
    rectRadius: 0.08,
    fill: { color: palette.navy },
    line: { color: palette.navy },
    altText: `${spec.titles[locale]} visual evidence: ${labels.join(", ")}`,
  });
  addText(slideObject, spec.group, {
    x: x + 0.32,
    y: y + 0.28,
    w: 3.9,
    h: 0.28,
    fontSize: 11,
    bold: true,
    color: palette.mint,
    charSpacing: 1.3,
  });
  labels.forEach((label, labelIndex) => {
    const blockY = y + 0.9 + labelIndex * (labels.length === 4 ? 0.78 : 1.02);
    slideObject.addShape(shapeTypes.roundRect, {
      x: x + 0.36,
      y: blockY,
      w: 3.85,
      h: labels.length === 4 ? 0.56 : 0.72,
      rectRadius: 0.04,
      fill: { color: labelIndex === labels.length - 1 ? palette.teal : "1E465F" },
      line: { color: labelIndex === labels.length - 1 ? palette.teal : "376078", width: 1 },
    });
    addText(slideObject, label, {
      x: x + 0.58,
      y: blockY + (labels.length === 4 ? 0.16 : 0.22),
      w: 3.4,
      h: 0.24,
      fontSize: labels.length === 4 ? 11 : 12,
      bold: true,
      color: palette.white,
      align: "center",
    });
    if (labelIndex < labels.length - 1) {
      addText(slideObject, "↓", {
        x: x + 2.07,
        y: blockY + (labels.length === 4 ? 0.55 : 0.7),
        w: 0.45,
        h: 0.27,
        fontSize: 15,
        bold: true,
        color: palette.amber,
        align: "center",
      });
    }
  });
}

function addHero(slideObject, spec, locale, copy) {
  slideObject.background = { color: palette.cloud };
  slideObject.addShape(shapeTypes.rect, {
    x: 0,
    y: 0,
    w: 0.38,
    h: 7.5,
    fill: { color: palette.teal },
    line: { color: palette.teal },
  });
  addText(slideObject, copy.heroEyebrow, {
    x: 0.9,
    y: 0.75,
    w: 7.8,
    h: 0.32,
    fontSize: 13,
    bold: true,
    color: palette.blue,
    charSpacing: 1.1,
  });
  addText(slideObject, spec.titles[locale], {
    x: 0.86,
    y: 1.4,
    w: 10.7,
    h: 1.45,
    fontFace: "Aptos Display",
    fontSize: 38,
    bold: true,
    color: palette.navy,
    altText: `Slide title: ${spec.titles[locale]}`,
  });
  addText(slideObject, spec.bodies[locale][0], {
    x: 0.9,
    y: 3.2,
    w: 9.7,
    h: 0.75,
    fontSize: 22,
    color: palette.muted,
  });
  slideObject.addShape(shapeTypes.line, {
    x: 0.9,
    y: 4.48,
    w: 7.8,
    h: 0,
    line: { color: palette.amber, width: 4 },
  });
  addText(slideObject, spec.bodies[locale][1], {
    x: 0.9,
    y: 4.78,
    w: 6.8,
    h: 0.38,
    fontSize: 14,
    color: palette.muted,
  });
}

function addContentSlide(slideObject, spec, locale, copy) {
  slideObject.background = { color: palette.white };
  slideObject.addShape(shapeTypes.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.12,
    fill: { color: spec.group === "APPX" ? palette.amber : palette.teal },
    line: { color: spec.group === "APPX" ? palette.amber : palette.teal },
  });
  addText(slideObject, spec.group, {
    x: 0.72,
    y: 0.42,
    w: 1.4,
    h: 0.24,
    fontSize: 10,
    bold: true,
    color: palette.blue,
    charSpacing: 1.1,
  });
  addText(slideObject, spec.titles[locale], {
    x: 0.7,
    y: 0.74,
    w: 11.9,
    h: 0.7,
    fontFace: "Aptos Display",
    fontSize: 27,
    bold: true,
    color: palette.navy,
    altText: `Slide title: ${spec.titles[locale]}`,
  });

  spec.bodies[locale].forEach((text, bodyIndex) => {
    const bodyY = 1.78 + bodyIndex * 1.28;
    slideObject.addShape(shapeTypes.ellipse, {
      x: 0.78,
      y: bodyY + 0.05,
      w: 0.27,
      h: 0.27,
      fill: { color: bodyIndex === 2 ? palette.teal : palette.amber },
      line: { color: bodyIndex === 2 ? palette.teal : palette.amber },
    });
    addText(slideObject, text, {
      x: 1.22,
      y: bodyY,
      w: 6.25,
      h: 0.78,
      fontSize: 18,
      color: palette.ink,
      breakLine: false,
      valign: "mid",
    });
  });

  addVisual(slideObject, spec, locale);

  const linkUrl = spec.labAnchor
    ? `${labBaseUrl}/lab/${locale === "en-CA" ? "en" : "fr"}/#${spec.labAnchor}`
    : spec.sourceUrl;
  if (linkUrl) {
    addText(slideObject, spec.labAnchor ? `${copy.labLabel}: /lab/${locale === "en-CA" ? "en" : "fr"}#${spec.labAnchor}` : linkUrl, {
      x: 0.8,
      y: 5.98,
      w: 6.7,
      h: 0.34,
      fontSize: 11,
      bold: true,
      color: palette.blue,
      hyperlink: { url: linkUrl },
      underline: { color: palette.blue },
      altText: spec.labAnchor ? `Lab link ${linkUrl}` : `Source link ${linkUrl}`,
    });
  }
  if (spec.claims.length > 0) {
    addText(slideObject, `${copy.claimLabel}: ${spec.claims.join(", ")}`, {
      x: 0.8,
      y: 6.42,
      w: 6.7,
      h: 0.25,
      fontSize: 9,
      color: palette.muted,
    });
  }
}

function notesFor(spec, locale, copy) {
  const sourceNotes = spec.claims.length > 0
    ? `${copy.claimLabel}: ${spec.claims.map((id) => `${id} - ${claims[id]}`).join(" ")}`
    : `${copy.claimLabel}: ${copy.noClaim}`;
  const labNote = spec.labAnchor
    ? `${copy.linkLabel}: ${labBaseUrl}/lab/${locale === "en-CA" ? "en" : "fr"}/#${spec.labAnchor}.`
    : `${copy.linkLabel}: ${copy.noLink}.`;
  return [
    `[${spec.id}] ${copy.facilitator}`,
    `${copy.timingLabel}: ${spec.minutes} minutes.`,
    sourceNotes,
    `${copy.transitionLabel}: ${copy.transition}`,
    `${copy.prerequisitesLabel}: ${copy.prerequisites}`,
    `${copy.fallbackLabel}: ${copy.fallback}`,
    `${copy.learnerActionLabel}: ${copy.learnerAction}`,
    `${copy.recoveryLabel}: ${copy.recovery}`,
    labNote,
  ].join("\n");
}

async function generatePptx(locale, copy) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "GitHub Copilot Business Fundamentals contributors";
  pptx.company = "devopsabcs-engineering";
  pptx.subject = `Governance-aware GitHub Copilot Business course, ${releaseDate}`;
  pptx.title = slides[0].titles[locale];
  pptx.lang = locale;
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: locale,
  };
  pptx.defineSlideMaster({
    title: "COURSE_MASTER",
    background: { color: palette.white },
    objects: [],
    slideNumber: { x: 12.2, y: 7.02, w: 0.5, h: 0.2, fontFace: "Aptos", fontSize: 9, color: palette.muted },
  });

  slides.forEach((spec, index) => {
    const slideObject = pptx.addSlide("COURSE_MASTER");
    if (spec.visual === "hero") addHero(slideObject, spec, locale, copy);
    else addContentSlide(slideObject, spec, locale, copy);
    addFooter(slideObject, spec, copy, index);
    slideObject.addNotes(notesFor(spec, locale, copy));
  });

  await pptx.writeFile({ fileName: path.join(outputDirectory, `${copy.fileStem}.pptx`) });
}

function toWinAnsi(character) {
  const special = new Map([
    ["’", 0x92], ["‘", 0x91], ["“", 0x93], ["”", 0x94],
    ["–", 0x96], ["—", 0x97], ["œ", 0x9c], ["Œ", 0x8c],
    ["…", 0x85], ["•", 0x95],
  ]);
  if (special.has(character)) return special.get(character);
  const code = character.codePointAt(0);
  return code <= 0xff ? code : 0x3f;
}

function pdfLiteral(text) {
  return [...text].map((character) => {
    const code = toWinAnsi(character);
    if (code === 0x28 || code === 0x29 || code === 0x5c) return `\\${String.fromCharCode(code)}`;
    if (code < 0x20 || code > 0x7e) return `\\${code.toString(8).padStart(3, "0")}`;
    return String.fromCharCode(code);
  }).join("");
}

function wrapText(text, width) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textCommands(text, x, y, size, options = {}) {
  const lines = Array.isArray(text) ? text : [text];
  const leading = options.leading ?? size * 1.28;
  const font = options.bold ? "/F2" : "/F1";
  const color = options.color ?? "0.08 0.14 0.18";
  return lines.map((line, index) => (
    `BT ${color} rg ${font} ${size} Tf 1 0 0 1 ${x} ${y - index * leading} Tm (${pdfLiteral(line)}) Tj ET`
  )).join("\n");
}

function pdfDate(date) {
  return `D:${date.replaceAll("-", "")}000000Z`;
}

async function generatePdf(locale, copy) {
  const objects = [];
  const reserve = () => { objects.push(null); return objects.length; };
  const set = (id, value) => { objects[id - 1] = value; };
  const catalogId = reserve();
  const pagesId = reserve();
  const fontId = reserve();
  const boldFontId = reserve();
  const infoId = reserve();
  const outlinesId = reserve();
  const structTreeId = reserve();
  const parentTreeId = reserve();
  const pageRecords = slides.map(() => ({
    pageId: reserve(),
    contentId: reserve(),
    annotationId: reserve(),
    outlineId: reserve(),
    structureId: reserve(),
  }));

  set(fontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  set(boldFontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  slides.forEach((spec, index) => {
    const record = pageRecords[index];
    const bodyLines = spec.bodies[locale].flatMap((item) => wrapText(item, 58).map((line, lineIndex) => `${lineIndex === 0 ? "• " : "  "}${line}`));
    const titleLines = wrapText(spec.titles[locale], 58);
    const linkUrl = spec.labAnchor
      ? `${labBaseUrl}/lab/${locale === "en-CA" ? "en" : "fr"}/#${spec.labAnchor}`
      : spec.sourceUrl;
    const linkText = spec.labAnchor
      ? `/lab/${locale === "en-CA" ? "en" : "fr"}#${spec.labAnchor}`
      : spec.sourceUrl ?? "";
    const stream = [
      `/P <</MCID 0>> BDC`,
      "0.07 0.2 0.29 rg 0 532 960 8 re f",
      textCommands(spec.group, 52, 500, 10, { bold: true, color: "0.09 0.42 0.53" }),
      textCommands(titleLines, 52, 466, 23, { bold: true, leading: 27 }),
      textCommands(bodyLines, 72, 365, 15, { leading: 25 }),
      spec.claims.length > 0 ? textCommands(`${copy.claimLabel}: ${spec.claims.join(", ")}`, 52, 70, 9, { color: "0.30 0.38 0.43" }) : "",
      linkText ? textCommands(linkText, 52, 48, 10, { bold: true, color: "0.09 0.42 0.53" }) : "",
      textCommands(`${spec.id} | ${copy.localeLabel} | ${releaseDate} | ${index + 1}/${slides.length}`, 52, 24, 8, { color: "0.30 0.38 0.43" }),
      "EMC",
    ].filter(Boolean).join("\n");
    set(record.contentId, `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`);

    const annotation = linkUrl
      ? `<< /Type /Annot /Subtype /Link /Rect [48 38 620 62] /Border [0 0 0] /A << /S /URI /URI (${pdfLiteral(linkUrl)}) >> /Contents (${pdfLiteral(linkText)}) >>`
      : "<< /Type /Annot /Subtype /Link /Rect [0 0 0 0] /Border [0 0 0] /A << /S /URI /URI (https://docs.github.com/en/copilot) >> >>";
    set(record.annotationId, annotation);
    set(record.pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 960 540] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${record.contentId} 0 R /Annots [${record.annotationId} 0 R] /StructParents ${index} /Tabs /S >>`);
    set(record.structureId, `<< /Type /StructElem /S /Sect /P ${structTreeId} 0 R /Pg ${record.pageId} 0 R /K 0 /T (${pdfLiteral(spec.titles[locale])}) /Lang (${locale}) >>`);
    const previous = index > 0 ? `/Prev ${pageRecords[index - 1].outlineId} 0 R` : "";
    const next = index < slides.length - 1 ? `/Next ${pageRecords[index + 1].outlineId} 0 R` : "";
    set(record.outlineId, `<< /Title (${pdfLiteral(`${spec.id} | ${spec.titles[locale]}`)}) /Parent ${outlinesId} 0 R ${previous} ${next} /Dest [${record.pageId} 0 R /Fit] >>`);
  });

  set(pagesId, `<< /Type /Pages /Count ${slides.length} /Kids [${pageRecords.map((record) => `${record.pageId} 0 R`).join(" ")}] >>`);
  set(outlinesId, `<< /Type /Outlines /First ${pageRecords[0].outlineId} 0 R /Last ${pageRecords.at(-1).outlineId} 0 R /Count ${slides.length} >>`);
  set(parentTreeId, `<< /Nums [${pageRecords.map((record, index) => `${index} [${record.structureId} 0 R]`).join(" ")}] >>`);
  set(structTreeId, `<< /Type /StructTreeRoot /K [${pageRecords.map((record) => `${record.structureId} 0 R`).join(" ")}] /ParentTree ${parentTreeId} 0 R /ParentTreeNextKey ${slides.length} >>`);
  set(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R /Outlines ${outlinesId} 0 R /PageMode /UseOutlines /Lang (${locale}) /MarkInfo << /Marked true >> /StructTreeRoot ${structTreeId} 0 R /ViewerPreferences << /DisplayDocTitle true >> >>`);
  set(infoId, `<< /Title (${pdfLiteral(slides[0].titles[locale])}) /Author (GitHub Copilot Business Fundamentals contributors) /Subject (${pdfLiteral(`Governance-aware course, ${releaseDate}`)}) /Keywords (GitHub Copilot Business, governance, lab, ${locale}) /Creator (generate-course-decks.mjs) /Producer (Node.js deterministic PDF writer) /CreationDate (${pdfDate(releaseDate)}) /ModDate (${pdfDate(releaseDate)}) >>`);

  const chunks = [Buffer.from("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets = [0];
  let currentOffset = chunks[0].length;
  objects.forEach((object, index) => {
    offsets[index + 1] = currentOffset;
    const chunk = Buffer.from(`${index + 1} 0 obj\n${object}\nendobj\n`, "binary");
    chunks.push(chunk);
    currentOffset += chunk.length;
  });
  const xrefOffset = currentOffset;
  const xref = [
    `xref\n0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>`,
    `startxref\n${xrefOffset}\n%%EOF\n`,
  ].join("\n");
  chunks.push(Buffer.from(xref, "ascii"));
  await writeFile(path.join(outputDirectory, `${copy.fileStem}.pdf`), Buffer.concat(chunks));
}

const isDirectInvocation = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectInvocation) {
  await mkdir(outputDirectory, { recursive: true });
  for (const [locale, copy] of Object.entries(locales)) {
    await generatePptx(locale, copy);
    await generatePdf(locale, copy);
  }

  console.log(`Generated ${slides.length} aligned slides in PPTX and PDF for ${Object.keys(locales).length} locales.`);
}