import { StudentMenuButton } from "@/components/StudentMenuContext";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function TableauDeBord() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const email = String(claimsData.claims.email ?? "Étudiant");

  const [
    { data: profil },
    { data: reponses },
    { data: sessions },
    { count: favoris },
    { count: totalQuestionsCount },
    { count: historicalExamCount },
  ] = await Promise.all([
    supabase.from("profiles").select("nom_complet,role").eq("id", userId).single(),
    supabase
      .from("user_answers")
      .select(`correcte,answered_at,question_id,questions(categorie,question)`)
      .eq("user_id", userId)
      .order("answered_at", { ascending: false })
      .limit(5000),
    supabase
      .from("exam_sessions")
      .select("id,mode,score,total_questions,completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(500),
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase.from("exam_banks").select("id", { count: "exact", head: true }),
  ]);

  const totalTentatives = reponses?.length ?? 0;
  const questionsRepondues = new Set((reponses ?? []).map((r: any) => String(r.question_id))).size;
  const totalQuestions = totalQuestionsCount ?? 0;
  const progressionQuestions = totalQuestions > 0
    ? Math.min(100, Math.round((questionsRepondues / totalQuestions) * 100))
    : 0;

  const bonnes = (reponses ?? []).filter((r: any) => r.correcte).length;
  const taux = totalTentatives ? Math.round((bonnes / totalTentatives) * 100) : 0;
  const nom = profil?.nom_complet || email;
  const prenom = nom.split(" ")[0];

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
    .map(([categorie, v]) => ({
      categorie,
      valeur: v.total ? Math.round((v.bonnes / v.total) * 100) : 0,
      questions: v.total,
    }))
    .sort((a, b) => b.valeur - a.valeur)
    .slice(0, 6);

  const plusFaible = progression.length
    ? [...progression].sort((a, b) => a.valeur - b.valeur)[0]
    : { categorie: "Pharmacologie", valeur: 0, questions: 0 };

  const seen = new Set<string>();
  const incorrectes = (reponses ?? []).filter((r: any) => {
    if (r.correcte || seen.has(r.question_id)) return false;
    seen.add(r.question_id);
    return true;
  });

  const examensCompletes = new Set((sessions ?? []).map((session: any) => session.mode).filter(Boolean)).size;
  const examensDisponibles = (historicalExamCount ?? 0) + 3;
  const serieEtude = totalTentatives > 0 ? Math.min(6, Math.max(1, Math.ceil(totalTentatives / 25))) : 0;

  return (
    <div className="dashboard-shell modern-dashboard">
      <aside className="dashboard-sidebar modern-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup modern-brand">
          <span className="brand-mark">♡</span>
          <span><strong>Haiti Nursing</strong><small>Exam Prep</small></span>
        </Link>

        <nav className="side-nav modern-nav">
          <Link className="active" href="/tableau-de-bord">⌂ <span>Accueil</span></Link>
          <Link href="/pratique">▤ <span>Questions</span></Link>
          <Link href="/examens">▣ <span>Examens</span></Link>
          <Link href="/historique">▥ <span>Plan d’étude</span></Link>
          <Link href="/performance">⌁ <span>Performance</span></Link>
          <Link href="/questions-incorrectes">◴ <span>Questions incorrectes</span>{incorrectes.length > 0 && <b>{incorrectes.length}</b>}</Link>
          <Link href="/favoris">♡ <span>Favoris</span>{(favoris ?? 0) > 0 && <b>{favoris}</b>}</Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
          <Link href="/questions-reelles">▧ <span>Ressources</span></Link>
          {profil?.role === "admin" && <Link href="/admin">⚙ <span>Administration</span></Link>}
        </nav>

        <div className="premium-box modern-premium">
          <div className="premium-title">♛ Passe Premium</div>
          <p>Accédez à toutes les fonctionnalités Premium.</p>
          <button disabled>Prochainement</button>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">{prenom.charAt(0).toUpperCase()}</div>
          <div><strong>{nom}</strong><small>{profil?.role === "admin" ? "Administrateur" : "Étudiant"}</small></div>
        </div>
        <BoutonDeconnexion />
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar modern-topbar">
          <StudentMenuButton />
          <div className="dashboard-search">⌕ <span>Rechercher (ex: pharmacologie, pédiatrie...)</span></div>
          <div className="topbar-spacer" />
          <div className="study-streak">🔥 <span><small>Série d’étude</small><strong>{serieEtude} jours</strong></span></div>
          <div className="notif">♢<span>1</span></div>
          <div className="top-user"><div className="avatar small">{prenom.charAt(0).toUpperCase()}</div><span>Bonjour, {prenom}</span></div>
        </header>

        <section className="dashboard-content modern-content">
          <div className="welcome-row modern-welcome">
            <div>
              <h1>Bonjour, {prenom} ! 👋</h1>
              <p>Prêt(e) à continuer votre préparation aujourd’hui ?</p>
            </div>
            <Link className="continue-button" href="/pratique">CONTINUER À PRATIQUER →</Link>
          </div>

          <div className="metric-grid modern-metrics">
            <div className="metric-card"><span className="metric-icon blue">?</span><div><small>Questions répondues</small><strong>{questionsRepondues.toLocaleString("fr-FR")} <i>/ {totalQuestions.toLocaleString("fr-FR")}</i></strong><div className="mini-progress"><span style={{ width: `${progressionQuestions}%` }} /></div><em>{progressionQuestions}% complété</em></div></div>
            <div className="metric-card"><span className="metric-icon green">✓</span><div><small>Taux de réussite</small><strong>{taux}%</strong><em>{bonnes} bonnes réponses</em></div></div>
            <div className="metric-card"><span className="metric-icon purple">▣</span><div><small>Examens complétés</small><strong>{examensCompletes} <i>/ {examensDisponibles}</i></strong><em>{examensDisponibles} formats disponibles</em></div></div>
            <div className="metric-card"><span className="metric-icon orange">🔥</span><div><small>Série d’étude</small><strong>{serieEtude} jours</strong><em>Continuez votre série !</em></div></div>
          </div>

          <div className="mock-grid">
            <div className="mock-main-column">
              <section className="panel progress-panel">
                <div className="panel-heading"><h2>Votre progression par matière</h2><Link href="/performance">Voir tout</Link></div>
                {progression.length > 0 ? progression.map((item, index) => (
                  <div className="subject-row" key={item.categorie}>
                    <span className={`subject-dot c${index + 1}`}>{["♟","♙","♧","◇","◉","♢"][index]}</span>
                    <strong>{item.categorie}</strong>
                    <div className="bar"><i style={{ width: `${item.valeur}%` }} /></div>
                    <b>{item.valeur}%</b>
                    <small>{item.questions} questions</small>
                  </div>
                )) : <p className="empty-state">Commencez à pratiquer pour afficher votre progression par matière.</p>}
              </section>

              <section className="panel state-exams-panel">
                <div className="panel-heading"><h2>Examens disponibles</h2><Link href="/examens">Voir tous</Link></div>
                <div className="state-exam-grid">
                  {[25, 50, 100].map((taille, index) => (
                    <div className="state-exam-card" key={taille}>
                      <span className={`exam-doc e${index + 1}`}>▤</span>
                      <strong>Simulation {taille}</strong>
                      <small>{taille} questions</small>
                      <p>Mode chronométré</p>
                      <Link href={`/examens/${taille}`}>Commencer →</Link>
                    </div>
                  ))}
                  <div className="state-exam-card upcoming-exam">
                    <span className="exam-doc e4">★</span>
                    <strong>Examens d’État</strong>
                    <small>Banque historique</small>
                    <p>{historicalExamCount ?? 0} examens reconstitués</p>
                    <Link href="/examens">Découvrir →</Link>
                  </div>
                </div>
              </section>
            </div>

            <div className="mock-side-column">
              <section className="panel focus-panel">
                <div className="panel-heading"><h2>À travailler davantage</h2></div>
                <div className="focus-card">
                  <span>◇</span>
                  <div><strong>{plusFaible.categorie}</strong><b>{plusFaible.valeur}% de maîtrise</b></div>
                </div>
                <div className="bar focus-bar"><i style={{ width: `${plusFaible.valeur}%` }} /></div>
                <p className="focus-target">Cible : 70%</p>
                <strong className="incorrect-count">{incorrectes.length} questions incorrectes</strong>
                <Link className="review-button" href="/questions-incorrectes">RÉVISER MAINTENANT</Link>
              </section>

              <section className="panel today-panel">
                <h2>Activité aujourd’hui</h2>
                <Link href="/pratique" className="today-task"><span>▤</span><div><strong>25 questions</strong><small>Médecine</small></div><i>○</i></Link>
                <Link href="/pratique" className="today-task"><span>♙</span><div><strong>15 questions</strong><small>Pédiatrie</small></div><i>○</i></Link>
                <Link href="/questions-incorrectes" className="today-task"><span>▣</span><div><strong>Réviser</strong><small>{Math.min(8, incorrectes.length)} questions incorrectes</small></div><i>○</i></Link>
                <Link className="plan-link" href="/historique">Voir le plan complet →</Link>
              </section>

              <section className="panel ai-panel">
                <div className="ai-badge">IA</div>
                <div><strong>Nightingale AI</strong><p>Votre tuteur infirmier personnel pour expliquer les concepts difficiles.</p></div>
                <Link href="/nightingale">Poser une question →</Link>
              </section>
            </div>
          </div>

          <div className="dashboard-benefits">
            <div><span>▤</span><p><strong>Questions de haute qualité</strong>Basées sur votre préparation infirmière.</p></div>
            <div><span>◉</span><p><strong>Explications détaillées</strong>Comprenez chaque concept en profondeur.</p></div>
            <div><span>▥</span><p><strong>Suivi intelligent</strong>Identifiez vos points faibles.</p></div>
            <div><span>🏆</span><p><strong>Objectif réussite</strong>Étudiez efficacement et progressez.</p></div>
          </div>
        </section>
      </main>

      <style>{`
        .modern-dashboard{background:#f7f9fd}.modern-sidebar{width:auto}.modern-brand .brand-mark{background:#2474ff;color:white;border:0;border-radius:50%}.modern-brand strong{color:white;font-size:18px}.modern-brand small{color:#d9e6ff;letter-spacing:0;font-size:12px;text-transform:none}.modern-nav a.active{background:#2474ff}.modern-nav b{background:#ef4b58}.modern-premium{border-color:#ba943e}.modern-premium button{background:#ffcf61;color:#132238}.modern-topbar{height:78px}.dashboard-search{min-width:370px;display:flex;align-items:center;gap:10px;background:#f7f9fc;border:1px solid #edf0f5;border-radius:24px;padding:11px 16px;color:#96a0b5;font-size:12px}.study-streak{display:flex;align-items:center;gap:8px;padding:0 12px}.study-streak span{display:grid}.study-streak small{font-size:10px;color:#69738d}.study-streak strong{font-size:12px;color:#ef7d00}.modern-content{max-width:1400px}.modern-welcome{align-items:center;margin-bottom:18px}.continue-button{margin-left:auto;background:#2474ff;color:#fff;border-radius:9px;padding:14px 22px;font-size:11px;font-weight:800;box-shadow:0 8px 18px rgba(36,116,255,.2)}.modern-metrics{margin-top:0}.metric-card strong i{font-size:11px;font-style:normal;color:#6e7891;font-weight:600}.mini-progress{height:5px;background:#edf1f7;border-radius:10px;overflow:hidden;margin:7px 0}.mini-progress span{display:block;height:100%;background:#2474ff}.mock-grid{display:grid;grid-template-columns:1.75fr .85fr;gap:16px}.mock-main-column,.mock-side-column{display:grid;gap:16px;align-content:start}.progress-panel{padding:20px}.subject-row{display:grid;grid-template-columns:30px minmax(115px,1fr) 1.5fr 45px 86px;align-items:center;gap:10px;padding:10px 0;font-size:11px}.subject-dot{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#eaf2ff;color:#2474ff}.subject-row:nth-of-type(3) .bar i{background:#23b26d}.subject-row:nth-of-type(4) .bar i{background:#ef5f87}.subject-row:nth-of-type(5) .bar i{background:#7d5ce8}.subject-row:nth-of-type(6) .bar i{background:#f4a62a}.subject-row small{color:#7b8499}.focus-card{background:#f7f5ff;border-radius:10px;padding:18px;display:flex;gap:12px;align-items:center}.focus-card>span{font-size:28px;color:#7d5ce8}.focus-card strong,.focus-card b{display:block}.focus-card b{font-size:12px;color:#ff7c31;margin-top:5px}.focus-bar{margin:14px 0 5px}.focus-bar i{background:#7d5ce8}.focus-target{text-align:right;font-size:10px;color:#7b8499}.incorrect-count{display:block;color:#ef4b58;font-size:13px;margin:18px 0}.review-button{display:block;border:1px solid #2474ff;color:#2474ff;text-align:center;border-radius:8px;padding:11px;font-size:11px;font-weight:800}.today-panel h2{margin-bottom:8px}.today-task{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:13px 0;border-bottom:1px solid #edf0f5}.today-task>span{width:30px;height:30px;border-radius:9px;background:#eaf2ff;color:#2474ff;display:grid;place-items:center}.today-task div strong,.today-task div small{display:block}.today-task div strong{font-size:11px}.today-task div small{font-size:10px;color:#69738d;margin-top:3px}.today-task i{font-style:normal;color:#9da7bb}.plan-link{display:block;margin-top:13px;color:#2474ff;font-size:11px;font-weight:700}.ai-panel{display:grid;grid-template-columns:40px 1fr;gap:10px;align-items:center}.ai-badge{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#7d5ce8;color:white;font-weight:800}.ai-panel strong{font-size:13px}.ai-panel p{font-size:10px;color:#6d7790;line-height:1.5;margin:4px 0}.ai-panel>a{grid-column:2;color:#2474ff;font-size:10px;font-weight:700}.state-exam-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.state-exam-card{border:1px solid #e7ebf3;border-radius:10px;padding:14px;display:grid;gap:5px}.exam-doc{width:32px;height:32px;border-radius:9px;background:#eaf2ff;color:#2474ff;display:grid;place-items:center}.state-exam-card strong{font-size:12px}.state-exam-card small,.state-exam-card p{font-size:10px;color:#6e7891;margin:0}.state-exam-card a{border:1px solid #2474ff;color:#2474ff;border-radius:7px;text-align:center;padding:8px;margin-top:5px;font-size:10px;font-weight:700}.state-exam-card:nth-child(2) .exam-doc{background:#e9f8ef;color:#1caf65}.state-exam-card:nth-child(3) .exam-doc{background:#f1edff;color:#7d5ce8}.state-exam-card:nth-child(4) .exam-doc{background:#fff3e8;color:#f18a22}.dashboard-benefits{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#fff;border:1px solid #e7ebf3;border-radius:13px;margin-top:16px;padding:18px}.dashboard-benefits>div{display:flex;align-items:flex-start;gap:10px}.dashboard-benefits>div>span{font-size:24px;color:#2474ff}.dashboard-benefits p{margin:0;font-size:10px;color:#65708a;line-height:1.5}.dashboard-benefits strong{display:block;color:#17213f;font-size:11px;margin-bottom:3px}
        @media(max-width:1100px){.mock-grid{grid-template-columns:1fr}.state-exam-grid{grid-template-columns:repeat(2,1fr)}.dashboard-search{min-width:260px}.dashboard-benefits{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:800px){.modern-sidebar{display:none}.modern-topbar{height:64px}.dashboard-search,.study-streak,.notif{display:none}.modern-content{padding:16px 14px 90px}.modern-welcome{display:block}.continue-button{display:block;margin:16px 0 0;text-align:center}.modern-metrics{grid-template-columns:repeat(2,1fr)!important}.metric-card{min-height:118px;padding:13px}.subject-row{grid-template-columns:30px 1fr 45px}.subject-row .bar{grid-column:2/4}.subject-row small{display:none}.state-exam-grid{grid-template-columns:1fr 1fr}.dashboard-benefits{grid-template-columns:1fr}.top-user{margin-left:auto}.mock-grid{grid-template-columns:1fr}.modern-welcome h1{font-size:24px}.modern-welcome p{font-size:12px}}
      `}</style>
    </div>
  );
}
