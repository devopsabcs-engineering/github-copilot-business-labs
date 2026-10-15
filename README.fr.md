---
title: Laboratoires GitHub Copilot Business
description: Dépôt d'apprentissage bilingue et local pour une demande de subvention fictive et les fondamentaux de GitHub Copilot Business
ms.date: 2026-10-14
ms.topic: overview
---

[English](README.md)

<!-- readme-release: RLS-COPILOT-BUSINESS-2026-10-14 | 1.0.0 | 2026-10-14 -->
<!-- readme-safety: non-official, fictitious-data-only, local-only, no-official-submission, retention-duration-not-asserted -->

<!-- readme-section:purpose -->
## Objectif

Ce dépôt contient un **prototype local et non officiel** d'un parcours de
demande de subvention. Il s'agit d'un environnement d'apprentissage, et non
d'un service gouvernemental. Utilisez seulement des renseignements inventés.
Le prototype ne crée, ne transmet, ne reçoit, n'analyse et ne décide aucune
demande officielle.

Le dépôt soutient aussi une formation bilingue sur les fondamentaux de GitHub
Copilot Business. La date du contrat de version est le **2026-10-14**; son
identifiant est `RLS-COPILOT-BUSINESS-2026-10-14` et sa version actuelle est
`1.0.0`. Les faits sur le produit peuvent changer après cette date.

<!-- readme-section:application-and-lab -->
## Application et laboratoire

L'application Next.js propose un parcours de service public en français
canadien. Une personne peut vérifier un scénario fictif, créer un brouillon
local, joindre un PDF fictif, réviser la demande, simuler sa transmission et
faire progresser des statuts simulés.

L'interface de l'application demeure en français canadien. Le point d'entrée
bilingue de la formation est `/lab`; les cours complets actuels sont `/lab/en`
et `/lab/fr`. Chaque cours relie ses exercices à l'application locale et
conserve les mêmes ancres de module lors du changement de langue. Le prototype
local se distingue de la documentation officielle de GitHub et de tout
processus officiel de demande de subvention.

<!-- readme-section:prerequisites -->
## Préalables

Utilisez une installation à jour de Node.js et de npm. La configuration de
référence consignée le 2026-10-14 utilisait Windows sur Arm64, Node.js
`v26.7.0`, npm `12.0.1`, VS Code `1.141.0` et Playwright `1.61.1`. Le dépôt
utilise aussi les navigateurs Playwright installés localement pour sa matrice
complète.

Les exercices GitHub Copilot exigent une licence GitHub Copilot Business, les
stratégies d'organisation choisies par la personne responsable de la
formation, une session VS Code authentifiée et l'extension GitHub Copilot. La
version de l'extension n'était pas repérable localement au moment de saisir la
référence; vérifiez-la avant chaque prestation de la formation.

Avant de présenter des conditions commerciales, juridiques, de confidentialité
ou de modèles, déterminez le canal d'achat et l'accord applicable. Les
conditions directes de GitHub ne régissent pas les canaux d'achat de Microsoft,
et les notes propres aux fournisseurs de modèles peuvent imposer des
conditions différentes même lorsqu'un modèle est visible dans le client.

<!-- readme-section:installation -->
## Installation

Installez le graphe de dépendances verrouillé à partir de la racine du dépôt :

```bash
npm ci
```

Démarrez le serveur de développement, puis ouvrez
<http://localhost:3000> :

```bash
npm run dev
```

Sous Windows, le script accepte les paramètres facultatifs `-HostName` et
`-Port` et détecte un serveur du projet déjà actif :

```powershell
pwsh ./Start-App.ps1
```

<!-- readme-section:commands -->
## Commandes

Exécutez les vérifications de la documentation et du contrat de version :

```bash
npm run check:docs
npm run check:release -- --scope contract
npm run check:publication
npm run test:publication
```

Exécutez l'analyse statique, les tests unitaires, l'exportation statique et les
tests de navigateur :

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Servez une exportation statique déjà construite avec le même serveur que
Playwright :

```bash
npm run serve:e2e
```

Régénérez les paires actuelles de présentations et de PDF, puis validez leur
contrat de rendu lorsque le générateur source change :

```bash
npm run generate:decks
npm run check:deck-render
```

La configuration de navigateur exécute automatiquement
`npm run build && npm run serve:e2e`. Sous Windows, le script complet lance
l'analyse statique, les tests unitaires, la construction et les tests E2E en
séquence :

```powershell
pwsh ./Test-All.ps1
```

<!-- readme-section:architecture -->
## Architecture

Le projet utilise Next.js 16, React 19, TypeScript 6, Dexie, IndexedDB, Zod,
Vitest, Playwright et axe-core. Next.js produit une exportation statique dans
`out/`. Il n'y a aucun serveur applicatif, système de comptes, parcours
d'authentification, mécanisme de télémétrie, point de téléversement ou service
de transmission officielle.

Les schémas du domaine et les règles d'état se trouvent sous
`src/lib/domaine/`. Les adaptateurs de stockage du navigateur se trouvent sous
`src/lib/stockage/`. Les pages utilisent l'App Router sous `src/app/`, tandis
que les composants réutilisables résident sous `src/components/`. Les tests
Playwright exercent l'exportation statique de production plutôt que de
dépendre du serveur de développement.

<!-- readme-section:routes -->
## Routes et parcours

L'application statique actuelle expose les familles de routes suivantes :

| Route | Rôle |
| --- | --- |
| `/` | Aperçu du prototype et limite de sécurité |
| `/programme` | Détails du programme fictif |
| `/programme/admissibilite` | Scénario local d'admissibilité |
| `/demandes` | Tableau des brouillons locaux et commande d'effacement |
| `/demandes/nouvelle` | Création d'un brouillon |
| `/demandes/dossier?id=...` | Sommaire local de la demande |
| `/demandes/dossier/etape/1?id=...` | Étapes 1 à 5 de l'assistant local |
| `/demandes/dossier/confirmation?id=...` | Confirmation de transmission simulée |
| `/demandes/dossier/suivi?id=...` | Suivi des statuts simulés |
| `/aide/document-pdf` | Aide sur le PDF fictif |
| `/aide/donnees-locales` | Aide sur les données locales |
| `/aide/statuts-simules` | Aide sur les statuts simulés |
| `/accessibilite` | Portée et limites d'accessibilité |
| `/confidentialite` | Avis de confidentialité du prototype |
| `/nous-joindre` | Aide de contact non officielle |
| `/service-indisponible` | État de défaillance locale |
| `/lab` | Point d'entrée bilingue de la formation |
| `/lab/en` | Laboratoire anglais sur les fondamentaux de GitHub Copilot Business |
| `/lab/fr` | Laboratoire canadien-français sur les fondamentaux de GitHub Copilot Business |

Les identifiants de la chaîne de requête sélectionnent des enregistrements
locaux au navigateur. Ce ne sont pas des identifiants de serveur et ils ne
rendent pas un brouillon accessible depuis un autre navigateur ou une autre
origine.

<!-- readme-section:local-data-and-privacy -->
## Données locales et confidentialité

Dexie conserve les brouillons et les fichiers PDF fictifs dans la base
IndexedDB `portail-aide-financiere`. Les données sont liées au profil de
navigateur et à l'origine exacte utilisée pour ouvrir le prototype. Un
changement d'appareil, de navigateur, de port, de nom d'hôte ou d'adresse de
publication peut donc afficher un autre ensemble de données locales.

Utilisez **Effacer les données de démonstration** dans `/demandes` pour
supprimer les brouillons et PDF fictifs de ce prototype après confirmation.
Les réglages du navigateur peuvent aussi supprimer les données IndexedDB sans
préavis. Ne saisissez aucun renseignement personnel, confidentiel, protégé ou
de production. Aucune durée de conservation n'est affirmée pour ce prototype
dans le navigateur ni pour GitHub Copilot Business; consultez les conditions
de service applicables et à jour avant un déploiement ou une formation réelle.

<!-- readme-section:static-export-and-hosting -->
## Exportation statique et hébergement

La construction par défaut exporte des index de répertoire sous
`/github-copilot-business-labs`. L'adresse prévue est
<https://devopsabcs-engineering.github.io/github-copilot-business-labs/>;
la préparation ne signifie pas que le site est publié.
Le script `scripts/serve-static-export.mjs` monte `out/` au même chemin sur
`127.0.0.1:3000`, avec des index ordinaires et sans réécriture RSC.
La préparation copie uniquement les quatre présentations actuelles et produit
les alias RSC aplatis nécessaires aux hôtes statiques ordinaires. Les polices sont locales.

La suite E2E du domaine construit le mode racine avec `NEXT_PUBLIC_BASE_PATH`
vide. La suite Pages distincte utilise le sous-chemin de production :

```bash
npm run test:pages
```

Le flux Pages accepte seulement un déclenchement manuel. Les contrôles de
construction, documentation, version, publication, analyse statique, tests
unitaires, navigateurs et audit des dépendances de production doivent réussir.
Le déploiement exige aussi le paramètre `deploy` et la variable de dépôt
`PAGES_RELEASE_APPROVED=true`. Laissez cette variable absente tant que l'approbation
est en attente; configurez les réviseurs obligatoires de l'environnement
`github-pages` avant de l'activer. Seul `out/` est téléversé. Aucun flux n'a été
exécuté pendant la préparation de ce candidat.

<!-- readme-section:accessibility -->
## Accessibilité

Le prototype vise les principes des WCAG 2.2 de niveau AA sans revendiquer de
certification. Il comprend des titres sémantiques, des libellés explicites, un
focus visible, la navigation au clavier, l'annonce des erreurs, la réduction
des mouvements et du texte qui ne dépend pas uniquement de la couleur. Les
tests automatisés utilisent axe-core et vérifient le débordement horizontal
avec des profils de navigateurs de bureau et une fenêtre de 320 pixels.

Une revue manuelle du clavier, du zoom, de l'ordre de lecture et des
technologies d'assistance demeure nécessaire avant publication. Les sources
des présentations exigent aussi le Vérificateur d'accessibilité de PowerPoint
et une revue humaine de l'ordre de lecture avant distribution.

<!-- readme-section:learning-assets -->
## Ressources d'apprentissage

Artéfacts de la version actuelle :

* [Source anglaise des fondamentaux de GitHub Copilot Business](assets/github-copilot-business-fundamentals-en.pptx)
* [PDF anglais des fondamentaux de GitHub Copilot Business](assets/github-copilot-business-fundamentals-en.pdf)
* [Source canadienne-française des fondamentaux de GitHub Copilot Business](assets/github-copilot-business-fundamentals-fr-CA.pptx)
* [PDF canadien-français des fondamentaux de GitHub Copilot Business](assets/github-copilot-business-fundamentals-fr-CA.pdf)

<!-- public-derivative: historical-pdfs-excluded -->

Ce dépôt est un dérivé assaini d'un prototype interne d'apprentissage, et non
une copie ou un miroir de son historique. Deux PDF sources historiques sont
intentionnellement exclus. La planification interne, la configuration locale,
les identifiants et l'historique Git original ne sont pas distribués.
Les quatre artéfacts actuels ont été régénérés avec des liens publics;
leurs affirmations pédagogiques conservent les sources datées dans le manifeste.

<!-- readme-section:contributing -->
## Contribution

Gardez les changements ciblés et préservez le caractère non officiel, fictif
et local du prototype. N'ajoutez aucun serveur, mécanisme d'authentification,
système de télémétrie, vrai téléversement ou libellé de transmission officielle
sans revue explicite de l'architecture et de la confidentialité. Conservez les
identifiants de code, les commandes, les routes et les libellés français de
l'interface tels quels dans le matériel d'apprentissage.

Mettez à jour les deux fichiers README lorsqu'un fait commun change. Exécutez
`npm run check:docs`, l'analyse statique, les tests ciblés et la vérification du
contrat de version avant la revue. La parité structurelle ne garantit pas la
qualité de la traduction; toute modification dans une langue exige donc aussi
une revue sémantique par une personne qui la maîtrise couramment.

<!-- readme-section:freshness -->
## Actualité de l'information

Les faits sur le dépôt et GitHub Copilot ont été vérifiés le **2026-10-14**.
Avant chaque version, vérifiez de nouveau les sources et les responsabilités
définies dans
[`assets/copilot-business-release-manifest.yml`](assets/copilot-business-release-manifest.yml).
Revérifiez les prix, les allocations de crédits IA et l'utilisation calculée
selon les jetons, les canaux d'achat, les modèles offerts et les notes des
fournisseurs, les fonctionnalités en préversion, les matrices de
fonctionnalités, les limites des agents, les stratégies MCP, la couverture des
mesures et les conditions de confidentialité propres au service selon la
cadence du manifeste.

Ne transposez pas une affirmation commerciale ou technique datée dans le
contenu durable de la formation. N'ajoutez aucune durée de conservation exacte
avant de l'avoir vérifiée dans les conditions en vigueur pour le canal d'achat
et la fonction du service concernés.

<!-- readme-section:known-caveats -->
## Limites connues

La version du 2026-10-14 est vérifiée par l'analyse statique, les tests
unitaires, l'exportation statique, les tests de navigateur, la génération et le
rendu des présentations, la parité des README et le contrat de version. Une
défaillance d'hydratation du serveur de développement Turbopack a été isolée
pendant la phase 1; la couverture E2E de l'exportation statique de production
réussit au moyen de `npm run build && npm run serve:e2e`. Il s'agit d'un
contournement dans l'architecture de test, et non d'un correctif revendiqué
dans le code de l'application.

Une référence antérieure n'a pas établi le parcours de modification et
d'enregistrement par la personne responsable de la formation. Ce contrôle,
la revue des technologies d'assistance pour les présentations et PDF et la
révision bilingue demeurent en attente. La détection d'un outil ne suffit pas.
L'audit original de production signalait une vulnérabilité critique et trois
élevées; exécutez `npm audit --omit=dev` sur ce candidat. L'hébergement statique
ne constitue pas une dérogation. La correction des dépendances doit utiliser
le flux pris en charge. Aucune publication ni aucun déploiement n'est approuvé,
et aucun état CI réussi n'est affirmé ici.
