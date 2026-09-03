import Link from "next/link";
import type { StudyTopic } from "@/lib/study-categories";
import { countTextSubtopics, getStudyText } from "@/lib/study-texts";
import styles from "./StudyTopicDetails.module.css";

export default function StudyTopicDetails({ category, topic }: { category: string; topic: StudyTopic }) {
  const count = countTextSubtopics(category, topic.title);
  return (
    <details className={styles.topic}>
      <summary className={styles.summary}>
        <span className={styles.title}>
          <strong>{topic.title}</strong>
          <small>{topic.subtopics.length} sous-thématiques</small>
          {count > 0 ? <small>{count} {count === 1 ? "fiche disponible" : "fiches disponibles"}</small> : null}
        </span>
        <span className={styles.arrow} aria-hidden="true">⌄</span>
      </summary>
      <div className={styles.content}>
        <ul className={styles.list}>
          {topic.subtopics.map(subtopic => {
            const text = getStudyText(category, topic.title, subtopic);
            return <li key={subtopic}>
              <span>{subtopic}</span>
              {text ? <Link className={styles.readLink} href={`/categories/fiche/${text.id}`} aria-label={`Lire la fiche : ${subtopic}`}>
                Lire la fiche <span aria-hidden="true">→</span>
              </Link> : <small className={styles.pending}>Fiche à venir</small>}
            </li>;
          })}
        </ul>
      </div>
    </details>
  );
}
