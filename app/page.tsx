import StudyTopicDetails from "@/components/StudyTopicDetails";
import StudyTextOverview from "@/components/StudyTextOverview";
import { studyCategories } from "@/lib/study-categories";
import Link from "next/link";
import "./home-categories.css";
import "./home-modern.css";

const stats = [
  { value: "6 425", label: "Questions" },
  { value: "8", label: "Catégories" },
  { value: "17", label: "Formats d’examen" },
  { value: "78", label: "Modules de cours" },
];

const benefits = [
  {
    icon: "✓",
    title: "QCM expliqués",
    text: "Bonne réponse, justification des choix A–D et point à retenir.",
  },
  {
    icon: "⏱",
    title: "Examens chronométrés",
    text: "Entraînez-vous dans des conditions proches de l’examen.",
  },
  {
    icon: "📚",
    title: "Cours & Révisions",
    text: "78 modules structurés par domaine infirmier.",
  },
  {
    icon: "↗",
    title: "Suivi de progression",
    text: "Visualisez vos résultats et identifiez vos points faibles.",
  },
];

export default function Accueil() {
  return (
    <main className="container home-modern">
      <nav className="nav home-nav">
        <div className="logo">Haiti Nursing Exam Prep</div>
        <div className="navlinks">
          <Link href="/inscription">Créer un compte</Link>
          <Link href="/tableau-de-bord">Tableau de bord</Link>
          <Link className="btn btn-primary home-login" href="/connexion">Se connecter</Link>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="badge home-badge">Préparation à l’Examen d’État infirmier 🇭🇹</span>
          <h1>Préparez-vous.<br />Pratiquez. Réussissez.</h1>
          <p className="home-lead">
            Préparez efficacement l’Examen d’État en sciences infirmières avec
            6 425 QCM, des examens simulés et des cours de révision structurés.
          </p>
          <div className="home-actions">
            <Link className="btn btn-primary home-main-cta" href="/inscription">Créer mon compte</Link>
            <Link className="home-secondary-cta" href="/connexion">J’ai déjà un compte</Link>
          </div>
        </div>

        <div className="home-stats" aria-label="Chiffres clés de la plateforme">
          {stats.map((stat) => (
            <div className="home-stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-benefits" aria-labelledby="benefits-title">
        <div className="home-section-heading">
          <span className="home-kicker">Votre préparation, au même endroit</span>
          <h2 id="benefits-title">Tout ce qu’il vous faut pour réussir</h2>
        </div>
        <div className="home-benefit-grid">
          {benefits.map((benefit) => (
            <article className="home-benefit-card" key={benefit.title}>
              <div className="home-benefit-icon" aria-hidden="true">{benefit.icon}</div>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-trust">
        <div>
          <span className="home-kicker">Une préparation pensée pour les étudiants infirmiers</span>
          <h2>Comprendre la réponse, pas seulement la mémoriser.</h2>
        </div>
        <p>
          Chaque question comprend la bonne réponse, l’explication des choix A–D
          et un point clé à retenir pour renforcer votre raisonnement clinique.
        </p>
      </section>

      <section className="home-categories" aria-labelledby="categories-title">
        <div className="home-categories-heading">
          <span className="badge">Programme de révision</span>
          <h2 id="categories-title">Catégories et thématiques</h2>
          <p className="muted">
            Explorez les principaux domaines de préparation, leurs thématiques et sous-thématiques.
          </p>
          <StudyTextOverview />
        </div>

        <div className="home-category-grid">
          {studyCategories.map((category) => (
            <details className="home-category-card" key={category.title}>
              <summary>
                <span className="home-category-icon" aria-hidden="true">{category.icon}</span>
                <span className="home-category-title-wrap">
                  <strong>{category.title}</strong>
                  <small>{category.topics.length} thématiques</small>
                </span>
                <span className="home-category-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="home-topic-list">
                {category.topics.map((topic) => (
                  <StudyTopicDetails key={topic.title} category={category.title} topic={topic} />
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
