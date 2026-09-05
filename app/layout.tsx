import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./dashboard-premium.css";
import MobileStudentNav from "@/components/MobileStudentNav";
import { StudentMenuProvider } from "@/components/StudentMenuContext";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Haiti Nursing Exam Prep",
  description: "Préparez-vous, pratiquez et progressez pour l’Examen d’État en sciences infirmières en Haïti.",
  manifest: "/manifest.webmanifest",
  applicationName: "Haiti Nursing Exam Prep",
  appleWebApp: {
    capable: true,
    title: "Haiti Nursing",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/pwa-icon.svg",
    shortcut: "/pwa-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1f59",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <StudentMenuProvider>
          {children}
          <MobileStudentNav />
        </StudentMenuProvider>
        <PWARegister />
      </body>
    </html>
  );
}
