import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionInteractive from "@/components/QuestionInteractive";
import SelectionCategorieEtudiant from "@/components/SelectionCategorieEtudiant";

export default async function QuestionsReelles({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const params = await searchParams;
  const categorie = (params.categorie ?? "").trim();
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: categoriesRows } = await supabase
    .from("questions")
    .select("categorie")
    .not("categorie", "is", null);

  const compteur = new Map<string, number>();
  for (const row of categoriesRows ?? []) {
    if (!row.categorie) continue;
    compteur.set(row.categorie, (compteur.get(row.categorie) ?? 0) + 1);
  }

  const categories = [...compteur.entries()]
    .map(([nom, total]) => ({ nom, total }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  let query = supabase
    .from("questions")
    .select("id,categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication")
    .limit(20);

  if (categorie) query = query.eq("categorie", categorie);

  const { data: questions, error } = await query;

  if (error) {
    return <main className="container page"><div className="card">Erreur de chargement des questions.</div></main>;
  }

  return (
    <main className="container page">
      <div className="nav">
        <div>
          <div className="logo">Catégories de questions</div>
          <small className="muted">Choisissez une matière pour commencer à réviser.</small>
        </div>
        <Link href="/tableau-de-bord">Tableau de bord</Link>
      </div>

      <div className="card" style={{ margin: "24px 0" }}>
        <SelectionCategorieEtudiant categories={categories} valeur={categorie} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginBottom: 24 }}>
        {categories.map((cat) => (
          <Link
            key={cat.nom}
            href={`/questions-reelles?categorie=${encodeURIComponent(cat.nom)}`}
            className="card"
            style={{ textDecoration: "none" }}
          >
            <strong>{cat.nom}</strong>
            <div className="muted" style={{ marginTop: 6 }}>{cat.total.toLocaleString("fr-FR")} question(s)</div>
          </Link>
        ))}
      </div>

      {categorie && (
        <div className="card" style={{ marginBottom: 20 }}>
          <strong>Catégorie sélectionnée : {categorie}</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            {compteur.get(categorie)?.toLocaleString("fr-FR") ?? 0} question(s) disponibles dans cette catégorie.
          </p>
        </div>
      )}

      {!questions || questions.length === 0 ? (
        <div className="card">
          <h2>Aucune question trouvée</h2>
          <p className="muted">Cette catégorie ne contient pas encore de questions.</p>
        </div>
      ) : (
        <QuestionInteractive key={categorie || "toutes"} questions={questions} />
      )}
    </main>
  );
}
