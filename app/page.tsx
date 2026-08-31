import Link from "next/link";

export default function Accueil() {
  return (
    <main className="container">
      <nav className="nav">
        <div className="logo">Haiti Nursing Exam Prep</div>
        <div className="navlinks">
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
            <Link className="btn btn-primary" href="/questions">Commencer à pratiquer</Link>
            <Link className="btn btn-secondary" href="/tableau-de-bord">Voir le tableau de bord</Link>
          </div>
        </div>

        <div className="card">
          <h2>Votre préparation en un coup d'œil</h2>
          <div className="statgrid">
            <div className="stat"><span>Questions</span><strong>1 400+</strong></div>
            <div className="stat"><span>Catégories</span><strong>10+</strong></div>
            <div className="stat"><span>Modes</span><strong>3</strong></div>
          </div>
          <p className="muted">
            Mode pratique, examen chronométré et révision des questions incorrectes.
          </p>
        </div>
      </section>
    </main>
  );
}
