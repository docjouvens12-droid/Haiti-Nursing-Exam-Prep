import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haiti Nursing Exam Prep",
  description: "Préparez-vous, pratiquez et progressez pour l’Examen d’État en sciences infirmières en Haïti.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
