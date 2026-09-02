import Link from "next/link";
import "./home-categories.css";

const categories = [
  {
    title: "Médecine–Chirurgie",
    icon: "🩺",
    topics: ["Cardiovasculaire", "Respiratoire", "Neurologie", "Gastro-intestinal", "Endocrinologie", "Rénal", "Hématologie", "Infectiologie"],
  },
  {
    title: "Pédiatrie",
    icon: "👶",
    topics: ["Nouveau-né", "Croissance et développement", "Maladies pédiatriques", "Vaccination", "Urgences pédiatriques"],
  },
  {
    title: "Obstétrique / Gynécologie",
    icon: "🤰",
    topics: ["Grossesse", "Travail et accouchement", "Postpartum", "Complications obstétricales", "Santé reproductive"],
  },
  {
    title: "Pharmacologie",
    icon: "💊",
    topics: ["Principes pharmacologiques", "Antibiotiques", "Cardiovasculaire", "Analgésiques", "Insulines", "Calculs de doses"],
  },
  {
    title: "Santé mentale / Psychiatrie",
    icon: "🧠",
    topics: ["Dépression", "Anxiété", "Schizophrénie", "Troubles de la personnalité", "Dépendances", "Urgences psychiatriques"],
  },
  {
    title: "Santé communautaire",
    icon: "🏥",
    topics: ["Prévention", "Épidémiologie", "Vaccination", "Éducation sanitaire", "Santé familiale", "Santé publique"],
  },
  {
    title: "Fondements des soins infirmiers",
    icon: "📋",
    topics: ["Signes vitaux", "Hygiène et confort", "Sécurité du patient", "Administration des médicaments", "Documentation", "Communication thérapeutique"],
  },
  {
    title: "Urgences et soins critiques",
    icon: "🚑",
    topics: ["État de choc", "Détresse respiratoire", "Réanimation", "Traumatismes", "Triage", "Surveillance du patient critique"],
  },
];

export default function Accueil() {
  return (
    <main className="container">
      <nav className="nav">
        <div className="logo">Haiti Nursing Exam Prep</div>
        <div className="navlinks">
          <Link href="/inscription">Créer un compte</Link>
          <Link href="/tableau-de-bord">Tableau de bord</Link>
          <Link className="btn btn-primary" href="/connexion">Se connecter</Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="badge">Préparation aux examens infirmiers</span>
          <h1>Préparez-vous. Pratiquez. Réussissez.</h1>
          <p className="muted">
            Entraînez-vous avec des questions cliniques, des examens simulés,
            des explications détaillées et un suivi de votre progression.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/pratique">Commencer à pratiquer</Link>
            <Link className="btn btn-secondary" href="/inscription">Créer un compte</Link>
          </div>
        </div>

        <div className="card">
          <h2>Votre préparation en un coup d'œil</h2>
          <div className="statgrid">
            <div className="stat"><span>Questions</span><strong>6 000+</strong></div>
            <div className="stat"><span>Catégories</span><strong>10+</strong></div>
            <div className="stat"><span>Modes</span><strong>3</strong></div>
          </div>
          <p className="muted">
            Mode pratique, examen chronométré et révision des questions incorrectes.
          </p>
        </div>
      </section>

      <section className="home-categories" aria-labelledby="categories-title">
        <div className="home-categories-heading">
          <span className="badge">Programme de révision</span>
          <h2 id="categories-title">Catégories et thématiques</h2>
          <p className="muted">
            Explorez les principaux domaines de préparation. Les questions seront ajoutées aux thématiques dans une prochaine étape.
          </p>
        </div>

        <div className="home-category-grid">
          {categories.map((category) => (
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
                  <span className="home-topic-chip" key={topic}>{topic}</span>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
