import { studyCategories } from "@/lib/study-categories";
import { studyVideos, studyVideoAssignments } from "@/lib/study-videos";

export default function StudyVideoOverview() {
  const totalSubtopics = studyCategories.reduce((total, category) =>
    total + category.topics.reduce((count, topic) => count + topic.subtopics.length, 0), 0);

  return (
    <p className="muted">
      <strong>{studyVideos.length} vidéos de moins de 15 minutes</strong>, disponibles dans{" "}
      {studyVideoAssignments.length} sous-thématiques sur {totalSubtopics}.
      {" "}Repérez la mention « avec vidéos » en ouvrant une catégorie.
    </p>
  );
}
