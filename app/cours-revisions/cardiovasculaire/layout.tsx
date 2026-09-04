import type { ReactNode } from "react";
import ObjectifsCardiovasculairePortal from "@/components/ObjectifsCardiovasculairePortal";
import CardiovascularAnatomyDiagrams from "@/components/CardiovascularAnatomyDiagrams";

export default function CardiovasculaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ObjectifsCardiovasculairePortal />
      <CardiovascularAnatomyDiagrams />
    </>
  );
}
