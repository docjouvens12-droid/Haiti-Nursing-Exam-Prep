import type { ReactNode } from "react";
import ObjectifsCardiovasculairePortal from "@/components/ObjectifsCardiovasculairePortal";

export default function CardiovasculaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ObjectifsCardiovasculairePortal />
    </>
  );
}
