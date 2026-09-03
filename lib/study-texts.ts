import data from "./study-texts-data.json";

export type StudyText = {
  id: string;
  category: string;
  topic: string;
  subtopic: string;
  paragraphs: string[];
  sources: { title: string; url: string }[];
  updatedAt: string;
};
export const studyTexts: readonly StudyText[] = data;
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
