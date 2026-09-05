import StudyTopicDetails from "@/components/StudyTopicDetails";
import StudyTextOverview from "@/components/StudyTextOverview";
import { studyCategories } from "@/lib/study-categories";
import Link from "next/link";
import "./home-categories.css";
import "./home-modern.css";

const stats = [
  { value: "6 425", label: "QCM expliqués" },
  { value: "8", label: "Grandes catégories" },
  { value: "17", label: "Formats d’examen" },
  { value: "78", label: "Modules de révision" },
];

const steps = [
  { number: "01", title: "Créez votre compte", text: "Accédez à votre espace personnel et à votre parcours de préparation." },
  { number: "02", title: "Entraînez-vous", text: "Travaillez par catégorie, thématique ou en simulation d’examen." },
  { number: "03", title: "Progressez", text: "Analysez vos résultats, revoyez vos erreurs et renforcez vos points faibles." },
];

const benefits = [
  { icon: "✓", title: "QCM expliqués", text: "Bonne réponse, justification des choix A–D et point à retenir." },
  { icon: "⏱", title: "Examens chronométrés", text: "Entraînez-vous dans un format proche des conditions d’examen." },
  { icon: "📚", title: "Cours & Révisions", text: "78 modules structurés couvrant les grands domaines infirmiers." },
  { icon: "↗", title: "Suivi de progression", text: "Visualisez vos résultats et identifiez les notions à retravailler." },
  { icon: "✕", title: "Révision des erreurs", text: "Retrouvez rapidement les questions incorrectes pour les retravailler." },
  { icon: "★", title: "Favoris", text: "Enregistrez les questions importantes et créez votre propre sélection de révision." },
];

const reasons = [
  "Préparation ciblée pour les étudiants infirmiers",
  "Explications détaillées pour chaque choix A–D",
  "Cours structurés indépendamment des examens",
  "Progression et résultats centralisés dans un seul espace",
];

export default function Accueil() {
  return (
    <main className="container home-modern">
      <nav className="nav home-nav">
        <Link href="/" className="home-brand" aria-label="Haiti Nursing Exam Prep - Accueil">
          <span className="home-brand-mark">H</span>
          <span className="home-brand-text"><strong>Haiti Nursing</strong><small>Exam Prep</small></span>
        </Link>
        <div className="navlinks">
          <Link href="/inscription">Créer un compte</Link>
          <Link className="btn btn-primary home-login" href="/connexion">Se connecter</Link>
        </div>
      </nav>

      <section className="home-hero-premium">
        <div className="home-hero-glow home-hero-glow-one" />
        <div className="home-hero-glow home-hero-glow-two" />
        <div className="home-hero-copy">
          <span className="home-pill">🇭🇹 Préparation à l’Examen d’État infirmier</span>
          <h1>Préparez votre réussite avec une méthode plus intelligente.</h1>
          <p className="home-lead">
            QCM expliqués, examens simulés, cours structurés et suivi de progression :
            tout votre parcours de préparation réuni dans une seule plateforme.
          </p>
          <div className="home-actions">
            <Link className="btn home-main-cta" href="/inscription">Créer mon compte <span>→</span></Link>
            <Link className="home-secondary-cta" href="/connexion">J’ai déjà un compte</Link>
          </div>
          <div className="home-proof-row">
            <span>✓ Explications A–D</span>
            <span>✓ Examens simulés</span>
            <span>✓ Progression suivie</span>
          </div>
        </div>

        <div className="home-preview-wrap" aria-label="Aperçu de la plateforme">
          <div className="home-preview-window">
            <div className="preview-topbar">
              <div className="preview-brand"><span>H</span><b>Haiti Nursing</b></div>
              <div className="preview-user">JA</div>
            </div>
            <div className="preview-content">
              <div className="preview-welcome"><small>TABLEAU DE BORD</small><strong>Bonjour, bienvenue 👋</strong><span>Continuez votre préparation aujourd’hui.</span></div>
              <div className="preview-metrics">
                <div><b>6 425</b><span>Questions</span></div>
                <div><b>78%</b><span>Réussite</span></div>
                <div><b>17</b><span>Examens</span></div>
              </div>
              <div className="preview-panels">
                <div className="preview-panel preview-progress">
                  <small>Progression</small>
                  <div className="preview-bar"><i style={{ width: "74%" }} /></div>
                  <div className="preview-bar"><i style={{ width: "61%" }} /></div>
                  <div className="preview-bar"><i style={{ width: "83%" }} /></div>
                </div>
                <div className="preview-panel preview-score"><div className="preview-ring"><b>82%</b></div><small>Dernier examen</small></div>
              </div>
            </div>
          </div>
          <div className="preview-float preview-float-one"><span>✓</span><div><b>QCM corrigé</b><small>Explication complète</small></div></div>
          <div className="preview-float preview-float-two"><span>↗</span><div><b>Progression</b><small>+12% cette semaine</small></div></div>
        </div>
      </section>

      <section className="home-stat-strip" aria-label="Chiffres clés de la plateforme">
        {stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
      </section>

      <section className="home-section home-how" aria-labelledby="how-title">
        <div className="home-section-heading centered">
          <span className="home-kicker">Simple et structuré</span>
          <h2 id="how-title">Votre préparation en 3 étapes</h2>
          <p>Une méthode claire pour passer de la révision à la maîtrise.</p>
        </div>
        <div className="home-step-grid">
          {steps.map((step) => <article className="home-step-card" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}
        </div>
      </section>

      <section className="home-section home-features" aria-labelledby="features-title">
        <div className="home-section-heading">
          <span className="home-kicker">Une plateforme complète</span>
          <h2 id="features-title">Tout ce qu’il vous faut pour progresser</h2>
          <p>Chaque outil a été pensé pour transformer vos sessions d’étude en apprentissage actif.</p>
        </div>
        <div className="home-benefit-grid premium-grid">
          {benefits.map((benefit) => (
            <article className="home-benefit-card premium-card" key={benefit.title}>
              <div className="home-benefit-icon" aria-hidden="true">{benefit.icon}</div>
              <div><h3>{benefit.title}</h3><p>{benefit.text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-value-block">
        <div className="home-value-copy">
          <span className="home-kicker light">Pourquoi Haiti Nursing Exam Prep ?</span>
          <h2>Plus qu’une banque de questions : un véritable parcours de préparation.</h2>
          <p>La plateforme vous aide à comprendre, pratiquer, mesurer vos progrès et revenir précisément sur les notions qui demandent encore du travail.</p>
          <div className="home-reasons">{reasons.map((reason) => <div key={reason}><span>✓</span>{reason}</div>)}</div>
        </div>
        <div className="home-value-card">
          <span className="home-value-badge">EXPLICATION DÉTAILLÉE</span>
          <h3>Pourquoi cette réponse est-elle correcte ?</h3>
          <div className="answer-choice correct"><b>A</b><span>Bonne réponse</span><strong>✓</strong></div>
          <div className="answer-choice"><b>B</b><span>Justification du choix</span></div>
          <div className="answer-choice"><b>C</b><span>Justification du choix</span></div>
          <div className="answer-choice"><b>D</b><span>Justification du choix</span></div>
          <div className="learning-point"><b>Point à retenir</b><span>Une synthèse courte pour mieux mémoriser.</span></div>
        </div>
      </section>

      <section className="home-categories" aria-labelledby="categories-title">
        <div className="home-categories-heading">
          <span className="home-kicker">Programme de révision</span>
          <h2 id="categories-title">Catégories et thématiques</h2>
          <p className="muted">Explorez les principaux domaines de préparation, leurs thématiques et sous-thématiques.</p>
          <StudyTextOverview />
        </div>
        <div className="home-category-grid">
          {studyCategories.map((category) => (
            <details className="home-category-card" key={category.title}>
              <summary>
                <span className="home-category-icon" aria-hidden="true">{category.icon}</span>
                <span className="home-category-title-wrap"><strong>{category.title}</strong><small>{category.topics.length} thématiques</small></span>
                <span className="home-category-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="home-topic-list">{category.topics.map((topic) => <StudyTopicDetails key={topic.title} category={category.title} topic={topic} />)}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="home-final-cta">
        <span className="home-kicker light">Votre préparation commence ici</span>
        <h2>Prêt à avancer vers votre objectif ?</h2>
        <p>Créez votre compte et commencez votre parcours de préparation sur Haiti Nursing Exam Prep.</p>
        <div><Link className="btn home-main-cta light-cta" href="/inscription">Créer mon compte <span>→</span></Link><Link className="home-final-login" href="/connexion">Se connecter</Link></div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-brand"><span className="home-brand-mark">H</span><div><strong>Haiti Nursing Exam Prep</strong><small>Préparation aux examens infirmiers</small></div></div>
        <div className="home-footer-links"><Link href="/connexion">Connexion</Link><Link href="/inscription">Créer un compte</Link><Link href="/cours-revisions">Cours & Révisions</Link></div>
        <p>© {new Date().getFullYear()} Haiti Nursing Exam Prep. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
