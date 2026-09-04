import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionInteractiveAvancee from "@/components/QuestionInteractiveAvancee";
import { CATEGORIES_QUESTIONS } from "@/lib/categories";
import "./pratique.css";

type SearchParams = {
  categorie?: string;
  sous_categorie?: string;
  annee?: string;
  nombre?: string;
};

const SESSION_SIZES = [10, 25, 50, 100] as const;

export default async function Pratique({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const categorieSelectionnee = (params.categorie ?? "").trim();
  const sousCategorieSelectionnee = (params.sous_categorie ?? "").trim();
  const anneeSelectionnee = (params.annee ?? "").trim();
  const nombreDemande = Number(params.nombre ?? 25);
  const nombreQuestions = SESSION_SIZES.includes(nombreDemande as (typeof SESSION_SIZES)[number]) ? nombreDemande : 25;

  let query = supabase
    .from("questions")
    .select("id,annee,categorie,sous_categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication")
    .order("id")
    .limit(nombreQuestions);

  if (categorieSelectionnee) query = query.eq("categorie", categorieSelectionnee);
  if (sousCategorieSelectionnee) query = query.eq("sous_categorie", sousCategorieSelectionnee);
  if (anneeSelectionnee) query = query.eq("annee", Number(anneeSelectionnee));
  const { data: questions } = await query;

  const [{ data: categoriesData }, { data: anneesData }, { data: topicsData }] = await Promise.all([
    supabase.from("questions").select("categorie").not("categorie", "is", null),
    supabase.from("questions").select("annee").not("annee", "is", null),
    categorieSelectionnee
      ? supabase.from("questions").select("sous_categorie").eq("categorie", categorieSelectionnee).not("sous_categorie", "is", null)
      : Promise.resolve({ data: [] as { sous_categorie: string | null }[] }),
  ]);

  const categoriesExistantes = (categoriesData ?? []).map((x) => x.categorie).filter(Boolean) as string[];
  const categories = Array.from(new Set([...CATEGORIES_QUESTIONS, ...categoriesExistantes])).sort((a, b) => a.localeCompare(b, "fr"));
  const annees = Array.from(new Set((anneesData ?? []).map((x) => x.annee).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
  const sousCategories = Array.from(new Set((topicsData ?? []).map((x) => x.sous_categorie).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "fr"));
  const cleGroupe = `${categorieSelectionnee || "toutes"}-${sousCategorieSelectionnee || "toutes"}-${anneeSelectionnee || "toutes"}-${nombreQuestions}`;

  return (
    <div className="practice-shell">
      <aside className="practice-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup">
          <span className="brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>
        <nav className="side-nav">
          <Link href="/tableau-de-bord">⌂ <span>Accueil</span></Link>
          <Link className="active" href="/pratique">✎ <span>Questions</span></Link>
          <Link href="/categories">▦ <span>Catégories & thématiques</span></Link>
          <Link href="/examens">▣ <span>Examens</span></Link>
          <Link href="/questions-incorrectes">⊗ <span>Questions incorrectes</span></Link>
          <Link href="/favoris">♡ <span>Favoris</span></Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
        </nav>
        <div className="practice-sidebar-note">
          <strong>Conseil d’étude</strong>
          <p>Travaillez une thématique à la fois et révisez les explications après chaque réponse.</p>
        </div>
      </aside>

      <main className="practice-main">
        <header className="practice-topbar">
          <div>
            <span className="practice-breadcrumb">Accueil / Questions</span>
            <h1>Pratique de questions</h1>
          </div>
          <Link href="/categories" className="practice-back-link">← Catégories & thématiques</Link>
        </header>

        <section className="practice-content">
          <div className="practice-filter-card">
            <div>
              <span className="practice-eyebrow">Personnalisez votre session</span>
              <h2>Choisissez ce que vous souhaitez réviser</h2>
              <p>Filtrez la banque par catégorie, thématique, année et nombre de questions.</p>
            </div>
            <form method="get" action="/pratique" className="practice-filter-form">
              <label>
                <span>Catégorie</span>
                <select name="categorie" defaultValue={categorieSelectionnee}>
                  <option value="">Toutes les catégories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                <span>Thématique</span>
                <select name="sous_categorie" defaultValue={sousCategorieSelectionnee} disabled={!categorieSelectionnee}>
                  <option value="">{categorieSelectionnee ? "Toutes les thématiques" : "Choisissez d’abord une catégorie"}</option>
                  {sousCategories.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                </select>
              </label>
              <label>
                <span>Nombre de questions</span>
                <select name="nombre" defaultValue={String(nombreQuestions)}>
                  {SESSION_SIZES.map((size) => <option key={size} value={size}>{size} questions</option>)}
                </select>
              </label>
              <label>
                <span>Année</span>
                <select name="annee" defaultValue={anneeSelectionnee}>
                  <option value="">Toutes les années</option>
                  {annees.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <button className="practice-primary-action" type="submit">Démarrer la session</button>
              <Link className="practice-reset" href="/pratique">Réinitialiser</Link>
            </form>
          </div>

          <div className="practice-session-summary">
            <div><span>Catégorie</span><strong>{categorieSelectionnee || "Toutes"}</strong></div>
            <div><span>Thématique</span><strong>{sousCategorieSelectionnee || "Toutes"}</strong></div>
            <div><span>Questions chargées</span><strong>{questions?.length ?? 0} / {nombreQuestions}</strong></div>
          </div>

          {!questions || questions.length === 0 ? (
            <div className="practice-empty-state">
              <span>?</span>
              <h2>Aucune question trouvée</h2>
              <p>Choisissez une autre catégorie, thématique ou année pour continuer votre révision.</p>
            </div>
          ) : (
            <QuestionInteractiveAvancee key={cleGroupe} questions={questions} />
          )}
        </section>
      </main>
    </div>
  );
}
