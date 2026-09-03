import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudyTextById, studyTexts } from "@/lib/study-texts";
import { doseExamples, studyDiagrams } from "@/lib/study-examples";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return studyTexts.map(({ id }) => ({ id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const text = getStudyTextById((await params).id);
  return { title: text ? `${text.subtopic} | Haiti Nursing Exam Prep` : "Fiche introuvable" };
}
export default async function StudyTextPage({ params }: Props) {
  const text = getStudyTextById((await params).id);
  if (!text) notFound();
  const example = doseExamples[text.id];
  const diagram = studyDiagrams[text.id];
  const extraWords = example ? [example.given, ...example.steps, example.result, example.safety].join(" ") : "";
  const minutes = Math.max(1, Math.ceil((text.sections.flatMap(section => section.paragraphs).join(" ") + " " + extraWords).split(/\s+/).length / 180));
  return <main className={styles.page}>
    <Link className={styles.back} href="/categories">← Catégories et thématiques</Link>
    <article className={styles.article}>
      <header>
        <p className={styles.breadcrumb}>{text.category} · {text.topic}</p>
        <h1>{text.subtopic}</h1>
        <p className={styles.meta}>8 rubriques · Lecture : environ {minutes} min</p>
        <p className={styles.hint}>Ouvrez chaque rubrique pour avancer à votre rythme.</p>
        {diagram && <p>Schéma explicatif dans la rubrique 2 : « Comprendre le mécanisme ».</p>}
        {example && <p><a href="#definition">Voir l’exemple corrigé ↓</a></p>}
      </header>
      <div className={styles.sections}>
        {text.sections.map((section, index) => <details
          key={section.id}
          id={section.id}
          className={`${styles.section} ${section.id === "alertes" ? styles.alerts : ""} ${section.id === "retenir" ? styles.takeaways : ""}`}
          open={index === 0}
        >
          <summary className={styles.summary}>
            <span className={styles.number} aria-hidden="true">{index + 1}</span>
            <h2>{section.title}</h2>
            <span className={styles.chevron} aria-hidden="true">⌄</span>
          </summary>
          <div className={styles.content}>
            {section.id === "retenir"
              ? <ul>{section.paragraphs.map(paragraph => <li key={paragraph}>{paragraph}</li>)}</ul>
              : section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.id === "mecanisme" && diagram && <figure className={styles.diagram}>
              <figcaption>{diagram.title}</figcaption>
              <svg viewBox="0 0 380 400" role="img" aria-labelledby={`diagram-${text.id}`} className={styles.diagramSvg}>
                <title id={`diagram-${text.id}`}>{diagram.nodes.join(" → ")}</title>
                {diagram.nodes.map((node, i) => <g key={node}>
                  <rect x="10" y={10 + i * 100} width="360" height="70" rx="14" fill={i === 3 ? "#e1f3ee" : "#edf2ff"} stroke="#9bb1ce" />
                  <foreignObject x="25" y={15 + i * 100} width="330" height="60"><div className={styles.diagramLabel}>{node}</div></foreignObject>
                  {i < 3 && <path d={`M190 ${82 + i * 100} v22 m-6 -6 l6 6 6 -6`} fill="none" stroke="#315b91" strokeWidth="2" />}
                </g>)}
              </svg>
              <p>{diagram.caption}</p>
              <a href={diagram.source} target="_blank" rel="noopener noreferrer">Référence du schéma : Open RN (nouvel onglet) ↗</a>
            </figure>}
            {section.id === "definition" && example && <aside className={styles.example} aria-label="Exemple de calcul corrigé">
              <h3>{example.title}</h3>
              <p>{example.given}</p>
              <ol>{example.steps.map(step => <li key={step}>{step}</li>)}</ol>
              <p className={styles.result}>Résultat : {example.result}</p>
              <p><strong>Vérification de sécurité :</strong> {example.safety}</p>
              <p className={styles.exampleNote}>Exemple fictif pour apprendre le calcul, pas une prescription. Un résultat mathématique correct ne garantit pas une dose cliniquement adaptée.</p>
              <a href="https://www.ncbi.nlm.nih.gov/books/NBK593207/" target="_blank" rel="noopener noreferrer">Méthode : Open RN, calculs infirmiers (nouvel onglet) ↗</a>
            </aside>}
          </div>
        </details>)}
      </div>
      <footer className={styles.footer}>
        <h2>Pour approfondir</h2>
        <ul>{text.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span className={styles.srOnly}> (nouvel onglet)</span> ↗</a></li>)}</ul>
        <p>Texte mis à jour le {text.updatedAt.split("-").reverse().join("/")}.</p>
        <p>Repères pédagogiques à compléter par votre formation. Les gestes et traitements suivent les prescriptions et les protocoles locaux.</p>
      </footer>
    </article>
    <Link className={styles.back} href="/categories">← Revenir aux sous-thématiques</Link>
  </main>;
}
