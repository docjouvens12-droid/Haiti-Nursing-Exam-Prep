import { StudentMenuButton } from "@/components/StudentMenuContext";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import "./concept-c.css";

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
    { count: maternitéCount },
    { count: urgencesCount },
    { count: pharmacologieCount },
    { count: communauteCount },
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
    supabase.from("learning_module_progress").select("module_id,status,progress_percent,updated_at,module_title").eq("user_id", userId),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("categorie", "Maternité-Obstétrique"),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("categorie", "Urgences"),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("categorie", "Pharmacologie"),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("categorie", "Santé communautaire"),
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
  const specialites = [
    { name: "Maternité-Obstétrique", count: maternitéCount, icon: "♡", tone: "maternite" },
    { name: "Urgences", count: urgencesCount, icon: "✚", tone: "urgences" },
    { name: "Pharmacologie", count: pharmacologieCount, icon: "◈", tone: "pharmaco" },
    { name: "Santé communautaire", count: communauteCount, icon: "♧", tone: "communaute" },
  ];
  const repriseUrl = resumeCategory
    ? "/pratique?categorie=" + encodeURIComponent(resumeCategory) + "&nombre=25"
    : "/pratique";
  // The previous label only used the latest QCM answer and could show an old
  // date even when a newer course or completed exam existed.
  const dernierExamen = (sessions ?? [])[0];
  const dernierCours = [...(courseProgressRows ?? [])]
    .filter((item) => item.updated_at && Number.isFinite(Date.parse(item.updated_at)))
    .sort((a, b) => Date.parse(b.updated_at!) - Date.parse(a.updated_at!))[0];
  const activites = [
    ...(recentAnswer?.answered_at ? [{
      date: recentAnswer.answered_at as string, type: "QCM" as const,
      titre: resumeCategory || "Entraînement QCM", url: repriseUrl,
      action: "Reprendre les QCM",
    }] : []),
    ...(dernierExamen?.completed_at ? [{
      date: dernierExamen.completed_at, type: "examen" as const,
      titre: "Examen blanc terminé", url: "/resultats/" + dernierExamen.id,
      action: "Voir les résultats",
    }] : []),
    ...(dernierCours?.updated_at ? [{
      date: dernierCours.updated_at, type: "cours" as const,
      titre: dernierCours.module_title || "Cours & révisions", url: "/cours-revisions",
      action: "Continuer les cours",
    }] : []),
  ].filter((item) => Number.isFinite(Date.parse(item.date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const derniereActivite = activites[0] ?? null;
  const derniereActiviteDate = derniereActivite
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric", month: "short", year: "numeric", timeZone: STUDY_TIME_ZONE,
      }).format(new Date(derniereActivite.date))
    : null;

  return (
    <div className="c-shell">
      <aside className="c-side" aria-label="Menu principal sur ordinateur">
        <Link className="c-sidebrand" href="/tableau-de-bord">
          <img src="/pwa-icon.svg" alt="" width={44} height={44} />
          <span>Haiti Nursing<small>EXAM PREP</small></span>
        </Link>
        <nav className="c-sidenav" aria-label="Navigation principale">
          <Link href="/tableau-de-bord" aria-current="page"><span aria-hidden="true">⌂</span>Accueil</Link>
          <Link href="/pratique"><span aria-hidden="true">▤</span>QCM</Link>
          <Link href="/categories"><span aria-hidden="true">▦</span>Catégories</Link>
          <Link href="/examens"><span aria-hidden="true">☑</span>Examens</Link>
          <Link href="/cours-revisions"><span aria-hidden="true">▣</span>Cours &amp; Révisions</Link>
          <Link href="/historique"><span aria-hidden="true">◷</span>Mon parcours</Link>
          <Link href="/performance"><span aria-hidden="true">⌁</span>Performance</Link>
          <Link href="/questions-incorrectes"><span aria-hidden="true">◎</span>Questions incorrectes</Link>
          <Link href="/favoris"><span aria-hidden="true">♡</span>Favoris</Link>
          <Link href="/nightingale"><span aria-hidden="true">✦</span>Nightingale AI</Link>
          {profil?.role === "admin" && <Link href="/admin"><span aria-hidden="true">⚙</span>Administration</Link>}
        </nav>
        <div className="c-sidebottom">
          <p>{nom}<span style={{display:"block",color:"#f3d59a"}}>{profil?.role === "admin" ? "Administrateur" : "Étudiant(e)"}</span></p>
          <BoutonDeconnexion />
        </div>
      </aside>

      <main className="c-main">
        <header className="c-top">
          <Link className="c-topbrand" href="/tableau-de-bord" aria-label="Haiti Nursing Exam Prep — accueil">
            <img src="/pwa-icon.svg" alt="" width={45} height={45} />
            <span>Haiti Nursing<small>EXAM PREP</small></span>
          </Link>
          <div className="c-topactions">
            <Link className="c-avatar" href="/profil" aria-label="Ouvrir mon profil" title={nom}>{prenom.charAt(0).toUpperCase()}</Link>
            <StudentMenuButton />
          </div>
        </header>

        <div className="c-content">
          <section className="c-hero" aria-labelledby="c-welcome-heading">
            <div className="c-herocopy">
              <span className="c-kicker">Votre espace de préparation · Haïti</span>
              <h1 id="c-welcome-heading">Bon retour, {prenom} ! <em>👋</em></h1>
              <p>Un pas de plus vers votre réussite à l’Examen d’État infirmier.</p>
              <div className="c-herobuttons">
                <Link href="/pratique" className="c-heroprimary">Commencer un QCM →</Link>
                <Link href="/examens" className="c-herosecondary">Examens blancs</Link>
              </div>
            </div>
            <img className="c-heroimg" src="/nursing-home-c-student.svg" alt="" width={230} height={235} />
          </section>

          <section className="c-statgrid" aria-label="Vos statistiques">
            <div className="c-stat">
              <span className="c-staticon" aria-hidden="true">▤</span>
              <div><small>QCM explorés</small><strong>{questionsRepondues.toLocaleString("fr-FR")}</strong><span className="c-statbar" aria-hidden="true"><i style={{width:progressionQuestions+"%"}} /></span></div>
            </div>
            <div className="c-stat">
              <span className="c-staticon" aria-hidden="true">✓</span>
              <div><small>Taux de réussite</small><strong>{taux}%</strong><span className="c-statbar" aria-hidden="true"><i style={{width:taux+"%"}} /></span></div>
            </div>
            <div className="c-stat">
              <span className="c-staticon" aria-hidden="true">☑</span>
              <div><small>Examens terminés</small><strong>{(sessions ?? []).length}</strong><span className="c-statbar" title={examensCompletes + " formats sur " + examensDisponibles} aria-hidden="true"><i style={{width:(examensDisponibles>0 ? Math.min(100,Math.round(examensCompletes/examensDisponibles*100)):0)+"%"}} /></span></div>
            </div>
          </section>

          <section className="c-panel" aria-labelledby="c-resume-heading">
            <div className="c-panelhead">
              <h2 id="c-resume-heading">Votre parcours d’apprentissage</h2>
              <Link href="/historique">Historique ›</Link>
            </div>
            <div className="c-two">
              <div className="c-resume">
                <div>
                  <span className="c-cardkicker">◷ CONTINUER LÀ OÙ VOUS ÉTIEZ</span>
                  <h3>{derniereActivite ? derniereActivite.titre : "Votre première séance"}</h3>
                  <p>{derniereActivite ? "Dernière activité (" + derniereActivite.type + ") · " + derniereActiviteDate : "Commencez une série de questions pour construire votre parcours."}</p>
                </div>
                <Link href={derniereActivite?.url ?? "/pratique"}>{derniereActivite?.action ?? "Commencer"} <span aria-hidden="true">›</span></Link>
              </div>
              <div className="c-focus">
                <div>
                  <span className="c-cardkicker">✦ {recommendationLabel.toUpperCase()}</span>
                  <h3>{recommendedTitle}</h3>
                  <p>{totalTentatives > 0 && plusFaible.questions > 0 ? plusFaible.questions + " tentatives · " + plusFaible.valeur + "% de bonnes réponses" : "Les bases essentielles des soins infirmiers pour bien démarrer."}</p>
                </div>
                <Link href={recommendationLink}>Explorer ce parcours →</Link>
              </div>
            </div>
          </section>

          <section className="c-panel" aria-labelledby="c-progress-heading">
            <div className="c-panelhead">
              <h2 id="c-progress-heading">Votre progression</h2>
              <Link href="/performance">Détails ›</Link>
            </div>
            <div className="c-progress">
              {globalItems.map(item => {
                const percentage = item.total > 0 ? Math.min(100, Math.round(item.current / item.total * 100)) : 0;
                return (
                  <Link className="c-progressrow" href={item.href} key={item.label}
                    aria-label={item.label + " : " + item.current + " sur " + item.total}>
                    <span>{item.label}</span>
                    <span className="c-track" aria-hidden="true"><i style={{width:percentage+"%"}} /></span>
                    <strong>{item.current.toLocaleString("fr-FR")} / {item.total.toLocaleString("fr-FR")}</strong>
                  </Link>
                );
              })}
            </div>
            <p className="c-muted">La progression est calculée avec vos résultats réellement enregistrés. {totalQuestions.toLocaleString("fr-FR")} questions sont disponibles.</p>
          </section>

          <section className="c-panel" aria-labelledby="c-subject-heading">
            <div className="c-panelhead">
              <h2 id="c-subject-heading">Explorer les spécialités</h2>
              <Link href="/categories">Toutes les matières ›</Link>
            </div>
            <div className="c-subjects">
              {specialites.map((item) => (
                <Link className="c-subject" href={"/pratique?categorie="+encodeURIComponent(item.name)+"&nombre=25"} key={item.name}>
                  <span className="c-subject-icon" aria-hidden="true">{item.icon}</span>
                  <strong>{item.name}</strong>
                  <small>{item.count?.toLocaleString("fr-FR") ?? "—"} QCM</small>
                </Link>
              ))}
            </div>
          </section>

          <div className="c-bottom">
            <section className="c-panel c-goal" aria-labelledby="c-goal-heading">
              <div className="c-panelhead" style={{marginBottom:0}}>
                <h2 id="c-goal-heading">Objectif quotidien</h2>
                <span style={{color:"#b68b44",fontWeight:900}}>✦</span>
              </div>
              <div className="c-goal-line">
                <p>{questionsAujourdhui} / {DAILY_GOAL} QCM aujourd’hui</p>
                <strong>{objectifPourcentage}%</strong>
              </div>
              <div className="c-track" role="progressbar" aria-label="Objectif de QCM quotidien" aria-valuenow={objectifPourcentage} aria-valuemin={0} aria-valuemax={100}>
                <i style={{width:objectifPourcentage+"%"}} />
              </div>
              <div className="c-week" aria-label={"Série d’étude de "+serieEtude+" jours"}>
                {weekDays.map(day => (
                  <div className="c-weekday" key={day.key}>
                    <span className={day.active ? "done" : ""} aria-label={day.key + (day.active ? " : étudié" : " : sans activité")}>{day.active ? "✓" : ""}</span>
                    <small>{day.label}</small>
                  </div>
                ))}
              </div>
              <Link href="/pratique?nombre=25" style={{fontSize:12,fontWeight:850,color:"#1a65b9"}}>{objectifRestant ? "Continuer à pratiquer →" : "Poursuivre vos révisions →"}</Link>
            </section>
            <section className="c-panel c-quote" aria-labelledby="c-quote-heading">
              <small id="c-quote-heading">MOTIVATION DU JOUR</small>
              <p>« Des infirmiers bien formés construisent une Haïti plus saine. »</p>
            </section>
          </div>
          <p className="c-footnote">Haiti Nursing Exam Prep · Étudier · S’entraîner · Réussir</p>
        </div>
      </main>
    </div>
  );
}
