export const CATEGORIES_QUESTIONS = [
  "Médecine-Chirurgie",
  "Maternité-Obstétrique",
  "Pédiatrie",
  "Pharmacologie",
  "Santé mentale / Psychiatrie",
  "Soins fondamentaux",
  "Urgences",
  "Santé communautaire",
  "Nutrition",
  "Gériatrie",
  "Maladies infectieuses",
  "Soins critiques / Réanimation",
  "Éthique et déontologie",
  "Administration et gestion infirmière",
  "Calculs de médicaments / IV",
] as const;

export type CategorieQuestion = (typeof CATEGORIES_QUESTIONS)[number];
