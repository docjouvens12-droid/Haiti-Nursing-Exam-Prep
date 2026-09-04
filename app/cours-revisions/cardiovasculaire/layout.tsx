import type { ReactNode } from "react";
import ObjectifsCardiovasculairePortal from "@/components/ObjectifsCardiovasculairePortal";
import CardiovascularAnatomyDiagrams from "@/components/CardiovascularAnatomyDiagrams";
import HTAEnrichie from "@/components/HTAEnrichie";

export default function CardiovasculaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ObjectifsCardiovasculairePortal />
      <CardiovascularAnatomyDiagrams />
      <HTAEnrichie />
    </>
  );
}
