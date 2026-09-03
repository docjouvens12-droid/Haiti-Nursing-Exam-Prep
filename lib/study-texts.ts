import data from "./study-texts-data.json";
import details from "./study-text-details-data.json";

export type StudySection = { id: string; title: string; paragraphs: string[] };

export type StudyText = {
  id: string;
  category: string;
  topic: string;
  subtopic: string;
  paragraphs: string[];
  sections: StudySection[];
  sources: { title: string; url: string }[];
  updatedAt: string;
};
const titles: Record<string, string[]> = {
  disease: ["Définition", "Comprendre le mécanisme", "Causes et facteurs de risque", "Signes et symptômes", "Examens diagnostiques", "Traitement et soins infirmiers", "Signes d’alerte et complications", "À retenir"],
  medicine: ["Définition", "Mode d’action", "Indications et précautions", "Effets à surveiller", "Vérifications et bilans", "Administration et soins infirmiers", "Signes d’alerte et effets graves", "À retenir"],
  procedure: ["Définition et objectif", "Comprendre le principe", "Indications et contexte", "Observations essentielles", "Vérifications avant le soin", "Réalisation et soins infirmiers", "Risques et signes d’alerte", "À retenir"],
  concept: ["Définition", "Comprendre le principe", "Contexte et facteurs associés", "Éléments à observer", "Évaluation et vérifications", "Application aux soins", "Points de vigilance", "À retenir"],
  community: ["Définition et objectif", "Comprendre l’action", "Population et besoins", "Éléments à recueillir", "Méthode et évaluation", "Actions et accompagnement", "Limites et points de vigilance", "À retenir"],
  calculation: ["Définition et exemple", "Principe du calcul", "Données nécessaires", "Préparer le raisonnement", "Vérifier le résultat", "Application et sécurité", "Erreurs à éviter", "À retenir"],
};
const sectionIds = ["definition", "mecanisme", "contexte", "observations", "evaluation", "soins", "alertes", "retenir"];
const detailsById = new Map<string, (typeof details)[number]>();
for (const profile of details) {
  for (const id of profile.ids) {
    if (detailsById.has(id)) throw new Error(`Duplicate study details: ${id}`);
    detailsById.set(id, profile);
  }
}
export const studyTexts: readonly StudyText[] = data.map(text => {
  const profile = detailsById.get(text.id);
  if (!profile || !titles[profile.kind]) throw new Error(`Missing study details: ${text.id}`);
  const paragraphs = [[text.paragraphs[0]], [profile.mechanism], [profile.context], [profile.observations], [profile.assessment], [text.paragraphs[1]], [profile.alerts], profile.takeaways];
  return { ...text, sections: sectionIds.map((id, index) => ({ id, title: titles[profile.kind][index], paragraphs: paragraphs[index] })) };
});
const keyFor = (category: string, topic: string, subtopic: string) => JSON.stringify([category, topic, subtopic]);
const bySubtopic = new Map(studyTexts.map(text => [keyFor(text.category, text.topic, text.subtopic), text]));
const byId = new Map(studyTexts.map(text => [text.id, text]));
export function getStudyText(category: string, topic: string, subtopic: string) {
  return bySubtopic.get(keyFor(category, topic, subtopic));
}
export function getStudyTextById(id: string) { return byId.get(id); }
export function countTextSubtopics(category: string, topic: string) {
  return studyTexts.filter(text => text.category === category && text.topic === topic).length;
}
