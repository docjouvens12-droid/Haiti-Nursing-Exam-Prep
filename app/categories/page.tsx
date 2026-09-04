import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const icons: Record<string, string> = {
  "Médecine-Chirurgie": "🩺",
  "Maternité-Obstétrique": "🤰",
  "Pédiatrie": "👶",
  "Pharmacologie": "💊",
  "Soins fondamentaux": "🩹",
  "Santé mentale / Psychiatrie": "🧠",
  "Santé communautaire": "🌍",
  "Urgences": "🚑",
};

type TaxonomyRow = { categorie: string | null; sous_categorie: string | null };
type Topic = { name: string; count: number };
type Category = { name: string; count: number; topics: Topic[] };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data, error } = await supabase
    .from("questions")
    .select("categorie,sous_categorie")
    .not("categorie", "is", null)
    .not("sous_categorie", "is", null);

  if (error) throw new Error("Impossible de charger les catégories et thématiques.");

  const categoryMap = new Map<string, Map<string, number>>();
  for (const row of (data ?? []) as TaxonomyRow[]) {
    const category = row.categorie?.trim();
    const topic = row.sous_categorie?.trim();
    if (!category || !topic) continue;
    if (!categoryMap.has(category)) categoryMap.set(category, new Map());
    const topics = categoryMap.get(category)!;
    topics.set(topic, (topics.get(topic) ?? 0) + 1);
  }

  const categories: Category[] = Array.from(categoryMap.entries())
    .map(([name, topics]) => ({
      name,
      count: Array.from(topics.values()).reduce((sum, value) => sum + value, 0),
      topics: Array.from(topics.entries())
        .map(([topicName, count]) => ({ name: topicName, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr")),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));

  const totalQuestions = categories.reduce((sum, category) => sum + category.count, 0);
  const totalTopics = categories.reduce((sum, category) => sum + category.topics.length, 0);

  return (
    <main className="categories-page">
      <header className="categories-header">
        <span className="categories-kicker">Banque de questions</span>
        <h1>Catégories & thématiques</h1>
        <p>Explorez les vraies catégories de la banque et lancez une séance de pratique directement sur la thématique choisie.</p>
        <div className="taxonomy-stats" aria-label="Résumé de la banque">
          <div><strong>{totalQuestions.toLocaleString("fr-FR")}</strong><span>questions</span></div>
          <div><strong>{categories.length}</strong><span>catégories</span></div>
          <div><strong>{totalTopics}</strong><span>thématiques</span></div>
        </div>
      </header>

      <section className="categories-grid">
        {categories.map((category) => (
          <details className="category-card" key={category.name}>
            <summary>
              <span className="category-icon" aria-hidden="true">{icons[category.name] ?? "📚"}</span>
              <span className="category-name">
                <strong>{category.name}</strong>
                <small>{category.count.toLocaleString("fr-FR")} questions · {category.topics.length} thématiques</small>
              </span>
              <span className="category-arrow" aria-hidden="true">⌄</span>
            </summary>
            <div className="topic-list">
              {category.topics.map((topic) => (
                <div className="topic-row" key={topic.name}>
                  <span className="topic-meta"><strong>{topic.name}</strong><small>{topic.count.toLocaleString("fr-FR")} questions</small></span>
                  <Link
                    className="topic-practice-link"
                    href={`/pratique?categorie=${encodeURIComponent(category.name)}&sous_categorie=${encodeURIComponent(topic.name)}&nombre=25`}
                    aria-label={`Pratiquer ${topic.name}`}
                  >
                    Pratiquer <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ))}
              <Link className="practice-link" href={`/pratique?categorie=${encodeURIComponent(category.name)}&nombre=25`}>
                Pratiquer toute la catégorie <span aria-hidden="true">→</span>
              </Link>
            </div>
          </details>
        ))}
      </section>

      <style>{`
        .categories-page{max-width:900px;margin:0 auto;padding:34px 22px 120px;background:#f7f9fd;min-height:100vh;color:#101f42}
        .categories-header{margin-bottom:26px}.categories-kicker{display:inline-block;background:#eaf2ff;color:#2367e8;font-weight:800;font-size:13px;padding:8px 12px;border-radius:999px}
        .categories-header h1{font-size:32px;line-height:1.12;margin:15px 0 10px}.categories-header p{color:#66738e;line-height:1.6;margin:0;max-width:680px}
        .taxonomy-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:20px;max-width:560px}.taxonomy-stats div{background:#fff;border:1px solid #e1e7f0;border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:3px}.taxonomy-stats strong{font-size:20px}.taxonomy-stats span{font-size:12px;color:#73809a;font-weight:700}
        .categories-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.category-card{background:#fff;border:1px solid #e1e7f0;border-radius:18px;box-shadow:0 5px 18px rgba(25,50,100,.06);overflow:hidden}
        .category-card>summary{list-style:none;display:flex;align-items:center;gap:14px;padding:20px;cursor:pointer}.category-card>summary::-webkit-details-marker{display:none}
        .category-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:#eef4ff;font-size:24px}.category-name{display:flex;flex-direction:column;gap:5px;flex:1}.category-name strong{font-size:17px}.category-name small{color:#7a879f;line-height:1.35}
        .category-arrow{font-size:24px;color:#4a67df;transition:transform .2s}.category-card[open]>summary .category-arrow{transform:rotate(180deg)}.topic-list{display:grid;gap:8px;padding:0 20px 20px}
        .topic-row{border-top:1px solid #edf1f7;padding:11px 2px;display:flex;align-items:center;justify-content:space-between;gap:12px}.topic-meta{display:flex;min-width:0;flex-direction:column;gap:3px}.topic-row strong{font-size:14px}.topic-row small{color:#7a879f}.topic-practice-link{flex:none;background:#eef4ff;color:#2367e8;border-radius:9px;padding:8px 10px;font-size:12px;font-weight:800}
        .practice-link{margin-top:5px;display:flex;justify-content:center;gap:8px;background:#2367e8;color:#fff;padding:12px 14px;border-radius:11px;font-weight:800;font-size:14px}
        @media(max-width:700px){.categories-page{padding:24px 16px 110px}.categories-header h1{font-size:27px}.categories-grid{grid-template-columns:1fr}.category-card>summary{padding:17px}.topic-list{padding:0 17px 17px}.taxonomy-stats{grid-template-columns:repeat(3,1fr)}.taxonomy-stats div{padding:11px 9px}.taxonomy-stats strong{font-size:18px}.topic-row{align-items:flex-start}.topic-practice-link{margin-top:1px}}
      `}</style>
    </main>
  );
}
