import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "./historique.css";

function formatDate(value: string | null) {
  if (!value) return "Date indisponible";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatMode(mode: string | null) {
  if (!mode) return "Examen simulé";
  return mode.replaceAll("_", " ").replace(/^examen /i, "Simulation ");
}

export default async function Historique() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const { data: sessions } = await supabase
    .from("exam_sessions")
    .select("id,mode,score,total_questions,completed_at")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  const liste = sessions ?? [];
  const moyenne = liste.length
    ? Math.round(liste.reduce((sum, s) => sum + (s.total_questions ? (s.score / s.total_questions) * 100 : 0), 0) / liste.length)
    : 0;
  const meilleur = liste.length
    ? Math.max(...liste.map((s) => (s.total_questions ? Math.round((s.score / s.total_questions) * 100) : 0)))
    : 0;
  const totalQuestions = liste.reduce((sum, s) => sum + (s.total_questions ?? 0), 0);

  return (
    <div className="history-shell">
      <aside className="history-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup">
          <span className="brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>
        <nav>
          <Link href="/tableau-de-bord">Accueil</Link>
          <Link href="/pratique">Questions</Link>
          <Link href="/examens">Examens</Link>
          <Link className="active" href="/historique">Historique</Link>
          <Link href="/performance">Performance</Link>
          <Link href="/nightingale">Nightingale AI</Link>
        </nav>
      </aside>

      <main className="history-main">
        <header className="history-topbar">
          <div><span className="history-breadcrumb">Accueil / Historique</span><h1>Historique des examens</h1></div>
          <Link href="/examens">Nouvel examen →</Link>
        </header>

        <section className="history-content">
          <div className="history-hero">
            <div>
              <span className="history-breadcrumb" style={{ color: "#b9c7ff" }}>Votre progression</span>
              <h2>Suivez chaque simulation terminée</h2>
              <p>Retrouvez vos scores, comparez vos résultats au fil du temps et ouvrez la correction détaillée de chaque examen.</p>
            </div>
            <div className="history-stats">
              <div><strong>{liste.length}</strong><span>Examens terminés</span></div>
              <div><strong>{moyenne}%</strong><span>Score moyen</span></div>
              <div><strong>{meilleur}%</strong><span>Meilleur score</span></div>
            </div>
          </div>

          <section className="history-list">
            <div className="history-heading">
              <div><h2>Examens terminés</h2><small>{totalQuestions} questions évaluées au total</small></div>
              <Link href="/performance">Voir la performance →</Link>
            </div>

            {liste.map((s) => {
              const pct = s.total_questions ? Math.round((s.score / s.total_questions) * 100) : 0;
              const classe = pct >= 70 ? "good" : pct >= 50 ? "mid" : "low";
              return (
                <div className="history-row" key={s.id}>
                  <span className="history-icon">▣</span>
                  <div><strong>{formatMode(s.mode)}</strong><small>{formatDate(s.completed_at)} · {s.score}/{s.total_questions} bonnes réponses</small></div>
                  <span className={`history-score ${classe}`}>{pct}%</span>
                  <Link className="history-review" href={`/resultats/${s.id}`}>Voir la correction</Link>
                </div>
              );
            })}

            {liste.length === 0 && (
              <div className="history-empty">
                <span>▣</span><h3>Aucun examen terminé</h3>
                <p>Votre historique apparaîtra ici après votre première simulation.</p>
                <Link href="/examens">Commencer un examen</Link>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
