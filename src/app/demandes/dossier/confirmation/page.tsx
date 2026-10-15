import type { Metadata } from "next";

import { ConfirmationSimulee } from "@/components/demandes/confirmation-simulee";

export const metadata: Metadata = {
  title: "Confirmation simulée",
};

export default function ConfirmationPage() {
  return <ConfirmationSimulee />;
}