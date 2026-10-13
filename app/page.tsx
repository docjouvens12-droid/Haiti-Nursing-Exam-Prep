import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "./home-bc.css";

export const dynamic = "force-dynamic";

const specialties = [
  { name: "Maternité-Obstétrique", icon: "♡", category: "Maternité-Obstétrique" },
  { name: "Urgences", icon: "✚", category: "Urgences" },
  { name: "Pharmacologie", icon: "◈", category: "Pharmacologie" },
  { name: "Santé communautaire", icon: "♧", category: "Santé communautaire" },
];

export default async function Accueil() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  // Signed-in students go straight to the personalized dashboard.
  if (authData?.claims?.sub) redirect("/tableau-de-bord");

  const [
    { count: totalQuestions },
    { count: totalCourseModules },
    { count: historicalBanks },
    ...specialtyResults
  ] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase.from("learning_modules").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("exam_banks").select("id", { count: "exact", head: true }),
    ...specialties.map((item) =>
      supabase.from("questions").select("id", { count: "exact", head: true }).eq("categorie", item.category)
    ),
  ]);

  const displayNumber = (value: number | null) =>
    value === null ? "—" : value.toLocaleString("fr-FR");

  return (
    <main className="hnb-landing">
      <div className="hnb-wrap">
        <header className="hnb-header">
          <Link className="hnb-logo" href="/" aria-label="Haiti Nursing Exam Prep - Accueil">
            <img src="/hn-logo.svg" alt="Haiti Nursing Exam Prep" width={230} height={69} />
          </Link>
          <nav className="hnb-header-actions" aria-label="Connexion et inscription">
            <Link className="hnb-header-login" href="/connexion">Se connecter</Link>
            <Link className="hnb-header-join" href="/inscription">Créer un compte</Link>
          </nav>
        </header>

        <section className="hnb-welcome" aria-labelledby="hnb-title">
          <div className="hnb-welcome-copy">
            <span className="hnb-kicker">✦ Préparation infirmière en Haïti</span>
            <h1 id="hnb-title">Votre avenir commence <em>aujourd’hui.</em></h1>
            <p>Préparez l’Examen d’État en sciences infirmières avec des QCM expliqués, des cours et des examens blancs.</p>
            <div className="hnb-hero-actions">
              <Link href="/inscription" className="hnb-btn-main">Commencer maintenant →</Link>
              <Link href="/connexion" className="hnb-btn-outline">Se connecter</Link>
            </div>
          </div>
          <img className="hnb-illustration" src="/nursing-home-b-student.svg" alt="Illustration d’une étudiante infirmière avec des livres" width={400} height={300} />
        </section>

        <section className="hnb-guest-card" aria-labelledby="hnb-progress-title">
          <div className="hnb-section-heading">
            <h2 id="hnb-progress-title">Suivez votre progression</h2>
            <small>Aperçu illustratif du tableau de bord</small>
          </div>
          <div className="hnb-dashboard-preview">
            <div className="hnb-ring-demo" aria-hidden="true">
              <div className="hnb-ring-inner"><strong>Votre suivi</strong><small>Personnalisé après connexion</small></div>
            </div>
            <div className="hnb-preview-list" aria-label="Types de progression disponibles">
              <div className="hnb-preview-row"><span className="hnb-preview-icon" aria-hidden="true">▤</span><div><b>Cours &amp; révisions</b><div className="hnb-demo-track" aria-hidden="true"><span /></div></div></div>
              <div className="hnb-preview-row"><span className="hnb-preview-icon" aria-hidden="true">▧</span><div><b>QCM</b><div className="hnb-demo-track" aria-hidden="true"><span /></div></div></div>
              <div className="hnb-preview-row"><span className="hnb-preview-icon" aria-hidden="true">☑</span><div><b>Examens blancs</b><div className="hnb-demo-track" aria-hidden="true"><span /></div></div></div>
            </div>
          </div>
          <p className="hnb-preview-caption">Les barres sont un aperçu graphique, pas des résultats réels. Chaque étudiant retrouvera ses propres résultats après connexion.</p>
        </section>

        <section className="hnb-recommend" aria-labelledby="hnb-recommend-title">
          <div>
            <small>✦ Parcours conseillé pour commencer</small>
            <h2 id="hnb-recommend-title">Soins infirmiers fondamentaux</h2>
            <p>Révisez les bases avant de passer à des cas cliniques plus avancés.</p>
          </div>
          <span className="hnb-book-art" aria-hidden="true"><i /><i /><i /></span>
        </section>

        <section className="hnb-quick" aria-labelledby="hnb-quick-title">
          <div className="hnb-section-heading"><h2 id="hnb-quick-title">Accès rapide</h2><small>Disponible après connexion</small></div>
          <div className="hnb-quick-grid">
            <Link href="/inscription"><span aria-hidden="true">▤</span><strong>QCM</strong><small>S’entraîner à son rythme</small></Link>
            <Link href="/inscription"><span aria-hidden="true">☑</span><strong>Examens</strong><small>Simulations chronométrées</small></Link>
            <Link href="/inscription"><span aria-hidden="true">▣</span><strong>Cours</strong><small>Lire et apprendre</small></Link>
            <Link href="/inscription"><span aria-hidden="true">◎</span><strong>Questions incorrectes</strong><small>Revoir ses erreurs</small></Link>
          </div>
        </section>

        <div className="hnb-continue">
          <section className="hnb-resume" aria-labelledby="hnb-resume-title">
            <h2 id="hnb-resume-title">◷ Continuer là où vous vous êtes arrêté</h2>
            <p>Reprenez vos révisions et retrouvez votre dernière activité en vous connectant à votre espace personnel.</p>
            <Link href="/connexion">Retrouver mon parcours →</Link>
          </section>
          <section className="hnb-quote" aria-labelledby="hnb-quote-title">
            <h2 id="hnb-quote-title">Motivation du jour</h2>
            <p>« Des infirmiers bien formés construisent une Haïti plus saine. »</p>
          </section>
        </div>

        <section className="hnb-specialties" aria-labelledby="hnb-specialties-title">
          <div className="hnb-section-heading">
            <h2 id="hnb-specialties-title">Nos principales thématiques</h2>
            <small>Questions issues de notre banque</small>
          </div>
          <div className="hnb-specialty-grid">
            {specialties.map((specialty, i) => (
              <Link href="/inscription" key={specialty.category}>
                <span aria-hidden="true">{specialty.icon}</span>
                <strong>{specialty.name}</strong>
                <small>{displayNumber(specialtyResults[i].count)} QCM</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="hnb-guest-card" aria-label="Contenu de la plateforme">
          <div className="hnb-section-heading"><h2>Apprenez avec méthode</h2></div>
          <div className="hnb-quick-grid">
            <div><span aria-hidden="true">▤</span><strong>{displayNumber(totalQuestions)} QCM</strong><small>Avec explications</small></div>
            <div><span aria-hidden="true">▣</span><strong>{displayNumber(totalCourseModules)} modules</strong><small>Cours publiés</small></div>
            <div><span aria-hidden="true">☑</span><strong>{displayNumber(historicalBanks)} banques</strong><small>Examens reconstitués</small></div>
            <div><span aria-hidden="true">↗</span><strong>Progression</strong><small>Suivi personnalisé</small></div>
          </div>
        </section>

        <section className="hnb-bottom-cta">
          <div><h2>Prêt(e) à commencer votre préparation ?</h2><p>Créez votre compte pour accéder à vos QCM, vos cours et vos résultats personnels.</p></div>
          <Link href="/inscription">Créer mon compte →</Link>
        </section>
        <footer className="hnb-footer"><span>© {new Date().getFullYear()} Haiti Nursing Exam Prep</span><span>Préparer aujourd’hui. Réussir demain.</span></footer>
      </div>
    </main>
  );
}
