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

type Stat = { total: number; bonnes: number };

export default async function PerformancePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const [{ data: reponses }, { data: sessions }] = await Promise.all([
    supabase
      .from("user_answers")
      .select(`correcte,answered_at,question_id,questions(categorie,sous_categorie)`)
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

  const categories = new Map<string, Stat>();
  const thematiques = new Map<string, Stat & { categorie: string; thematique: string }>();

  for (const r of reponses ?? []) {
    const q: any = Array.isArray((r as any).questions) ? (r as any).questions[0] : (r as any).questions;
    const categorie = q?.categorie || "Autres";
    const thematique = q?.sous_categorie || "Autres";

    const cat = categories.get(categorie) ?? { total: 0, bonnes: 0 };
    cat.total += 1;
    if ((r as any).correcte) cat.bonnes += 1;
    categories.set(categorie, cat);

    const key = `${categorie}|||${thematique}`;
    const topic = thematiques.get(key) ?? { categorie, thematique, total: 0, bonnes: 0 };
    topic.total += 1;
    if ((r as any).correcte) topic.bonnes += 1;
    thematiques.set(key, topic);
  }

  const progression = [...categories.entries()]
    .map(([categorie, value]) => ({ categorie, total: value.total, taux: value.total ? Math.round((value.bonnes / value.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);

  const progressionThematiques = [...thematiques.values()]
    .map((value) => ({ ...value, taux: value.total ? Math.round((value.bonnes / value.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total || a.taux - b.taux);

  const thematiquesFiables = progressionThematiques.filter((item) => item.total >= 3);
  const meilleure = progression.length ? [...progression].sort((a, b) => b.taux - a.taux)[0] : null;
  const plusFaible = progression.length ? [...progression].sort((a, b) => a.taux - b.taux)[0] : null;
  const thematiqueFaible = thematiquesFiables.length ? [...thematiquesFiables].sort((a, b) => a.taux - b.taux || b.total - a.total)[0] : null;
  const nonCorrectes = total - bonnes;

  return (
    <div className="performance-shell">
      <aside className="performance-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup"><span className="brand-mark">✚</span><span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span></Link>
        <nav>
          <Link href="/tableau-de-bord">Accueil</Link>
          <Link href="/pratique">Questions</Link>
          <Link href="/categories">Catégories & thématiques</Link>
          <Link href="/examens">Examens</Link>
          <Link href="/historique">Historique</Link>
          <Link className="active" href="/performance">Performance</Link>
          <Link href="/nightingale">Nightingale AI</Link>
        </nav>
      </aside>

      <main className="performance-main">
        <header className="performance-topbar"><div><span className="performance-breadcrumb">Accueil / Performance</span><h1>Performance</h1></div><Link href="/pratique">Continuer à pratiquer →</Link></header>

        <section className="performance-content">
          <div className="performance-metrics">
            <div className="performance-metric"><span>Questions répondues</span><strong>{total}</strong><small>Sur votre activité enregistrée</small></div>
            <div className="performance-metric"><span>Taux de réussite</span><strong>{taux}%</strong><small>{bonnes} bonnes réponses</small></div>
            <div className="performance-metric"><span>Examens récents</span><strong>{totalExamens}</strong><small>Sessions terminées affichées</small></div>
            <div className="performance-metric"><span>Moyenne examens</span><strong>{moyenneExamens}%</strong><small>Calculée sur les sessions récentes</small></div>
          </div>

          <div className="performance-grid">
            <section className="performance-panel">
              <h2>Maîtrise par catégorie</h2>
              <p>Taux de réussite calculé à partir de vos réponses enregistrées.</p>
              {progression.map((item) => (
                <div className="performance-subject" key={item.categorie}>
                  <strong>{item.categorie}<small>{item.total} réponses</small></strong>
                  <div className="performance-bar"><i style={{ width: `${item.taux}%` }} /></div>
                  <b>{item.taux}%</b>
                </div>
              ))}
              {progression.length === 0 && <div className="performance-empty">Commencez à répondre à des questions pour afficher votre performance.</div>}
            </section>

            <section className="performance-panel">
              <h2>Analyse personnalisée</h2>
              <p>Vos résultats orientent automatiquement les prochaines révisions.</p>
              <div className="performance-insight">
                <div className="performance-insight-card"><span>Point fort</span><strong>{meilleure?.categorie ?? "À déterminer"}</strong><small>{meilleure ? `${meilleure.taux}% de réussite sur ${meilleure.total} réponses` : "Davantage de réponses sont nécessaires."}</small></div>
                <div className="performance-insight-card"><span>Catégorie à renforcer</span><strong>{plusFaible?.categorie ?? "À déterminer"}</strong><small>{plusFaible ? `${plusFaible.taux}% de réussite sur ${plusFaible.total} réponses` : "Davantage de réponses sont nécessaires."}</small></div>
                <div className="performance-insight-card"><span>Thématique à renforcer</span><strong>{thematiqueFaible?.thematique ?? "À déterminer"}</strong><small>{thematiqueFaible ? `${thematiqueFaible.categorie} · ${thematiqueFaible.taux}% sur ${thematiqueFaible.total} réponses` : "Répondez à au moins 3 questions d’une thématique pour obtenir une recommandation."}</small></div>
                <div className="performance-insight-card"><span>Réponses à revoir</span><strong>{nonCorrectes}</strong><small>Réponses incorrectes dans votre activité enregistrée.</small></div>
              </div>
              <div className="performance-actions"><Link href="/questions-incorrectes">Réviser mes erreurs</Link><Link className="secondary" href="/favoris">Voir mes favoris</Link></div>
            </section>
          </div>

          <section className="performance-panel performance-topics">
            <div className="performance-section-heading"><div><h2>Performance par thématique</h2><p>Repérez précisément les sujets maîtrisés et ceux qui nécessitent davantage de pratique.</p></div><Link href="/categories">Voir toutes les thématiques →</Link></div>
            <div className="performance-topic-grid">
              {progressionThematiques.map((item) => (
                <div className="performance-topic-card" key={`${item.categorie}-${item.thematique}`}>
                  <span>{item.categorie}</span>
                  <strong>{item.thematique}</strong>
                  <div className="performance-topic-score"><b>{item.taux}%</b><small>{item.total} réponse{item.total > 1 ? "s" : ""}</small></div>
                  <div className="performance-bar"><i style={{ width: `${item.taux}%` }} /></div>
                  <Link href={`/pratique?categorie=${encodeURIComponent(item.categorie)}&sous_categorie=${encodeURIComponent(item.thematique)}&nombre=25&statut=toutes`}>Pratiquer cette thématique →</Link>
                </div>
              ))}
            </div>
            {progressionThematiques.length === 0 && <div className="performance-empty">Vos statistiques par thématique apparaîtront après vos premières réponses.</div>}
          </section>

          <section className="performance-panel performance-recent">
            <h2>Examens récents</h2><p>Comparez vos derniers résultats et ouvrez la correction détaillée.</p>
            {(sessions ?? []).map((s) => {
              const pct = s.total_questions ? Math.round((s.score / s.total_questions) * 100) : 0;
              return <div className="performance-session" key={s.id}><div><strong>{formatMode(s.mode)}</strong><small>{formatDate(s.completed_at)} · {s.score}/{s.total_questions}</small></div><b>{pct}%</b><Link href={`/resultats/${s.id}`}>Correction</Link></div>;
            })}
            {(!sessions || sessions.length === 0) && <div className="performance-empty">Aucun examen terminé pour le moment.</div>}
          </section>
        </section>
      </main>
    </div>
  );
}
