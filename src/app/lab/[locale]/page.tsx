import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FundamentalsLab } from "@/components/lab/fundamentals-lab";
import { getLabContent, LAB_ROUTE_LOCALES } from "@/content/lab";

export const dynamicParams = false;

export function generateStaticParams() {
  return LAB_ROUTE_LOCALES.map((locale) => ({ locale }));
}

type LocalizedLabPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedLabPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLabContent(locale);

  if (!content) {
    return {};
  }

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_PATH ?? "/github-copilot-business-labs"}/lab/${locale}/`,
      languages: {
        "en-CA": `${process.env.NEXT_PUBLIC_BASE_PATH ?? "/github-copilot-business-labs"}/lab/en/`,
        "fr-CA": `${process.env.NEXT_PUBLIC_BASE_PATH ?? "/github-copilot-business-labs"}/lab/fr/`,
      },
    },
  };
}

export default async function LocalizedLabPage({
  params,
}: LocalizedLabPageProps) {
  const { locale } = await params;
  const content = getLabContent(locale);

  if (!content) {
    notFound();
  }

  return <FundamentalsLab content={content} />;
}