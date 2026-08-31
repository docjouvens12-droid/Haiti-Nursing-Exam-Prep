import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "./performance.css";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatMode(mode: string | null) {
  if (!mode) return "Examen simulé";
  return mode.replaceAll("_", " ").replace(/^examen /i, "Simulation ");
}

export default async function PerformancePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const [{ data: reponses }, { data: sessions }] = await Promise.all([
    supabase
      .from("user_answers")
      .select(`correcte,answered_at,question_id,questions(categorie)`)
      .eq("user_id", userId)
      .order("answered_at", { ascending: false })
      .limit(5000),
    supabase
      .from("exam_sessions")
      .select("id,mode,score,total_questions,completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(10),
  ]);

  const total = reponses?.length ?? 0;
  const bonnes = (reponses ?? []).filter((r: any) => r.correcte).length;
  const taux = total ? Math.round((bonnes / total) * 100) : 0;
  const totalExamens = sessions?.length ?? 0;
  const moyenneExamens = totalExamens
    ? Math.round((sessions ?? []).reduce((sum, s) => sum + (s.total_questions ? (s.score / s.total_questions) * 100 : 0), 0) / totalExamens)
    : 0;

  const categories = new Map<string, { total: number; bonnes: number }>();
  for (const r of reponses ?? []) {
    const q: any = Array.isArray((r as any).questions) ? (r as any).questions[0] : (r as any).questions;
    const categorie = q?.categorie || "Autres";
    const current = categories.get(categorie) ?? { total: 0, bonnes: 0 };
    current.total += 1;
    if ((r as any).correcte) current.bonnes += 1;
    categories.set(categorie, current);
  }

  const progression = [...categories.entries()]
    .map(([categorie, value]) => ({
      categorie,
      total: value.total,
      taux: value.total ? Math.round((value.bonnes / value.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const meilleure = progression.length ? [...progression].sort((a, b) => b.taux - a.taux)[0] : null;
  const plusFaible = progression.length ? [...progression].sort((a, b) => a.taux - b.taux)[0] : null;
  const nonCorrectes = total - bonnes;

  return (
    <div className="performance-shell">
      <aside className="performance-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup">
          <span className="brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>
        <nav>
          <Link href="/tableau-de-bord">Accueil</Link>
          <Link href="/pratique">Questions</Link>
          <Link href="/examens">Examens</Link>
          <Link href="/historique">Historique</Link>
          <Link className="active" href="/performance">Performance</Link>
          <Link href="/nightingale">Nightingale AI</Link>
        </nav>
      </aside>

      <main className="performance-main">
        <header className="performance-topbar">
          <div><span className="performance-breadcrumb">Accueil / Performance</span><h1>Performance</h1></div>
          <Link href="/pratique">Continuer à pratiquer →</Link>
        </header>

        <section className="performance-content">
          <div className="performance-metrics">
            <div className="performance-metric"><span>Questions répondues</span><strong>{total}</strong><small>Sur votre activité enregistrée</small></div>
            <div className="performance-metric"><span>Taux de réussite</span><strong>{taux}%</strong><small>{bonnes} bonnes réponses</small></div>
            <div className="performance-metric"><span>Examens récents</span><strong>{totalExamens}</strong><small>Sessions terminées affichées</small></div>
            <div className="performance-metric"><span>Moyenne examens</span><strong>{moyenneExamens}%</strong><small>Calculée sur les sessions récentes</small></div>
          </div>

          <div className="performance-grid">
            <section className="performance-panel">
              <h2>Maîtrise par matière</h2>
              <p>Basée sur vos réponses enregistrées dans la banque de questions.</p>
              {progression.map((item) => (
                <div className="performance-subject" key={item.categorie}>
                  <strong>{item.categorie}<small style={{ display: "block", marginTop: 3, color: "#7b8498", fontWeight: 400 }}>{item.total} questions</small></strong>
                  <div className="performance-bar"><i style={{ width: `${item.taux}%` }} /></div>
                  <b>{item.taux}%</b>
                </div>
              ))}
              {progression.length === 0 && <div className="performance-empty">Commencez à répondre à des questions pour afficher votre performance par matière.</div>}
            </section>

            <section className="performance-panel">
              <h2>Analyse rapide</h2>
              <p>Les indicateurs ci-dessous vous aident à orienter vos prochaines révisions.</p>
              <div className="performance-insight">
                <div className="performance-insight-card"><span>Point fort</span><strong>{meilleure?.categorie ?? "À déterminer"}</strong><small>{meilleure ? `${meilleure.taux}% de réussite` : "Davantage de réponses sont nécessaires."}</small></div>
                <div className="performance-insight-card"><span>À renforcer</span><strong>{plusFaible?.categorie ?? "À déterminer"}</strong><small>{plusFaible ? `${plusFaible.taux}% de réussite` : "Davantage de réponses sont nécessaires."}</small></div>
                <div className="performance-insight-card"><span>Réponses à revoir</span><strong>{nonCorrectes}</strong><small>Réponses incorrectes dans votre activité enregistrée.</small></div>
              </div>
              <div className="performance-actions">
                <Link href="/questions-incorrectes">Réviser mes erreurs</Link>
                <Link className="secondary" href="/favoris">Voir mes favoris</Link>
              </div>
            </section>
          </div>

          <section className="performance-panel performance-recent">
            <h2>Examens récents</h2>
            <p>Comparez vos derniers résultats et ouvrez la correction détaillée.</p>
            {(sessions ?? []).map((s) => {
              const pct = s.total_questions ? Math.round((s.score / s.total_questions) * 100) : 0;
              return (
                <div className="performance-session" key={s.id}>
                  <div><strong>{formatMode(s.mode)}</strong><small>{formatDate(s.completed_at)} · {s.score}/{s.total_questions}</small></div>
                  <b>{pct}%</b>
                  <Link href={`/resultats/${s.id}`}>Correction</Link>
                </div>
              );
            })}
            {(!sessions || sessions.length === 0) && <div className="performance-empty">Aucun examen terminé pour le moment.</div>}
          </section>
        </section>
      </main>
    </div>
  );
}
