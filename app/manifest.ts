import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Haiti Nursing Exam Prep",
    short_name: "Haiti Nursing",
    description: "Préparation à l’Examen d’État en sciences infirmières en Haïti.",
    start_url: "/tableau-de-bord",
    display: "standalone",
    background_color: "#f7f9fd",
    theme_color: "#0b1f59",
    lang: "fr",
    orientation: "portrait-primary",
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
