import { Suspense, type ReactNode } from "react";

import { AssistantProvider } from "@/components/demandes/assistant-provider";

export default function DossierLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main id="contenu-principal" className="conteneur page-etape" tabIndex={-1}>
          <p role="status">Chargement du brouillon local…</p>
        </main>
      }
    >
      <AssistantProvider>{children}</AssistantProvider>
    </Suspense>
  );
}