"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { LabContent, LabModule } from "@/content/lab";

type FundamentalsLabProps = {
  content: LabContent;
};

function moduleAnchor(moduleId: string) {
  return moduleId.toLowerCase();
}

function ModuleNavigation({
  content,
  module,
}: {
  content: LabContent;
  module: LabModule;
}) {
  const { labels } = content;

  return (
    <nav className="lab-module-controls" aria-label={`${module.id} navigation`}>
      {module.navigation.previous ? (
        <a href={`#${moduleAnchor(module.navigation.previous.id)}`}>
          <span>{labels.previous}</span>
          <strong>{module.navigation.previous.label}</strong>
        </a>
      ) : (
        <Link href="/lab">
          <span>{labels.previous}</span>
          <strong>{labels.overview}</strong>
        </Link>
      )}
      {module.navigation.next ? (
        <a href={`#${moduleAnchor(module.navigation.next.id)}`}>
          <span>{labels.next}</span>
          <strong>{module.navigation.next.label}</strong>
        </a>
      ) : null}
    </nav>
  );
}

export function FundamentalsLab({ content }: FundamentalsLabProps) {
  const { labels } = content;
  const defaultAnchor = moduleAnchor(content.modules[0].id);
  const [activeAnchor, setActiveAnchor] = useState(defaultAnchor);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/github-copilot-business-labs";
  const directorySuffix = basePath ? "/" : "";
  const LocaleLink = basePath ? Link : "a";

  useEffect(() => {
    const knownAnchors = new Set(content.modules.map(({ id }) => moduleAnchor(id)));
    const updateActiveAnchor = () => {
      const candidate = window.location.hash.slice(1);
      setActiveAnchor(knownAnchors.has(candidate) ? candidate : defaultAnchor);
    };

    updateActiveAnchor();
    window.addEventListener("hashchange", updateActiveAnchor);
    return () => window.removeEventListener("hashchange", updateActiveAnchor);
  }, [content.modules, defaultAnchor]);

  return (
    <main
      id="contenu-principal"
      className="conteneur lab-page"
      lang={content.locale}
      tabIndex={-1}
    >
      <header className="lab-introduction">
        <div>
          <p className="surtitre">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="introduction">{content.introduction}</p>
        </div>
        <nav className="lab-language" aria-label={labels.languageNavigation}>
          <span>{labels.switchLanguage}</span>
          <LocaleLink
            href={`/lab/${content.alternateLocale}${directorySuffix}#${activeAnchor}`}
            hrefLang={content.alternateLocale === "en" ? "en-CA" : "fr-CA"}
          >
            {content.alternateLanguageName}
          </LocaleLink>
        </nav>
      </header>

      <aside className="lab-safety" aria-label={labels.warning}>
        <strong>{labels.warning}</strong>
        <p>{content.safetyNotice}</p>
        <p>{content.applicationLanguageNotice}</p>
      </aside>

      <nav className="lab-application-links" aria-label={labels.applicationLinks}>
        <strong>{labels.applicationLinks}</strong>
        <ul>
          {content.applicationLinks.map((link) => (
            <li key={link.id}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lab-layout">
        <nav className="lab-module-nav" aria-label={labels.moduleNavigation}>
          <ol>
            {content.modules.map((module) => (
              <li key={module.id}>
                <a href={`#${moduleAnchor(module.id)}`}>
                  <span aria-hidden="true">
                    {String(module.order).padStart(2, "0")}
                  </span>
                  <strong>{module.title}</strong>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lab-lessons">
          {content.modules.map((module) => (
            <article
              id={moduleAnchor(module.id)}
              className="lab-module"
              key={module.id}
              aria-labelledby={`${moduleAnchor(module.id)}-title`}
            >
              <header className="lab-module-header">
                <p className="lab-module-id">{module.id}</p>
                <h2 id={`${moduleAnchor(module.id)}-title`}>{module.title}</h2>
                <p>{module.summary}</p>
                <dl className="lab-metadata">
                  <div>
                    <dt>{labels.phase}</dt>
                    <dd>{module.phase}</dd>
                  </div>
                  <div>
                    <dt>{labels.duration}</dt>
                    <dd>{module.duration}</dd>
                  </div>
                  <div>
                    <dt>{labels.level}</dt>
                    <dd>{module.level}</dd>
                  </div>
                </dl>
              </header>

              <section aria-label={`${module.id}: ${labels.prerequisites}`}>
                <h3 id={`${moduleAnchor(module.id)}-prerequisites`}>
                  {labels.prerequisites}
                </h3>
                <ul>
                  {module.prerequisites.map((prerequisite) => (
                    <li key={prerequisite}>{prerequisite}</li>
                  ))}
                </ul>
              </section>

              <section aria-label={`${module.id}: ${labels.objectives}`}>
                <h3 id={`${moduleAnchor(module.id)}-objectives`}>
                  {labels.objectives}
                </h3>
                <ul>
                  {module.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </section>

              <section aria-label={`${module.id}: ${labels.files}`}>
                <h3 id={`${moduleAnchor(module.id)}-files`}>{labels.files}</h3>
                <dl className="lab-files">
                  {module.files.map((file) => (
                    <div key={file.id}>
                      <dt>
                        <code>{file.path}</code>
                      </dt>
                      <dd>{file.purpose}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <aside
                className="lab-warning"
                aria-label={`${module.id}: ${labels.warning}`}
              >
                <strong>{labels.warning}</strong>
                <ul>
                  {module.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </aside>

              <section aria-label={`${module.id}: ${labels.evidenceNotes}`}>
                <h3 id={`${moduleAnchor(module.id)}-evidence`}>
                  {labels.evidenceNotes}
                </h3>
                <ul>
                  {module.evidenceNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>

              <section aria-label={`${module.id}: ${labels.steps}`}>
                <h3 id={`${moduleAnchor(module.id)}-steps`}>{labels.steps}</h3>
                <ol className="lab-steps">
                  {module.steps.map((step, index) => (
                    <li id={step.id.toLowerCase()} key={step.id}>
                      <div className="lab-step-heading">
                        <span aria-hidden="true">{index + 1}</span>
                        <h4>{step.title}</h4>
                      </div>
                      {step.instructions.map((instruction) => (
                        <p key={instruction}>{instruction}</p>
                      ))}
                      {step.prompts.map((prompt) => (
                        <div className="lab-prompt" key={prompt.id}>
                          <strong>{labels.prompt}</strong>
                          <blockquote>{prompt.value}</blockquote>
                        </div>
                      ))}
                      {step.commands.map((command) => (
                        <pre
                          key={command.id}
                          role="region"
                          aria-label={`${labels.command} ${command.id}`}
                          // Keyboard users need a focus target when the command overflows.
                          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                          tabIndex={0}
                        >
                          <code>{command.value}</code>
                        </pre>
                      ))}
                      <div className="lab-expected">
                        <strong>{labels.expectedResults}</strong>
                        <ul>
                          {step.expectedResults.map((result) => (
                            <li key={result}>{result}</li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-label={`${module.id}: ${labels.recovery}`}>
                <h3 id={`${moduleAnchor(module.id)}-recovery`}>
                  {labels.recovery}
                </h3>
                <ul>
                  {module.recovery.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section
                className="lab-checkpoint"
                aria-labelledby={module.checkpoint.id.toLowerCase()}
              >
                <p>{labels.checkpoint}</p>
                <h3 id={module.checkpoint.id.toLowerCase()}>
                  {module.checkpoint.title}
                </h3>
                <p>{module.checkpoint.description}</p>
                <ul>
                  {module.checkpoint.validation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section aria-label={`${module.id}: ${labels.troubleshooting}`}>
                <h3 id={`${moduleAnchor(module.id)}-troubleshooting`}>
                  {labels.troubleshooting}
                </h3>
                <dl className="lab-troubleshooting">
                  {module.troubleshooting.map((item) => (
                    <div key={item.id}>
                      <dt>{item.problem}</dt>
                      <dd>{item.resolution}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section aria-label={`${module.id}: ${labels.knowledgeCheck}`}>
                <h3 id={`${moduleAnchor(module.id)}-knowledge-check`}>
                  {labels.knowledgeCheck}
                </h3>
                {module.knowledgeChecks.map((item) => (
                  <details key={item.id}>
                    <summary>{item.question}</summary>
                    <p>
                      <strong>{labels.revealAnswer}:</strong> {item.answer}
                    </p>
                  </details>
                ))}
              </section>

              <ModuleNavigation content={content} module={module} />
            </article>
          ))}
        </div>
      </div>

      <section className="lab-glossary" aria-labelledby="lab-glossary-title">
        <h2 id="lab-glossary-title">{labels.glossary}</h2>
        <dl>
          {content.glossary.map((entry) => (
            <div id={entry.id.toLowerCase()} key={entry.id}>
              <dt>{entry.term}</dt>
              <dd>{entry.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}