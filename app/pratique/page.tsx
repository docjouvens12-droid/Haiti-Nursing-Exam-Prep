import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionInteractiveAvancee from "@/components/QuestionInteractiveAvancee";
import { CATEGORIES_QUESTIONS } from "@/lib/categories";

export default async function Pratique({ searchParams }: { searchParams: Promise<{ categorie?: string; annee?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  let query = supabase.from("questions").select("id,annee,categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication").limit(50);
  if (params.categorie) query = query.eq("categorie", params.categorie);
  if (params.annee) query = query.eq("annee", Number(params.annee));
  const { data: questions } = await query;

  const { data: categoriesData } = await supabase.from("questions").select("categorie").not("categorie", "is", null);
  const { data: anneesData } = await supabase.from("questions").select("annee").not("annee", "is", null);
  const categoriesExistantes = (categoriesData ?? []).map((x) => x.categorie).filter(Boolean);
  const categories = Array.from(new Set([...CATEGORIES_QUESTIONS, ...categoriesExistantes])).sort((a, b) => a.localeCompare(b, "fr"));
  const annees = Array.from(new Set((anneesData ?? []).map((x) => x.annee).filter(Boolean))).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Mode pratique avancé</div><Link href="/tableau-de-bord">Tableau de bord</Link></div>
      <div className="card" style={{marginBottom:20}}><form method="get" style={{display:"flex", gap:12, flexWrap:"wrap", alignItems:"end"}}><div className="field" style={{marginBottom:0}}><label>Catégorie</label><select name="categorie" defaultValue={params.categorie ?? ""}><option value="">Toutes les catégories</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div><div className="field" style={{marginBottom:0}}><label>Année</label><select name="annee" defaultValue={params.annee ?? ""}><option value="">Toutes les années</option>{annees.map((a) => <option key={a} value={a}>{a}</option>)}</select></div><button className="btn btn-primary" type="submit">Filtrer</button><Link className="btn btn-secondary" href="/pratique">Réinitialiser</Link></form></div>
      {!questions || questions.length === 0 ? <div className="card"><h2>Aucune question trouvée</h2><p className="muted">Cette catégorie est prête à recevoir des questions. Choisissez une autre catégorie ou importez davantage de questions.</p></div> : <QuestionInteractiveAvancee questions={questions} />}
    </main>
  );
}
