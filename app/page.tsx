import StudyTopicDetails from "@/components/StudyTopicDetails";
import StudyTextOverview from "@/components/StudyTextOverview";
import { studyCategories } from "@/lib/study-categories";
import Link from "next/link";
import "./home-categories.css";
import "./home-modern.css";

const stats = [
  { icon: "▤", value: "6 425", label: "Questions expliquées" },
  { icon: "◇", value: "8", label: "Grandes catégories" },
  { icon: "✓", value: "17", label: "Formats d’examen" },
  { icon: "▣", value: "78", label: "Modules de cours" },
];

const features = [
  { icon: "▤", title: "QCM expliqués", text: "Bonne réponse, justification A–D et point à retenir." },
  { icon: "◷", title: "Examens chronométrés", text: "Entraînez-vous dans des conditions proches de l’examen." },
  { icon: "▣", title: "Cours & Révisions", text: "Des modules structurés par domaine infirmier." },
  { icon: "▥", title: "Suivi de progression", text: "Visualisez vos résultats et vos points faibles." },
  { icon: "★", title: "Questions incorrectes", text: "Revenez sur vos erreurs pour mieux progresser." },
  { icon: "♥", title: "Favoris", text: "Enregistrez les questions importantes à revoir." },
];

const plans = [
  { duration: "1 mois", price: "1 500", label: "Flexible", note: "Idéal pour une préparation courte et intensive." },
  { duration: "3 mois", price: "4 000", label: "Populaire", note: "Un bon rythme pour progresser régulièrement." },
  { duration: "6 mois", price: "6 500", label: "Recommandé", note: "Le meilleur équilibre entre durée et prix.", featured: true },
  { duration: "1 an", price: "10 000", label: "Meilleure valeur", note: "Le tarif le plus avantageux pour une préparation complète.", bestValue: true },
];

export default function Accueil() {
  return (
    <main className="container home-modern">
      <nav className="nav home-nav">
        <Link href="/" className="home-brand" aria-label="Haiti Nursing Exam Prep - Accueil">
          <span className="home-brand-mark">H</span>
          <span className="home-brand-text"><strong>Haiti Nursing</strong><small>Exam Prep</small></span>
        </Link>
        <div className="home-desktop-nav">
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#categories">Catégories</a>
        </div>
        <div className="navlinks">
          <Link className="home-login-outline" href="/connexion">Se connecter</Link>
          <Link className="btn btn-primary home-login" href="/inscription">Créer mon compte</Link>
        </div>
      </nav>

      <section className="home-hero-showcase">
        <div className="home-hero-copy">
          <span className="home-pill-blue">Préparation à l’Examen d’État infirmier 🇭🇹</span>
          <h1>Préparez l’Examen d’État infirmier <em>avec confiance.</em></h1>
          <p className="home-lead-dark">Des QCM expliqués, des examens simulés et des cours structurés pour aider les étudiants infirmiers à réussir avec méthode.</p>
          <div className="home-actions">
            <Link className="btn btn-primary home-main-blue" href="/inscription">Créer mon compte</Link>
            <Link className="home-outline-cta" href="/connexion">Se connecter</Link>
          </div>
        </div>

        <div className="home-device-stage" aria-label="Aperçu de Haiti Nursing Exam Prep">
          <div className="home-laptop">
            <div className="home-screen">
              <div className="dash-mini-top"><b>Tableau de bord</b><span>●</span></div>
              <div className="dash-mini-metrics"><div><small>QCM réalisés</small><b>1 250</b></div><div><small>Bonnes réponses</small><b>78%</b></div><div><small>Temps d’étude</small><b>24 h</b></div></div>
              <div className="dash-mini-grid"><div className="dash-mini-chart"><b>Progression par catégorie</b><p><span style={{width:"85%"}} /></p><p><span style={{width:"72%"}} /></p><p><span style={{width:"70%"}} /></p><p><span style={{width:"65%"}} /></p></div><div className="dash-mini-goal"><b>Prochain objectif</b><small>Terminer 100 QCM</small><button>Continuer</button></div></div>
            </div>
          </div>
          <div className="home-phone">
            <div className="phone-notch" />
            <b>Bonjour !</b><small>Continuez votre préparation</small>
            <div className="phone-score">78%</div>
            <div className="phone-link">▤ QCM par catégorie</div><div className="phone-link">◷ Examens simulés</div><div className="phone-link">▣ Cours & Révisions</div><div className="phone-link">▥ Mes statistiques</div>
          </div>
        </div>
      </section>

      <section className="home-stat-cards" aria-label="Chiffres clés">
        {stats.map((stat)=><article key={stat.label}><span>{stat.icon}</span><div><strong>{stat.value}</strong><small>{stat.label}</small></div></article>)}
      </section>

      <section id="fonctionnalites" className="home-section compact-section">
        <div className="home-section-heading centered"><h2>Tout ce qu’il vous faut pour réussir</h2><p>Des outils complets pour préparer votre Examen d’État infirmier.</p></div>
        <div className="home-feature-six">{features.map((f)=><article key={f.title}><span>{f.icon}</span><h3>{f.title}</h3><p>{f.text}</p></article>)}</div>
      </section>

      <section className="home-question-demo">
        <div className="demo-question">
          <div className="demo-head"><b>Un exemple de question sur la plateforme</b><span>Question 1/15</span></div>
          <small>Santé maternelle</small>
          <p>Une femme enceinte de 32 semaines présente une hypertension importante, des œdèmes et des céphalées. Quel diagnostic est le plus probable ?</p>
          <div className="demo-option"><b>A</b> Hypertension chronique</div>
          <div className="demo-option correct"><b>B</b> Prééclampsie sévère <strong>✓</strong></div>
          <div className="demo-option"><b>C</b> Diabète gestationnel</div>
          <div className="demo-option"><b>D</b> Anémie ferriprive</div>
        </div>
        <div className="demo-explanation">
          <div className="demo-correct">✓ Bonne réponse : B. Prééclampsie sévère</div>
          <h3>Explication</h3><p>L’association d’une hypertension importante après 20 semaines avec des signes cliniques compatibles doit faire suspecter une prééclampsie nécessitant une évaluation rapide.</p>
          <h3>Analyse des choix</h3><ul><li><b>A.</b> Ne correspond pas au tableau présenté.</li><li><b>B.</b> Correspond aux signes décrits.</li><li><b>C.</b> N’explique pas l’hypertension et les céphalées.</li><li><b>D.</b> N’explique pas ce tableau hypertensif.</li></ul>
          <div className="demo-point"><b>💡 Point à retenir</b><span>Reconnaître rapidement les signes d’alerte permet de prioriser la prise en charge.</span></div>
        </div>
      </section>

      <section id="tarifs" className="home-pricing home-section" aria-labelledby="pricing-title">
        <div className="home-section-heading centered">
          <span className="home-pricing-kicker">Tarifs</span>
          <h2 id="pricing-title">Choisissez la durée qui vous convient</h2>
          <p>Toutes les formules donnent accès à l’ensemble des outils de préparation de Haiti Nursing Exam Prep.</p>
        </div>
        <div className="home-pricing-grid">
          {plans.map((plan)=><article className={`home-plan-card${plan.featured ? " featured" : ""}${plan.bestValue ? " best-value" : ""}`} key={plan.duration}>
            <div className="home-plan-top"><span className="home-plan-label">{plan.label}</span><h3>{plan.duration}</h3><div className="home-plan-price"><strong>{plan.price}</strong><span>HTG</span></div><p>{plan.note}</p></div>
            <div className="home-plan-benefits"><span>✓ 6 425 QCM expliqués</span><span>✓ Examens simulés</span><span>✓ 78 modules de cours</span><span>✓ Statistiques, erreurs et favoris</span></div>
            <Link className="home-plan-button" href="/inscription">Créer mon compte</Link>
          </article>)}
        </div>
        <p className="home-pricing-note">Le paiement en ligne sera activé prochainement. La création de compte reste disponible dès maintenant.</p>
      </section>

      <section id="categories" className="home-categories" aria-labelledby="categories-title">
        <div className="home-categories-heading"><span className="badge">Programme de révision</span><h2 id="categories-title">Catégories et thématiques</h2><p className="muted">Explorez les principaux domaines de préparation, leurs thématiques et sous-thématiques.</p><StudyTextOverview /></div>
        <div className="home-category-grid">{studyCategories.map((category)=><details className="home-category-card" key={category.title}><summary><span className="home-category-icon" aria-hidden="true">{category.icon}</span><span className="home-category-title-wrap"><strong>{category.title}</strong><small>{category.topics.length} thématiques</small></span><span className="home-category-chevron" aria-hidden="true">⌄</span></summary><div className="home-topic-list">{category.topics.map((topic)=><StudyTopicDetails key={topic.title} category={category.title} topic={topic} />)}</div></details>)}</div>
      </section>

      <section className="home-final-banner"><div><h2>Prêt à commencer votre préparation ?</h2><p>Rejoignez Haiti Nursing Exam Prep et avancez vers votre objectif avec méthode.</p></div><div><Link className="home-white-button" href="/inscription">Créer mon compte</Link><Link className="home-blue-outline" href="/connexion">Se connecter</Link></div></section>

      <footer className="home-footer clean-footer"><div className="home-footer-brand"><span className="home-brand-mark">H</span><div><strong>Haiti Nursing Exam Prep</strong><small>Préparer aujourd’hui. Réussir demain.</small></div></div><div className="home-footer-links"><Link href="/connexion">Aide</Link><span>Confidentialité</span></div><p>© {new Date().getFullYear()} Haiti Nursing Exam Prep. Tous droits réservés.</p></footer>
    </main>
  );
}
