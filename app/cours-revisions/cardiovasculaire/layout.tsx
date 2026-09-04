import type { ReactNode } from "react";
import ObjectifsCardiovasculairePortal from "@/components/ObjectifsCardiovasculairePortal";
import CardiovascularAnatomyDiagrams from "@/components/CardiovascularAnatomyDiagrams";
import CardiovascularReferences from "@/components/CardiovascularReferences";

export default function CardiovasculaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ObjectifsCardiovasculairePortal />
      <CardiovascularAnatomyDiagrams />
      <CardiovascularReferences />
    </>
  );
}
