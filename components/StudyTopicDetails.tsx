import type { StudyTopic } from "@/lib/study-categories";
import { countVideoSubtopics, getStudyVideos } from "@/lib/study-videos";
import StudyVideoList from "./StudyVideoList";
import styles from "./StudyTopicDetails.module.css";

export default function StudyTopicDetails({ category, topic }: { category: string; topic: StudyTopic }) {
  const videoSubtopics = countVideoSubtopics(category, topic.title);
  return (
    <details className={styles.topic}>
      <summary className={styles.summary}>
        <span className={styles.title}>
          <strong>{topic.title}</strong>
          <small>{topic.subtopics.length} sous-thématiques</small>
          {videoSubtopics > 0 ? <small>{videoSubtopics} avec vidéos</small> : null}
        </span>
        <span className={styles.arrow} aria-hidden="true">⌄</span>
      </summary>
      <div className={styles.content}>
        <ul className={styles.list}>
          {topic.subtopics.map((subtopic) => {
            const videos = getStudyVideos(category, topic.title, subtopic);
            return <li key={subtopic}>
              {subtopic}
              {videos.length > 0 ? <StudyVideoList videos={videos} /> : null}
            </li>;
          })}
        </ul>
      </div>
    </details>
  );
}
