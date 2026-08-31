import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function pourcentage(score: number | null, total: number | null) {
  return total ? Math.round(((score ?? 0) / total) * 100) : 0;
}

export default async function Examens() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const [{ data: sessions }, { count: totalQuestions }] = await Promise.all([
    supabase
      .from("exam_sessions")
      .select("id,mode,score,total_questions,completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase.from("questions").select("*", { count: "exact", head: true }),
  ]);

  const formats = [
    { taille: 25, duree: 35, niveau: "Rapide", description: "Révision ciblée pour tester vos connaissances en peu de temps.", icone: "⚡" },
    { taille: 50, duree: 70, niveau: "Intermédiaire", description: "Une simulation équilibrée pour mesurer votre endurance et vos acquis.", icone: "◫" },
    { taille: 100, duree: 140, niveau: "Complet", description: "La simulation la plus complète pour vous placer en conditions d’examen.", icone: "▣" },
  ];

  const dernierScore = sessions?.[0] ? pourcentage(sessions[0].score, sessions[0].total_questions) : null;

  return (
    <div className="exam-shell">
      <aside className="exam-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup">
          <span className="brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>
        <nav className="side-nav">
          <Link href="/tableau-de-bord">⌂ <span>Accueil</span></Link>
          <Link href="/pratique">✎ <span>Questions</span></Link>
          <Link className="active" href="/examens">▣ <span>Examens</span></Link>
          <Link href="/questions-incorrectes">⊗ <span>Questions incorrectes</span></Link>
          <Link href="/favoris">♡ <span>Favoris</span></Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
        </nav>
        <div className="exam-sidebar-note">
          <strong>Conseil d’examen</strong>
          <p>Choisissez un format adapté à votre temps disponible et terminez la simulation sans interruption.</p>
        </div>
      </aside>

      <main className="exam-main">
        <header className="exam-topbar">
          <div>
            <span className="exam-breadcrumb">Accueil / Examens</span>
            <h1>Simulations d’examen</h1>
          </div>
          <Link href="/tableau-de-bord" className="exam-back-link">← Tableau de bord</Link>
        </header>

        <section className="exam-content">
          <div className="exam-hero">
            <div>
              <span className="exam-eyebrow">Préparation en conditions réelles</span>
              <h2>Choisissez votre simulation</h2>
              <p>Chaque examen est chronométré. Votre score et toutes vos réponses sont enregistrés afin de suivre votre progression.</p>
            </div>
            <div className="exam-hero-stats">
              <div><span>Banque disponible</span><strong>{totalQuestions ?? 0}</strong><small>questions</small></div>
              <div><span>Examens terminés</span><strong>{sessions?.length ?? 0}</strong><small>récents</small></div>
              <div><span>Dernier score</span><strong>{dernierScore === null ? "—" : `${dernierScore}%`}</strong><small>performance</small></div>
            </div>
          </div>

          <div className="exam-format-grid">
            {formats.map((f, index) => (
              <article className={`exam-format-card ${index === 1 ? "recommended" : ""}`} key={f.taille}>
                {index === 1 && <span className="exam-recommended-badge">Recommandé</span>}
                <div className="exam-format-icon">{f.icone}</div>
                <span className="exam-format-level">{f.niveau}</span>
                <h3>{f.taille} questions</h3>
                <p>{f.description}</p>
                <div className="exam-format-meta">
                  <span>◷ {f.duree} min</span>
                  <span>✓ Correction finale</span>
                  <span>↗ Score enregistré</span>
                </div>
                <Link className="exam-start-button" href={`/examens/${f.taille}`}>Commencer l’examen <span>→</span></Link>
              </article>
            ))}
          </div>

          <div className="exam-lower-grid">
            <section className="exam-info-panel">
              <div className="exam-panel-heading"><div><span className="exam-eyebrow">Comment ça fonctionne</span><h2>Une simulation simple et efficace</h2></div></div>
              <div className="exam-steps">
                <div><b>1</b><span><strong>Choisissez un format</strong><small>25, 50 ou 100 questions.</small></span></div>
                <div><b>2</b><span><strong>Répondez sous chronomètre</strong><small>Vous pouvez naviguer entre les questions.</small></span></div>
                <div><b>3</b><span><strong>Analysez votre résultat</strong><small>Score, réponses et historique sont enregistrés.</small></span></div>
              </div>
            </section>

            <section className="exam-history-panel">
              <div className="exam-panel-heading"><div><span className="exam-eyebrow">Historique récent</span><h2>Vos dernières simulations</h2></div><Link href="/historique">Voir tout</Link></div>
              {!sessions?.length ? (
                <div className="exam-empty-history"><span>▣</span><p>Votre premier résultat apparaîtra ici après une simulation.</p></div>
              ) : sessions.map((session) => {
                const score = pourcentage(session.score, session.total_questions);
                return (
                  <Link href={`/resultats/${session.id}`} className="exam-history-row" key={session.id}>
                    <span className="exam-history-icon">✓</span>
                    <div><strong>{session.total_questions} questions</strong><small>{formatDate(session.completed_at)}</small></div>
                    <b className={score >= 70 ? "success" : "needs-work"}>{score}%</b>
                    <span>›</span>
                  </Link>
                );
              })}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
