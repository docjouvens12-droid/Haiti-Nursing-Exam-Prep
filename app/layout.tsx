import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haiti Nursing Exam Prep",
  description: "Plateforme de préparation aux examens infirmiers en Haïti",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
