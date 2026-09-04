import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/server";
import "./resultats.css";
import AnswerExplanation from "@/components/AnswerExplanation";

type Reponse = { id: string; reponse_choisie: string | null; correcte: boolean; questions: any };

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function ResultatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const { data: session } = await supabase.from("exam_sessions").select("id,score,total_questions,completed_at,mode").eq("id", id).eq("user_id", userId).single();
  if (!session) notFound();
  if (!session.completed_at) redirect("/examens");

  const { data: reponses } = await supabase.from("user_answers").select(`id,reponse_choisie,correcte,questions(categorie,sous_categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication)`).eq("exam_session_id", id).eq("user_id", userId);

  const lignes = (reponses ?? []) as Reponse[];
  const pourcentage = session.total_questions ? Math.round((session.score / session.total_questions) * 100) : 0;
  const correctes = lignes.filter((r) => r.correcte).length;
  const incorrectes = lignes.length - correctes;
  const nonRepondues = Math.max(0, session.total_questions - lignes.filter((r) => r.reponse_choisie).length);
  const reussi = pourcentage >= 70;

  const categories = new Map<string, { total: number; bonnes: number }>();
  const themes = new Map<string, { categorie: string; theme: string; total: number; bonnes: number }>();
  for (const r of lignes) {
    const q = Array.isArray(r.questions) ? r.questions[0] : r.questions;
    const categorie = q?.categorie || "Autres";
    const theme = q?.sous_categorie || "Autres";
    const courant = categories.get(categorie) ?? { total: 0, bonnes: 0 };
    courant.total += 1; if (r.correcte) courant.bonnes += 1; categories.set(categorie, courant);
    const key = `${categorie}|||${theme}`;
    const courantTheme = themes.get(key) ?? { categorie, theme, total: 0, bonnes: 0 };
    courantTheme.total += 1; if (r.correcte) courantTheme.bonnes += 1; themes.set(key, courantTheme);
  }
  const performanceCategories = [...categories.entries()].map(([categorie, v]) => ({ categorie, total: v.total, bonnes: v.bonnes, taux: Math.round((v.bonnes / v.total) * 100) })).sort((a, b) => b.taux - a.taux);
  const performanceThemes = [...themes.values()].map((v) => ({ ...v, taux: Math.round((v.bonnes / v.total) * 100) })).sort((a, b) => a.taux - b.taux || b.total - a.total);
  const meilleur = performanceCategories[0];
  const plusFaible = performanceCategories.at(-1);
  const themeFaible = performanceThemes[0];

  return (
    <div className="results-shell">
      <aside className="results-sidebar"><Link href="/tableau-de-bord" className="brand-lockup"><span className="brand-mark">✚</span><span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span></Link><nav className="side-nav"><Link href="/tableau-de-bord">⌂ <span>Accueil</span></Link><Link href="/pratique">✎ <span>Questions</span></Link><Link className="active" href="/examens">▣ <span>Examens</span></Link><Link href="/questions-incorrectes">⊗ <span>Questions incorrectes</span></Link><Link href="/favoris">♡ <span>Favoris</span></Link><Link href="/nightingale">✦ <span>Nightingale AI</span></Link></nav><div className="results-sidebar-note"><strong>Après l’examen</strong><p>Commencez par vos matières les plus faibles, puis révisez les explications des réponses incorrectes.</p></div></aside>

      <main className="results-main">
        <header className="results-topbar"><div><span className="results-breadcrumb">Examens / Résultats</span><h1>Résultat de votre examen</h1></div><Link href="/historique" className="results-history-link">Voir l’historique</Link></header>
        <section className="results-content">
          <div className="results-hero"><div className={`results-score-ring ${reussi ? "success" : "warning"}`} style={{ "--score": `${pourcentage * 3.6}deg` } as CSSProperties}><div><strong>{pourcentage}%</strong><span>Score final</span></div></div><div className="results-hero-copy"><span className={`results-status ${reussi ? "success" : "warning"}`}>{reussi ? "Objectif atteint" : "À renforcer"}</span><h2>{reussi ? "Très bon travail !" : "Continuez votre progression"}</h2><p>Vous avez obtenu <strong>{session.score}</strong> bonnes réponses sur <strong>{session.total_questions}</strong> lors de cette simulation.</p><div className="results-meta"><span>{session.mode.replace("examen_", "Examen ")} questions</span><span>{formatDate(session.completed_at)}</span></div><div className="results-actions"><Link href="/questions-incorrectes" className="results-primary">Réviser mes erreurs</Link><Link href="/examens" className="results-secondary">Nouvel examen</Link></div></div></div>

          <div className="results-stat-grid"><div><span className="results-stat-icon good">✓</span><small>Bonnes réponses</small><strong>{correctes}</strong></div><div><span className="results-stat-icon bad">×</span><small>Mauvaises réponses</small><strong>{incorrectes}</strong></div><div><span className="results-stat-icon neutral">—</span><small>Non répondues</small><strong>{nonRepondues}</strong></div><div><span className="results-stat-icon score">%</span><small>Taux de réussite</small><strong>{pourcentage}%</strong></div></div>

          <div className="results-grid">
            <section className="results-panel"><div className="results-panel-heading"><div><span className="results-eyebrow">Analyse</span><h2>Performance par catégorie</h2></div></div>{performanceCategories.length ? performanceCategories.map((item) => <div className="results-category-row" key={item.categorie}><div><strong>{item.categorie}</strong><small>{item.bonnes}/{item.total} correctes</small></div><div className="results-bar"><i style={{ width: `${item.taux}%` }} /></div><b className={item.taux >= 70 ? "good" : "warn"}>{item.taux}%</b></div>) : <p className="results-empty">Aucune donnée de catégorie disponible.</p>}</section>
            <section className="results-panel results-insights"><span className="results-eyebrow">À retenir</span><h2>Vos points clés</h2><div className="results-insight good"><span>↑</span><div><small>Meilleure catégorie</small><strong>{meilleur?.categorie ?? "—"}</strong><p>{meilleur ? `${meilleur.taux}% de réussite` : "Pas encore de données"}</p></div></div><div className="results-insight warn"><span>!</span><div><small>Catégorie à travailler</small><strong>{plusFaible?.categorie ?? "—"}</strong><p>{plusFaible ? `${plusFaible.taux}% de réussite` : "Pas encore de données"}</p></div></div><div className="results-insight warn"><span>⚑</span><div><small>Thématique prioritaire</small><strong>{themeFaible?.theme ?? "—"}</strong><p>{themeFaible ? `${themeFaible.categorie} · ${themeFaible.taux}% de réussite` : "Pas encore de données"}</p></div></div>{themeFaible ? <Link href={`/pratique?categorie=${encodeURIComponent(themeFaible.categorie)}&sous_categorie=${encodeURIComponent(themeFaible.theme)}&nombre=25&statut=toutes`} className="results-practice-link">Pratiquer cette thématique →</Link> : <Link href="/pratique" className="results-practice-link">Créer une session de pratique →</Link>}</section>
          </div>

          <section className="results-panel" style={{ marginTop: 18 }}><div className="results-panel-heading"><div><span className="results-eyebrow">Analyse détaillée</span><h2>Performance par thématique</h2></div></div>{performanceThemes.map((item) => <div className="results-category-row" key={`${item.categorie}-${item.theme}`}><div><strong>{item.theme}</strong><small>{item.categorie} · {item.bonnes}/{item.total} correctes</small></div><div className="results-bar"><i style={{ width: `${item.taux}%` }} /></div><b className={item.taux >= 70 ? "good" : "warn"}>{item.taux}%</b></div>)}</section>

          <section className="results-review-section"><div className="results-panel-heading"><div><span className="results-eyebrow">Correction</span><h2>Correction détaillée</h2></div><span className="results-review-count">{lignes.length} questions</span></div><div className="results-review-list">{lignes.map((r, i) => { const q = Array.isArray(r.questions) ? r.questions[0] : r.questions; return <article className={`results-review-card ${r.correcte ? "correct" : "incorrect"}`} key={r.id}><div className="results-review-index">{r.correcte ? "✓" : "×"}</div><div className="results-review-body"><div className="results-review-meta"><span>Question {i + 1}</span><span>{q?.categorie || "Autres"}{q?.sous_categorie ? ` · ${q.sous_categorie}` : ""}</span></div><h3>{q?.question}</h3><div className="results-answer-summary"><span>Votre réponse : <strong>{r.reponse_choisie ?? "Aucune"}</strong></span>{!r.correcte && <span>Bonne réponse : <strong>{q?.bonne_reponse}</strong></span>}</div>{q && <details open={!r.correcte}><summary>Voir le corrigé détaillé</summary><AnswerExplanation question={q} selected={r.reponse_choisie} /></details>}</div></article>; })}</div></section>
        </section>
      </main>
    </div>
  );
}
