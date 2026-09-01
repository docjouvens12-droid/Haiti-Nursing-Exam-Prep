import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
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
    categories: ["education"],
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/pwa-icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
