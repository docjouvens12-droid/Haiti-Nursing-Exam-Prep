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
  statut?: string;
  chrono?: string;
};

type PracticeStatus = "toutes" | "nouvelles" | "incorrectes" | "favorites";

const SESSION_SIZES = [10, 25, 50, 100] as const;
const PRACTICE_STATUSES: { value: PracticeStatus; label: string }[] = [
  { value: "toutes", label: "Toutes les questions" },
  { value: "nouvelles", label: "Nouvelles" },
  { value: "incorrectes", label: "Incorrectes" },
  { value: "favorites", label: "Favorites" },
];

async function fetchPagedIds(buildQuery: (from: number, to: number) => any) {
  const ids: string[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as { question_id?: string | null; id?: string | null }[];
    ids.push(...rows.map((row) => row.question_id ?? row.id).filter(Boolean) as string[]);
    if (rows.length < pageSize) break;
  }
  return ids;
}

export default async function Pratique({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const categorieSelectionnee = (params.categorie ?? "").trim();
  const sousCategorieSelectionnee = (params.sous_categorie ?? "").trim();
  const anneeSelectionnee = (params.annee ?? "").trim();
  const statutDemande = (params.statut ?? "toutes").trim() as PracticeStatus;
  const statutSelectionne: PracticeStatus = PRACTICE_STATUSES.some((item) => item.value === statutDemande) ? statutDemande : "toutes";
  const chronometreActif = params.chrono === "oui";
  const nombreDemande = Number(params.nombre ?? 25);
  const nombreQuestions = SESSION_SIZES.includes(nombreDemande as (typeof SESSION_SIZES)[number]) ? nombreDemande : 25;

  const applyScope = (query: any) => {
    let scoped = query;
    if (categorieSelectionnee) scoped = scoped.eq("categorie", categorieSelectionnee);
    if (sousCategorieSelectionnee) scoped = scoped.eq("sous_categorie", sousCategorieSelectionnee);
    if (anneeSelectionnee) scoped = scoped.eq("annee", Number(anneeSelectionnee));
    return scoped;
  };

  let questions: any[] = [];

  if (statutSelectionne === "toutes") {
    const { data } = await applyScope(
      supabase
        .from("questions")
        .select("id,annee,categorie,sous_categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication")
        .order("id")
        .limit(nombreQuestions)
    );
    questions = data ?? [];
  } else {
    const scopedIds = await fetchPagedIds((from, to) =>
      applyScope(supabase.from("questions").select("id").order("id").range(from, to))
    );

    let eligible = new Set<string>();

    if (statutSelectionne === "favorites") {
      const favoriteIds = await fetchPagedIds((from, to) =>
        supabase.from("favorites").select("question_id").eq("user_id", userId).range(from, to)
      );
      eligible = new Set(favoriteIds);
    } else {
      const answeredIds = await fetchPagedIds((from, to) =>
        supabase.from("user_answers").select("question_id").eq("user_id", userId).range(from, to)
      );

      if (statutSelectionne === "nouvelles") {
        const answered = new Set(answeredIds);
        eligible = new Set(scopedIds.filter((id) => !answered.has(id)));
      } else {
        const incorrectIds = await fetchPagedIds((from, to) =>
          supabase.from("user_answers").select("question_id").eq("user_id", userId).eq("correcte", false).range(from, to)
        );
        eligible = new Set(incorrectIds);
      }
    }

    const selectedIds = scopedIds.filter((id) => eligible.has(id)).slice(0, nombreQuestions);
    if (selectedIds.length > 0) {
      const { data } = await supabase
        .from("questions")
        .select("id,annee,categorie,sous_categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication")
        .in("id", selectedIds);
      const byId = new Map((data ?? []).map((question: any) => [question.id, question]));
      questions = selectedIds.map((id) => byId.get(id)).filter(Boolean);
    }
  }

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
  const statutLabel = PRACTICE_STATUSES.find((item) => item.value === statutSelectionne)?.label ?? "Toutes les questions";
  const cleGroupe = `${categorieSelectionnee || "toutes"}-${sousCategorieSelectionnee || "toutes"}-${anneeSelectionnee || "toutes"}-${statutSelectionne}-${nombreQuestions}-${chronometreActif ? "chrono" : "libre"}`;

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
          <p>Activez le chronomètre pour vous entraîner à gérer votre temps, ou laissez-le désactivé pour étudier sans pression.</p>
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
              <p>Filtrez la banque et choisissez si vous souhaitez afficher un chronomètre pendant la session.</p>
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
                <span>Type de questions</span>
                <select name="statut" defaultValue={statutSelectionne}>
                  {PRACTICE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label>
                <span>Nombre de questions</span>
                <select name="nombre" defaultValue={String(nombreQuestions)}>
                  {SESSION_SIZES.map((size) => <option key={size} value={size}>{size} questions</option>)}
                </select>
              </label>
              <label>
                <span>Chronomètre</span>
                <select name="chrono" defaultValue={chronometreActif ? "oui" : "non"}>
                  <option value="non">Sans chronomètre</option>
                  <option value="oui">Avec chronomètre</option>
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
            <div><span>Type</span><strong>{statutLabel}</strong></div>
            <div><span>Chronomètre</span><strong>{chronometreActif ? "Activé" : "Désactivé"}</strong></div>
            <div><span>Questions chargées</span><strong>{questions.length} / {nombreQuestions}</strong></div>
          </div>

          {questions.length === 0 ? (
            <div className="practice-empty-state">
              <span>?</span>
              <h2>Aucune question trouvée</h2>
              <p>Aucune question ne correspond à ces filtres pour votre compte. Modifiez le type de questions, la catégorie ou la thématique.</p>
            </div>
          ) : (
            <QuestionInteractiveAvancee key={cleGroupe} questions={questions} chronometre={chronometreActif} />
          )}
        </section>
      </main>
    </div>
  );
}
