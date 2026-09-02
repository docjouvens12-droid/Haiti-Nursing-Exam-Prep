import type { StudyTopic } from "@/lib/study-categories";
import styles from "./StudyTopicDetails.module.css";

export default function StudyTopicDetails({ topic }: { topic: StudyTopic }) {
  return (
    <details className={styles.topic}>
      <summary className={styles.summary}>
        <span className={styles.title}>
          <strong>{topic.title}</strong>
          <small>{topic.subtopics.length} sous-thématiques</small>
        </span>
        <span className={styles.arrow} aria-hidden="true">⌄</span>
      </summary>
      <div className={styles.content}>
        <ul className={styles.list}>
          {topic.subtopics.map((subtopic) => <li key={subtopic}>{subtopic}</li>)}
        </ul>
      </div>
    </details>
  );
}
