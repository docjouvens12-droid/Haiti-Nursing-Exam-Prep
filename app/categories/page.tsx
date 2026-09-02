import CardiovascularTopics from "@/components/CardiovascularTopics";

const categories = [
  { title: "Médecine–Chirurgie", icon: "🩺", topics: ["Cardiovasculaire", "Respiratoire", "Neurologie", "Gastro-intestinal", "Endocrinologie", "Rénal", "Hématologie", "Infectiologie"] },
  { title: "Pédiatrie", icon: "👶", topics: ["Nouveau-né", "Croissance et développement", "Maladies pédiatriques", "Vaccination", "Urgences pédiatriques"] },
  { title: "Maternité–Obstétrique / Gynécologie", icon: "🤰", topics: ["Grossesse", "Travail et accouchement", "Postpartum", "Complications obstétricales", "Santé reproductive"] },
  { title: "Pharmacologie", icon: "💊", topics: ["Principes pharmacologiques", "Antibiotiques", "Médicaments cardiovasculaires", "Analgésiques", "Insulines", "Calculs de doses"] },
  { title: "Santé mentale / Psychiatrie", icon: "🧠", topics: ["Dépression", "Anxiété", "Schizophrénie", "Troubles de la personnalité", "Dépendances", "Urgences psychiatriques"] },
  { title: "Santé communautaire", icon: "🏥", topics: ["Prévention", "Épidémiologie", "Vaccination", "Éducation sanitaire", "Santé familiale", "Santé publique"] },
  { title: "Fondements des soins infirmiers", icon: "📋", topics: ["Signes vitaux", "Hygiène et confort", "Sécurité du patient", "Administration des médicaments", "Documentation", "Communication thérapeutique"] },
  { title: "Urgences et soins critiques", icon: "🚑", topics: ["État de choc", "Détresse respiratoire", "Réanimation", "Traumatismes", "Triage", "Surveillance du patient critique"] },
];

export default function CategoriesPage() {
  return (
    <main className="categories-page">
      <header className="categories-header">
        <span className="categories-kicker">Programme de révision</span>
        <h1>Catégories et thématiques</h1>
        <p>Explorez les domaines de préparation et les thématiques qui leur appartiennent. Les questions seront intégrées ultérieurement.</p>
      </header>
      <section className="categories-grid">
        {categories.map((category) => (
          <details className="category-card" key={category.title}>
            <summary>
              <span className="category-icon" aria-hidden="true">{category.icon}</span>
              <span className="category-name"><strong>{category.title}</strong><small>{category.topics.length} thématiques</small></span>
              <span className="category-arrow" aria-hidden="true">⌄</span>
            </summary>
            <div className="topic-list">
              {category.topics.map((topic) => category.title === "Médecine–Chirurgie" && topic === "Cardiovasculaire" ? (
                <CardiovascularTopics key={topic} />
              ) : <div className="topic" key={topic}>{topic}</div>)}
            </div>
          </details>
        ))}
      </section>
      <style>{`
        .categories-page{max-width:900px;margin:0 auto;padding:34px 22px 120px;background:#f7f9fd;min-height:100vh;color:#101f42}
        .categories-header{margin-bottom:26px}.categories-kicker{display:inline-block;background:#eaf2ff;color:#2367e8;font-weight:800;font-size:13px;padding:8px 12px;border-radius:999px}
        .categories-header h1{font-size:32px;line-height:1.12;margin:15px 0 10px}.categories-header p{color:#66738e;line-height:1.6;margin:0;max-width:680px}
        .categories-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.category-card{background:#fff;border:1px solid #e1e7f0;border-radius:18px;box-shadow:0 5px 18px rgba(25,50,100,.06);overflow:hidden}
        .category-card > summary{list-style:none;display:flex;align-items:center;gap:14px;padding:20px;cursor:pointer}.category-card > summary::-webkit-details-marker{display:none}
        .category-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:#eef4ff;font-size:24px}.category-name{display:flex;flex-direction:column;gap:5px;flex:1}.category-name strong{font-size:17px}.category-name small{color:#7a879f}
        .category-arrow{font-size:24px;color:#4a67df;transition:transform .2s}.category-card[open] > summary .category-arrow{transform:rotate(180deg)}.topic-list{display:grid;gap:8px;padding:0 20px 20px}.topic{background:#f5f8fd;border:1px solid #e8edf5;padding:11px 13px;border-radius:11px;color:#34425e;font-weight:600}
        @media(max-width:700px){.categories-page{padding:24px 16px 110px}.categories-header h1{font-size:27px}.categories-grid{grid-template-columns:1fr}.category-card > summary{padding:17px}.topic-list{padding:0 17px 17px}}
      `}</style>
    </main>
  );
}
