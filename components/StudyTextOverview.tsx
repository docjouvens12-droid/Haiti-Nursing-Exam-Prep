import { studyCategories } from "@/lib/study-categories";
import { studyTexts } from "@/lib/study-texts";

export default function StudyTextOverview() {
  const total = studyCategories.reduce((sum, category) => sum + category.topics.reduce((count, topic) => count + topic.subtopics.length, 0), 0);
  return <p className="muted"><strong>{studyTexts.length} fiches explicatives disponibles</strong> sur {total} sous-thématiques. Ouvrez une thématique puis choisissez « Lire la fiche ».</p>;
}
