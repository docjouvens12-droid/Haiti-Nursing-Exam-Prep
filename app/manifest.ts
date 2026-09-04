import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/tableau-de-bord",
    name: "Haiti Nursing Exam Prep",
    short_name: "Haiti Nursing",
    description: "Préparation à l’Examen d’État en sciences infirmières en Haïti.",
    start_url: "/tableau-de-bord",
    scope: "/",
    display: "standalone",
    background_color: "#061636",
    theme_color: "#0b1f59",
    lang: "fr",
    orientation: "portrait-primary",
    categories: ["education", "medical"],
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/pwa-icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Pratiquer des questions",
        short_name: "Pratique",
        description: "Commencer une session de questions infirmières.",
        url: "/pratique",
        icons: [{ src: "/pwa-icon.svg", sizes: "512x512", type: "image/svg+xml" }],
      },
      {
        name: "Simulations d’examen",
        short_name: "Examens",
        description: "Ouvrir les simulations de l’Examen d’État.",
        url: "/examens",
        icons: [{ src: "/pwa-icon.svg", sizes: "512x512", type: "image/svg+xml" }],
      },
    ],
  };
}
