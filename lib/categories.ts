export const CATEGORIES_QUESTIONS = [
  "Soins fondamentaux",
  "Médecine-Chirurgie",
  "Maternité-Obstétrique",
  "Pédiatrie",
  "Pharmacologie",
  "Santé mentale / Psychiatrie",
  "Santé communautaire",
  "Urgences",
] as const;

export type CategorieQuestion = (typeof CATEGORIES_QUESTIONS)[number];

export const CATEGORIE_LABELS: Record<string, string> = {
  "Soins fondamentaux": "Fondements et soins infirmiers de base",
  "Médecine-Chirurgie": "Soins infirmiers médico-chirurgicaux",
  "Maternité-Obstétrique": "Santé maternelle, obstétrique et néonatale",
  "Pédiatrie": "Soins infirmiers pédiatriques",
  "Pharmacologie": "Pharmacologie et administration des médicaments",
  "Santé mentale / Psychiatrie": "Santé mentale et soins psychiatriques",
  "Santé communautaire": "Santé communautaire et santé publique",
  "Urgences": "Urgences et soins critiques",
};

export function libelleCategorie(categorie: string) {
  return CATEGORIE_LABELS[categorie] ?? categorie;
}
