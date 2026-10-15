import type { Metadata } from "next";

import { SuiviSimule } from "@/components/demandes/suivi-simule";

export const metadata: Metadata = {
  title: "Suivi simulé",
};

export default function SuiviPage() {
  return <SuiviSimule />;
}