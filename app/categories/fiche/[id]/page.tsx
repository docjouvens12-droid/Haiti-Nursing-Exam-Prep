import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudyTextById, studyTexts } from "@/lib/study-texts";
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
  const minutes = Math.max(1, Math.ceil(text.sections.flatMap(section => section.paragraphs).join(" ").split(/\s+/).length / 180));
  return <main className={styles.page}>
    <Link className={styles.back} href="/categories">← Catégories et thématiques</Link>
    <article className={styles.article}>
      <header>
        <p className={styles.breadcrumb}>{text.category} · {text.topic}</p>
        <h1>{text.subtopic}</h1>
        <p className={styles.meta}>8 rubriques · Lecture : environ {minutes} min</p>
        <p className={styles.hint}>Ouvrez chaque rubrique pour avancer à votre rythme.</p>
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
