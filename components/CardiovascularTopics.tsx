import styles from "./CardiovascularTopics.module.css";

const subtopics = [
  "Anatomie et physiologie cardiovasculaire",
  "Évaluation cardiovasculaire",
  "Hypertension artérielle",
  "Athérosclérose",
  "Maladie coronarienne",
  "Angine de poitrine",
  "Infarctus du myocarde / syndrome coronarien aigu",
  "Insuffisance cardiaque",
  "Œdème pulmonaire cardiogénique",
  "Troubles du rythme / arythmies",
  "ECG et surveillance cardiaque",
  "Valvulopathies",
  "Endocardite",
  "Péricardite",
  "Cardiomyopathies",
  "Maladies artérielles périphériques",
  "Maladies veineuses / thrombose veineuse profonde",
  "Embolie pulmonaire",
  "Anévrisme aortique",
  "Choc cardiogénique",
  "Médicaments cardiovasculaires",
  "Examens diagnostiques cardiovasculaires",
  "Cathétérisme cardiaque",
  "Pacemaker et défibrillateur",
  "Chirurgie cardiaque et soins pré/postopératoires",
  "Éducation du patient et prévention cardiovasculaire",
  "Urgences cardiovasculaires",
];

export default function CardiovascularTopics() {
  return (
    <details className={styles.topic}>
      <summary className={styles.summary}>
        <span className={styles.title}>
          <strong>Cardiovasculaire</strong>
          <small>{subtopics.length} sous-thématiques</small>
        </span>
        <span className={styles.arrow} aria-hidden="true">⌄</span>
      </summary>
      <div className={styles.content}>
        <ul className={styles.list}>
          {subtopics.map((subtopic) => <li key={subtopic}>{subtopic}</li>)}
        </ul>
      </div>
    </details>
  );
}
