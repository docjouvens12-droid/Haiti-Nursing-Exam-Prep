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
  const [{ data: sessions }, { count: totalQuestions }, { data: banques }] = await Promise.all([
    supabase
      .from("exam_sessions")
      .select("id,mode,score,total_questions,completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase.from("questions").select("*", { count: "exact", head: true }),
    supabase
      .from("exam_banks")
      .select("id,annee,titre,authenticite,total_questions")
      .order("annee", { ascending: false }),
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
            <h1>Examens</h1>
          </div>
          <Link href="/tableau-de-bord" className="exam-back-link">← Tableau de bord</Link>
        </header>

        <section className="exam-content">
          <div className="exam-hero">
            <div>
              <span className="exam-eyebrow">Préparation en conditions réelles</span>
              <h2>Testez vos connaissances comme à l’examen</h2>
              <p>Choisissez une simulation, travaillez sous chronomètre et retrouvez ensuite votre score dans l’historique.</p>
            </div>
            <div className="exam-hero-stats">
              <div><span>Banque disponible</span><strong>{totalQuestions ?? 0}</strong><small>questions</small></div>
              <div><span>Examens reconstitués</span><strong>{banques?.length ?? 0}</strong><small>banques</small></div>
              <div><span>Dernier score</span><strong>{dernierScore === null ? "—" : `${dernierScore}%`}</strong><small>performance</small></div>
            </div>
          </div>

          <section className="exam-section exam-simulations-section">
            <div className="exam-section-heading">
              <div><span className="exam-section-number">01</span><div><span className="exam-eyebrow">Simulations chronométrées</span><h2>Choisissez votre format</h2><p>25, 50 ou 100 questions selon le temps dont vous disposez.</p></div></div>
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
                  <Link className="exam-start-button" href={`/examens/${f.taille}`}>Commencer <span>→</span></Link>
                </article>
              ))}
            </div>
          </section>

          <section className="exam-bank-section exam-section">
            <div className="exam-section-heading exam-bank-heading">
              <div><span className="exam-section-number">02</span><div><span className="exam-eyebrow">Préparation historique</span><h2>Examens d’État reconstitués</h2><p>Banques 2010–2023 conçues pour la préparation. Elles ne sont pas présentées comme des questionnaires officiels du MSPP/DFPSS.</p></div></div>
              <span className="exam-bank-count">{banques?.length ?? 0} examens</span>
            </div>

            {!banques?.length ? (
              <div className="exam-empty-history"><span>▣</span><p>Aucune banque historique n’est encore disponible.</p></div>
            ) : (
              <div className="exam-bank-grid">
                {banques.map((banque) => (
                  <article className="exam-bank-card" key={banque.id}>
                    <div className="exam-bank-card-top">
                      <span className="exam-bank-year">{banque.annee}</span>
                      <span className="exam-bank-auth">Reconstitué</span>
                    </div>
                    <h3>Examen {banque.annee}</h3>
                    <p>Préparation Examen d’État Haïtien</p>
                    <div className="exam-bank-meta">
                      <span>▣ {banque.total_questions} questions</span>
                      <span>◷ 140 min</span>
                    </div>
                    <Link className="exam-bank-button" href={`/examens/banque/${banque.id}`}>Commencer →</Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="exam-section exam-history-section">
            <div className="exam-section-heading">
              <div><span className="exam-section-number">03</span><div><span className="exam-eyebrow">Vos résultats</span><h2>Historique des examens terminés</h2><p>Retrouvez vos dernières simulations et ouvrez le détail de chaque résultat.</p></div></div>
              <Link href="/historique">Voir tout</Link>
            </div>

            <div className="exam-history-panel exam-history-panel-full">
              {!sessions?.length ? (
                <div className="exam-empty-history"><span>▣</span><p>Votre premier résultat apparaîtra ici après une simulation.</p></div>
              ) : sessions.map((session) => {
                const score = pourcentage(session.score, session.total_questions);
                return (
                  <Link href={`/resultats/${session.id}`} className="exam-history-row" key={session.id}>
                    <span className="exam-history-icon">✓</span>
                    <div><strong>{session.mode?.startsWith("examen_reconstitue_") ? `Examen reconstitué ${session.mode.replace("examen_reconstitue_", "")}` : `${session.total_questions} questions`}</strong><small>{formatDate(session.completed_at)}</small></div>
                    <b className={score >= 70 ? "success" : "needs-work"}>{score}%</b>
                    <span>›</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="exam-info-panel exam-how-panel">
            <div className="exam-panel-heading"><div><span className="exam-eyebrow">Comment ça fonctionne</span><h2>Une simulation simple et efficace</h2></div></div>
            <div className="exam-steps">
              <div><b>1</b><span><strong>Choisissez un format</strong><small>25, 50 ou 100 questions, ou une banque historique.</small></span></div>
              <div><b>2</b><span><strong>Répondez sous chronomètre</strong><small>Vous pouvez naviguer entre les questions.</small></span></div>
              <div><b>3</b><span><strong>Analysez votre résultat</strong><small>Score, réponses et historique sont enregistrés.</small></span></div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
