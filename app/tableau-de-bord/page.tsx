import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import type { CSSProperties } from "react";

function pct(score: number | null, total: number | null) {
  return total ? Math.round(((score ?? 0) / total) * 100) : 0;
}

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

  const [{ data: profil }, { data: reponses }, { data: sessions }, { count: favoris }] = await Promise.all([
    supabase.from("profiles").select("nom_complet,role").eq("id", userId).single(),
    supabase.from("user_answers").select(`correcte,answered_at,question_id,questions(categorie,question)`).order("answered_at", { ascending: false }).limit(500),
    supabase.from("exam_sessions").select("id,mode,score,total_questions,completed_at").not("completed_at", "is", null).order("completed_at", { ascending: false }).limit(6),
    supabase.from("favorites").select("*", { count: "exact", head: true }),
  ]);

  const total = reponses?.length ?? 0;
  const bonnes = (reponses ?? []).filter((r: any) => r.correcte).length;
  const taux = total ? Math.round((bonnes / total) * 100) : 0;
  const nom = profil?.nom_complet || email;
  const prenom = nom.split(" ")[0];
  const derniere = sessions?.[0];

  const categories = new Map<string, { total: number; bonnes: number }>();
  for (const r of reponses ?? []) {
    const q: any = Array.isArray((r as any).questions) ? (r as any).questions[0] : (r as any).questions;
    const cat = q?.categorie || "Autres";
    const current = categories.get(cat) ?? { total: 0, bonnes: 0 };
    current.total += 1;
    if ((r as any).correcte) current.bonnes += 1;
    categories.set(cat, current);
  }
  const progression = [...categories.entries()]
    .map(([categorie, v]) => ({ categorie, valeur: v.total ? Math.round((v.bonnes / v.total) * 100) : 0 }))
    .sort((a, b) => b.valeur - a.valeur)
    .slice(0, 5);

  const seen = new Set<string>();
  const incorrectes = (reponses ?? []).filter((r: any) => {
    if (r.correcte || seen.has(r.question_id)) return false;
    seen.add(r.question_id);
    return true;
  }).slice(0, 3);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup">
          <span className="brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>

        <nav className="side-nav">
          <Link className="active" href="/tableau-de-bord">⌂ <span>Tableau de bord</span></Link>
          <Link href="/pratique">✎ <span>Pratique de questions</span></Link>
          <Link href="/examens">▣ <span>Simulations d’examen</span></Link>
          <Link href="/questions-reelles">▦ <span>Catégories</span></Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
          <Link href="/questions-incorrectes">⊗ <span>Questions incorrectes</span></Link>
          <Link href="/favoris">♡ <span>Favoris</span>{(favoris ?? 0) > 0 && <b>{favoris}</b>}</Link>
          <Link href="/historique">↗ <span>Historique</span></Link>
          {profil?.role === "admin" && <Link href="/admin">⚙ <span>Administration</span></Link>}
        </nav>

        <div className="premium-box">
          <div className="premium-title">👑 Passer à Premium</div>
          <p>Accédez à plus de questions, analyses avancées et explications détaillées.</p>
          <button disabled>Prochainement</button>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">{prenom.charAt(0).toUpperCase()}</div>
          <div><strong>{nom}</strong><small>{profil?.role === "admin" ? "Administrateur" : "Étudiant"}</small></div>
        </div>
        <BoutonDeconnexion />
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="menu-button" aria-label="Menu">☰</button>
          <div className="topbar-spacer" />
          <button className="language-pill">🇫🇷 Français⌄</button>
          <button className="language-pill">🇭🇹 Kreyòl Ayisyen</button>
          <div className="notif">♢<span>1</span></div>
          <div className="top-user"><div className="avatar small">{prenom.charAt(0).toUpperCase()}</div><span>{prenom}</span></div>
        </header>

        <section className="dashboard-content">
          <div className="welcome-row">
            <div>
              <h1>Bonjour, {prenom} ! 👋</h1>
              <p>Voici le résumé de votre activité et de votre progression.</p>
            </div>
            <div className="nurse-accent" aria-hidden="true">🩺</div>
          </div>

          <div className="metric-grid">
            <div className="metric-card"><span className="metric-icon blue">▤</span><div><small>Questions répondues</small><strong>{total}</strong><em>Activité enregistrée</em></div></div>
            <div className="metric-card"><span className="metric-icon green">✓</span><div><small>Taux de réussite</small><strong>{taux}%</strong><em>{bonnes} bonnes réponses</em></div></div>
            <div className="metric-card"><span className="metric-icon purple">▣</span><div><small>Examens complétés</small><strong>{sessions?.length ?? 0}</strong><em>Sessions récentes</em></div></div>
            <div className="metric-card"><span className="metric-icon orange">◷</span><div><small>Favoris</small><strong>{favoris ?? 0}</strong><em>Questions sauvegardées</em></div></div>
          </div>

          <div className="dashboard-columns">
            <div className="dashboard-leftcol">
              <section className="panel">
                <div className="panel-heading"><h2>Progression par catégorie</h2><Link href="/pratique">Voir tout</Link></div>
                {progression.length > 0 ? progression.map((item) => (
                  <div className="category-row" key={item.categorie}>
                    <span>{item.categorie}</span><div className="bar"><i style={{ width: `${item.valeur}%` }} /></div><b>{item.valeur}%</b>
                  </div>
                )) : <p className="empty-state">Commencez à pratiquer pour voir votre progression.</p>}
              </section>

              <section className="panel incorrect-panel">
                <div className="panel-heading"><h2>Questions incorrectes récentes</h2><Link href="/questions-incorrectes">Voir tout</Link></div>
                {incorrectes.length ? incorrectes.map((r: any) => {
                  const q: any = Array.isArray(r.questions) ? r.questions[0] : r.questions;
                  return <div className="wrong-row" key={r.question_id}><span className="wrong-dot">×</span><div><strong>{q?.categorie || "Question"}</strong><p>{q?.question}</p></div><span className="wrong-date">{formatDate(r.answered_at)}</span><Link href="/questions-incorrectes">Réviser</Link></div>;
                }) : <div className="success-empty">✓ Aucune question incorrecte récente.</div>}
              </section>
            </div>

            <div className="dashboard-midcol">
              <section className="panel latest-exam">
                <div className="panel-heading"><h2>Dernière simulation d’examen</h2><Link href="/historique">Voir tout</Link></div>
                {derniere ? <>
                  <div className="exam-title"><strong>{derniere.mode.replace("examen_", "Examen ").replace("_", " ")} questions</strong><span>Terminé</span></div>
                  <div className="exam-score-row"><div className="score-ring" style={{ "--score": `${pct(derniere.score, derniere.total_questions) * 3.6}deg` } as CSSProperties}><div>{pct(derniere.score, derniere.total_questions)}%</div></div><div><small>Score</small><strong>{derniere.score}/{derniere.total_questions}</strong><p>{formatDate(derniere.completed_at)}</p></div></div>
                  <Link className="outline-action" href={`/resultats/${derniere.id}`}>Revoir cet examen</Link>
                </> : <p className="empty-state">Aucun examen terminé pour le moment.</p>}
              </section>
            </div>

            <div className="dashboard-rightcol">
              <section className="panel quick-panel">
                <h2>Actions rapides</h2>
                <div className="quick-grid">
                  <Link href="/pratique"><span>▤</span>Pratique</Link>
                  <Link href="/examens/25"><span>▣</span>Examen 25</Link>
                  <Link href="/nightingale"><span>✦</span>Nightingale</Link>
                  <Link href="/questions-incorrectes"><span>⊗</span>Incorrectes</Link>
                  <Link href="/favoris"><span>☆</span>Favoris</Link>
                </div>
              </section>

              <section className="panel performance-panel">
                <h2>Votre performance</h2>
                <div className="performance-body"><div className="score-ring large" style={{ "--score": `${taux * 3.6}deg` } as CSSProperties}><div>{taux}%</div></div><div><strong>{taux >= 70 ? "Vous êtes sur la bonne voie !" : "Continuez votre progression"}</strong><p>Chaque session vous rapproche de votre objectif.</p></div></div>
                <Link className="outline-action compact" href="/historique">Voir les statistiques</Link>
              </section>

              <section className="panel exams-panel">
                <div className="panel-heading"><h2>Vos examens</h2><Link href="/historique">Voir tout</Link></div>
                {(sessions ?? []).slice(0,3).map((s) => <Link href={`/resultats/${s.id}`} className="history-row" key={s.id}><span>◷</span><div><strong>{s.mode.replace("examen_", "Examen ")} questions</strong><small>{formatDate(s.completed_at)}</small></div><b className={pct(s.score,s.total_questions) >= 70 ? "good" : "warn"}>{pct(s.score,s.total_questions)}%</b></Link>)}
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
