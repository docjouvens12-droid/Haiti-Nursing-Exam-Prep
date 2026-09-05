import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionInteractiveAvancee from "@/components/QuestionInteractiveAvancee";
import PracticeFilters from "@/components/PracticeFilters";
import { CATEGORIES_QUESTIONS, libelleCategorie } from "@/lib/categories";
import "./pratique.css";
import "./qcm-mobile.css";

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
      const favoriteIds = await fetchPagedIds((from, to) => supabase.from("favorites").select("question_id").eq("user_id", userId).range(from, to));
      eligible = new Set(favoriteIds);
    } else {
      const answeredIds = await fetchPagedIds((from, to) => supabase.from("user_answers").select("question_id").eq("user_id", userId).range(from, to));
      if (statutSelectionne === "nouvelles") {
        const answered = new Set(answeredIds);
        eligible = new Set(scopedIds.filter((id) => !answered.has(id)));
      } else {
        const incorrectIds = await fetchPagedIds((from, to) => supabase.from("user_answers").select("question_id").eq("user_id", userId).eq("correcte", false).range(from, to));
        eligible = new Set(incorrectIds);
      }
    }

    const selectedIds = scopedIds.filter((id) => eligible.has(id)).slice(0, nombreQuestions);
    if (selectedIds.length > 0) {
      const { data } = await supabase.from("questions").select("id,annee,categorie,sous_categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication").in("id", selectedIds);
      const byId = new Map((data ?? []).map((question: any) => [question.id, question]));
      questions = selectedIds.map((id) => byId.get(id)).filter(Boolean);
    }
  }

  const [{ data: taxonomyData }, { data: anneesData }] = await Promise.all([
    supabase.from("questions").select("categorie,sous_categorie").not("categorie", "is", null),
    supabase.from("questions").select("annee").not("annee", "is", null),
  ]);

  const categoriesExistantes = Array.from(new Set((taxonomyData ?? []).map((x) => x.categorie).filter(Boolean) as string[]));
  const categoriesPrincipales = CATEGORIES_QUESTIONS.filter((categorie) => categoriesExistantes.includes(categorie));
  const categoriesSupplementaires = categoriesExistantes.filter((categorie) => !CATEGORIES_QUESTIONS.includes(categorie as any)).sort((a, b) => a.localeCompare(b, "fr"));
  const categories = [...categoriesPrincipales, ...categoriesSupplementaires];
  const annees = Array.from(new Set((anneesData ?? []).map((x) => x.annee).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
  const statutLabel = PRACTICE_STATUSES.find((item) => item.value === statutSelectionne)?.label ?? "Toutes les questions";
  const cleGroupe = `${categorieSelectionnee || "toutes"}-${sousCategorieSelectionnee || "toutes"}-${anneeSelectionnee || "toutes"}-${statutSelectionne}-${nombreQuestions}-${chronometreActif ? "chrono" : "libre"}`;

  return (
    <div className="practice-shell">
      <aside className="practice-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup"><span className="brand-mark">✚</span><span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span></Link>
        <nav className="side-nav">
          <Link href="/tableau-de-bord">⌂ <span>Accueil</span></Link>
          <Link className="active" href="/pratique">✎ <span>Questions</span></Link>
          <Link href="/categories">▦ <span>Catégories & thématiques</span></Link>
          <Link href="/examens">▣ <span>Examens</span></Link>
          <Link href="/questions-incorrectes">⊗ <span>Questions incorrectes</span></Link>
          <Link href="/favoris">♡ <span>Favoris</span></Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
        </nav>
        <div className="practice-sidebar-note"><strong>Conseil d’étude</strong><p>Activez le chronomètre pour vous entraîner à gérer votre temps, ou laissez-le désactivé pour étudier sans pression.</p></div>
      </aside>

      <main className="practice-main">
        <header className="practice-topbar"><div><span className="practice-breadcrumb">Accueil / Questions</span><h1>Pratique de questions</h1></div><Link href="/categories" className="practice-back-link">← Catégories & thématiques</Link></header>
        <section className="practice-content">
          <div className="practice-filter-card">
            <div><span className="practice-eyebrow">Programme infirmier haïtien</span><h2>Choisissez le domaine que vous souhaitez réviser</h2><p>Les catégories suivent les grands domaines de la formation infirmière et restent reliées aux 6 425 questions existantes.</p></div>
            <PracticeFilters
              categories={categories}
              topicRows={taxonomyData ?? []}
              statuses={PRACTICE_STATUSES}
              sessionSizes={SESSION_SIZES}
              annees={annees}
              initial={{ categorie: categorieSelectionnee, sousCategorie: sousCategorieSelectionnee, statut: statutSelectionne, nombre: nombreQuestions, chrono: chronometreActif, annee: anneeSelectionnee }}
            />
          </div>

          <div className="practice-session-summary">
            <div><span>Catégorie</span><strong>{categorieSelectionnee ? libelleCategorie(categorieSelectionnee) : "Toutes"}</strong></div>
            <div><span>Thématique</span><strong>{sousCategorieSelectionnee || "Toutes"}</strong></div>
            <div><span>Type</span><strong>{statutLabel}</strong></div>
            <div><span>Chronomètre</span><strong>{chronometreActif ? "Activé" : "Désactivé"}</strong></div>
            <div><span>Questions chargées</span><strong>{questions.length} / {nombreQuestions}</strong></div>
          </div>

          {questions.length === 0 ? (
            <div className="practice-empty-state"><span>?</span><h2>Aucune question trouvée</h2><p>Aucune question ne correspond à ces filtres pour votre compte. Modifiez le type de questions, la catégorie ou la thématique.</p></div>
          ) : (
            <QuestionInteractiveAvancee key={cleGroupe} questions={questions} chronometre={chronometreActif} />
          )}
        </section>
      </main>
    </div>
  );
}
