import { StudentMenuButton } from "@/components/StudentMenuContext";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import type { CSSProperties } from "react";
import "./concept-b.css";

const DAILY_GOAL = 25;
const STUDY_TIME_ZONE = "America/Port-au-Prince";

function dayKey(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof value === "string" ? new Date(value) : value);
}

function addDays(key: string, delta: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta, 12));
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
    { count: availableCourseCount },
    { data: courseProgressRows },
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
    supabase.from("learning_modules").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("learning_module_progress").select("module_id,status,progress_percent").eq("user_id", userId),
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

  const aujourdHui = dayKey(new Date());
  const activiteParJour = new Map<string, number>();
  for (const r of reponses ?? []) {
    if (!(r as any).answered_at) continue;
    const key = dayKey((r as any).answered_at);
    activiteParJour.set(key, (activiteParJour.get(key) ?? 0) + 1);
  }
  const questionsAujourdhui = activiteParJour.get(aujourdHui) ?? 0;
  const objectifPourcentage = Math.min(100, Math.round((questionsAujourdhui / DAILY_GOAL) * 100));
  const objectifRestant = Math.max(0, DAILY_GOAL - questionsAujourdhui);
  const joursEtudies = new Set(activiteParJour.keys());
  let curseur = joursEtudies.has(aujourdHui) ? aujourdHui : addDays(aujourdHui, -1);
  let serieEtude = 0;
  while (joursEtudies.has(curseur)) {
    serieEtude += 1;
    curseur = addDays(curseur, -1);
  }

  const courseTotal = availableCourseCount ?? 0;
  const courseCompleted = new Set((courseProgressRows ?? [])
    .filter((item) => item.status === "completed" || (item.progress_percent ?? 0) >= 100)
    .map((item) => item.module_id)).size;
  const globalItems = [
    { label: "Cours", current: courseCompleted, total: courseTotal, href: "/cours-revisions", tone: "course" },
    { label: "QCM", current: questionsRepondues, total: totalQuestions, href: "/pratique", tone: "qcm" },
    { label: "Examens", current: examensCompletes, total: examensDisponibles, href: "/examens", tone: "exam" },
  ];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(aujourdHui, i - 6);
    const date = new Date(key + "T12:00:00Z");
    const label = new Intl.DateTimeFormat("fr-FR", { weekday: "short", timeZone: "UTC" }).format(date).slice(0, 1).toUpperCase();
    return {key,label,active:joursEtudies.has(key),today:key===aujourdHui};
  });
  const recentAnswer = (reponses ?? [])[0] as any | undefined;
  const lastQuestion = Array.isArray(recentAnswer?.questions) ? recentAnswer.questions[0] : recentAnswer?.questions;
  const resumeCategory = lastQuestion?.categorie || "";
  const recommendedTitle = totalTentatives > 0 && plusFaible.questions > 0 ? plusFaible.categorie : "Soins infirmiers fondamentaux";
  const recommendationLink = totalTentatives > 0 && plusFaible.questions > 0
    ? "/pratique?categorie=" + encodeURIComponent(plusFaible.categorie) + "&nombre=25"
    : "/cours-revisions";
  const recommendationLabel = totalTentatives > 0 && plusFaible.questions > 0
    ? "Domaine à renforcer" : "Parcours recommandé";

  return (
    <div className="dashboard-shell modern-dashboard b-dashboard">
      <aside className="dashboard-sidebar modern-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup modern-brand">
          <img src="/pwa-icon.svg" alt="" width={42} height={42} style={{borderRadius:10,flexShrink:0}} />
          <span><strong>Haiti Nursing</strong><small>Exam Prep</small></span>
        </Link>

        <nav className="side-nav modern-nav">
          <Link className="active" href="/tableau-de-bord">⌂ <span>Accueil</span></Link>
          <Link href="/pratique">▤ <span>Questions</span></Link>
          <Link href="/categories">▦ <span>Catégories & thématiques</span></Link>
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


      <main className="dashboard-main b-home">
        <div className="b-container">
          <header className="b-header">
            <Link href="/tableau-de-bord" className="b-brand" aria-label="Haiti Nursing Exam Prep - Accueil">
              <img src="/hn-logo.svg" alt="Haiti Nursing Exam Prep" width={226} height={68} />
            </Link>
            <div className="b-header-controls">
              <Link href="/profil" className="b-user" aria-label="Afficher mon profil" title={nom}>{prenom.charAt(0).toUpperCase()}</Link>
              <StudentMenuButton />
            </div>
          </header>

          <section className="b-welcome">
            <div className="b-greeting">
              <p className="b-intro">VOTRE ESPACE DE PRÉPARATION</p>
              <h1>Bon retour, {prenom} ! <span aria-hidden="true">👋</span></h1>
              <p>Continuez vos efforts aujourd’hui pour atteindre vos objectifs.</p>
            </div>
            <img className="b-nurse" src="/nursing-home-b-student.svg" width={400} height={300} alt="Illustration d’une étudiante infirmière avec ses livres" />
          </section>

          <section className="b-progress-card" aria-labelledby="b-progress-heading">
            <div className="b-card-heading">
              <div className="b-heading-title"><span className="b-heading-icon b-analytics-icon" aria-hidden="true">▥</span><h2 id="b-progress-heading">Votre progression</h2></div>
              <Link className="b-heading-link" href="/performance">Détails <span aria-hidden="true">›</span></Link>
            </div>
            <div className="b-progress-content">
              <div className="b-ring-wrap">
                <div className="b-progress-ring" role="img" aria-label={progressionQuestions + "% des QCM disponibles déjà répondus"} style={{"--b-ring": progressionQuestions+"%"} as CSSProperties}>
                  <div className="b-progress-center"><strong>{progressionQuestions}%</strong><span>QCM couverts</span></div>
                </div>
                <small>Basé sur vos réponses enregistrées</small>
              </div>
              <div className="b-progress-list">
                {globalItems.map((item) => (
                  <Link className={"b-progress-item b-item-"+item.tone} href={item.href} key={item.label}>
                    <span className="b-mini-icon" aria-hidden="true">{item.tone === "course" ? "▤" : item.tone === "qcm" ? "▧" : "☑"}</span>
                    <span className="b-progress-detail">
                      <span className="b-progress-meta"><strong>{item.label}</strong><small>{item.current.toLocaleString("fr-FR")} / {item.total.toLocaleString("fr-FR")}</small></span>
                      <span className="b-track"><span style={{width: (item.total>0?Math.min(100,Math.round(item.current/item.total*100)):0)+"%"}} /></span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <Link className="b-recommendation" href={recommendationLink}>
            <span className="b-recommend-copy">
              <small><span aria-hidden="true">✦</span> {recommendationLabel}</small>
              <strong>{recommendedTitle}</strong>
              <span>{totalTentatives > 0 && plusFaible.questions > 0 ? plusFaible.questions + " tentatives · " + plusFaible.valeur + "% de réussite" : "Commencez par les bases essentielles des soins infirmiers."}</span>
            </span>
            <span className="b-recommend-books" aria-hidden="true"><i /><i /><i /></span>
            <span className="b-recommend-arrow" aria-hidden="true">›</span>
          </Link>

          <section className="b-actions" aria-labelledby="b-actions-title">
            <div className="b-section-heading"><h2 id="b-actions-title">Accès rapide</h2><Link href="/profil">Tous les outils <span aria-hidden="true">›</span></Link></div>
            <div className="b-action-grid">
              <Link href="/pratique" className="b-action-tile b-tile-qcm"><span className="b-tile-icon" aria-hidden="true">▤</span><strong>QCM</strong><small>S’entraîner maintenant</small></Link>
              <Link href="/examens" className="b-action-tile b-tile-exams"><span className="b-tile-icon" aria-hidden="true">☑</span><strong>Examens</strong><small>Simulations chronométrées</small></Link>
              <Link href="/cours-revisions" className="b-action-tile b-tile-courses"><span className="b-tile-icon" aria-hidden="true">▣</span><strong>Cours</strong><small>Lire et apprendre</small></Link>
              <Link href="/questions-incorrectes" className="b-action-tile b-tile-errors"><span className="b-tile-icon" aria-hidden="true">◎</span><strong>Questions incorrectes</strong><small>Revoir vos erreurs</small></Link>
            </div>
          </section>

          <div className="b-lower-grid">
            <section className="b-streak" aria-labelledby="b-streak-title">
              <div className="b-streak-top"><span className="b-flame" aria-hidden="true">🔥</span><div><h2 id="b-streak-title">Série de jours</h2><strong>{serieEtude} jour{serieEtude > 1 ? "s" : ""}</strong><p>{serieEtude > 0 ? "Continuez sur cette lancée !" : "Une session aujourd’hui pour démarrer !"}</p></div></div>
              <div className="b-week-row" aria-label="Activité des sept derniers jours">
                {weekDays.map((day) => <div className="b-week-day" key={day.key}><span className={day.active ? "b-done" : day.today ? "b-today" : ""} aria-label={day.key+(day.active?" : étudié":" : sans activité")}>{day.active ? "✓" : ""}</span><small>{day.label}</small></div>)}
              </div>
            </section>
            <section className="b-quote">
              <div className="b-quote-title"><span aria-hidden="true">“</span><h2>Motivation du jour</h2></div>
              <p>Des infirmiers bien formés construisent une Haïti plus saine.</p>
              <span className="b-heartbeat" aria-hidden="true">♡</span>
            </section>
          </div>

          <section className="b-daily" aria-labelledby="b-daily-title">
            <div className="b-daily-top"><span className="b-daily-symbol" aria-hidden="true">◎</span><div><h2 id="b-daily-title">Objectif quotidien</h2><p>{questionsAujourdhui} questions répondues sur {DAILY_GOAL} prévues aujourd’hui</p></div><strong>{objectifPourcentage}%</strong></div>
            <div className="b-track b-daily-track"><span style={{width:objectifPourcentage+"%"}} /></div>
            <Link href="/pratique?nombre=25"> {objectifRestant > 0 ? "Continuer à pratiquer →" : "Poursuivre votre apprentissage →"}</Link>
          </section>

          {recentAnswer && <div className="b-recent">
            <div><span aria-hidden="true">◷</span><div><strong>Dernière activité</strong><small>{resumeCategory || "QCM d’entraînement"}</small></div></div>
            <Link href={resumeCategory?"/pratique?categorie="+encodeURIComponent(resumeCategory):"/pratique"}>Réviser →</Link>
          </div>}
        </div>
      </main>
    </div>
  );
}
