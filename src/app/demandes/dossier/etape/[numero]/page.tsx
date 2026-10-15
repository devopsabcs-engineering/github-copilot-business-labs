import { notFound } from "next/navigation";

import { AssistantEtape } from "@/components/formulaires/assistant-etape";
import { NUMEROS_ETAPE, type NumeroEtape } from "@/lib/domaine/demande.types";

export const dynamicParams = false;

export function generateStaticParams() {
  return NUMEROS_ETAPE.map((numero) => ({ numero: String(numero) }));
}

type PageEtapeProps = {
  params: Promise<{ numero: string }>;
};

export default async function PageEtape({ params }: PageEtapeProps) {
  const { numero: valeurNumero } = await params;
  const numero = Number(valeurNumero) as NumeroEtape;

  if (!NUMEROS_ETAPE.includes(numero)) {
    notFound();
  }

  return <AssistantEtape numero={numero} />;
}