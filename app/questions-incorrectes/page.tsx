import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "../revision.module.css";
import AnswerExplanation from "@/components/AnswerExplanation";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function QuestionsIncorrectes() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const { data: lignes } = await supabase
    .from("user_answers")
    .select(`id,answered_at,reponse_choisie,question_id,questions(annee,categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication)`)
    .eq("user_id", userId)
    .eq("correcte", false)
    .order("answered_at", { ascending: false })
    .limit(100);

  const vues = new Set<string>();
  const uniques = (lignes ?? []).filter((x: any) => {
    if (vues.has(x.question_id)) return false;
    vues.add(x.question_id);
    return true;
  });

  const categories = new Set(
    uniques.map((r: any) => {
      const q = Array.isArray(r.questions) ? r.questions[0] : r.questions;
      return q?.categorie;
    }).filter(Boolean)
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/tableau-de-bord" className={styles.brand}>
          <span className={styles.brandMark}>✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/tableau-de-bord">⌂ <span>Accueil</span></Link>
          <Link href="/pratique">✎ <span>Questions</span></Link>
          <Link href="/examens">▣ <span>Examens</span></Link>
          <Link className={styles.active} href="/questions-incorrectes">⊗ <span>Incorrectes</span></Link>
          <Link href="/favoris">♡ <span>Favoris</span></Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
        </nav>
        <div className={styles.tip}>
          <strong>Révision ciblée</strong>
          <p>Commencez par les catégories qui reviennent le plus souvent dans vos erreurs.</p>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.breadcrumb}>Accueil / Révision</span>
            <h1>Questions incorrectes</h1>
          </div>
          <Link className={styles.back} href="/tableau-de-bord">← Tableau de bord</Link>
        </header>

        <section className={styles.content}>
          <div className={styles.hero}>
            <div className={styles.heroCard}>
              <span className={styles.eyebrow}>Votre zone de progression</span>
              <h2>Transformez vos erreurs en points forts</h2>
              <p>Retrouvez ici les questions manquées récemment, leur bonne réponse et leur explication pour une révision plus efficace.</p>
            </div>
            <div className={styles.countCard}>
              <span className={styles.countIcon}>×</span>
              <div><strong>{uniques.length}</strong><span>question{uniques.length > 1 ? "s" : ""} à revoir · {categories.size} catégorie{categories.size > 1 ? "s" : ""}</span></div>
            </div>
          </div>

          <div className={styles.toolbar}>
            <h2>À revoir</h2>
            <Link href="/pratique">Continuer à pratiquer →</Link>
          </div>

          {uniques.length > 0 ? (
            <div className={styles.list}>
              {uniques.map((r: any, index: number) => {
                const q = Array.isArray(r.questions) ? r.questions[0] : r.questions;
                return (
                  <article className={styles.card} key={r.question_id}>
                    <div className={styles.cardTop}>
                      <div className={styles.meta}>
                        <span className={styles.category}>{q?.categorie || "Question"}</span>
                        {q?.annee && <span className={styles.year}>{q.annee}</span>}
                        {r.answered_at && <span className={styles.year}>{formatDate(r.answered_at)}</span>}
                      </div>
                      <span className={styles.statusBad}>À revoir</span>
                    </div>
                    <h3>{index + 1}. {q?.question}</h3>
                    <div className={styles.answerBox}>
                      <div><span>Votre réponse</span><strong className={styles.wrong}>{r.reponse_choisie ?? "Aucune réponse"}</strong></div>
                      <div><span>Bonne réponse</span><strong className={styles.correct}>{q?.bonne_reponse ?? "—"}</strong></div>
                    </div>
                    {q && <div className={styles.explanation}><AnswerExplanation question={q} selected={r.reponse_choisie} /></div>}
                    <div className={styles.actions}>
                      <Link className={styles.primary} href={`/pratique${q?.categorie ? `?categorie=${encodeURIComponent(q.categorie)}` : ""}`}>Réviser cette matière</Link>
                      <Link className={styles.secondary} href="/nightingale">Demander à Nightingale AI</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>✓</span>
              <h2>Aucune question incorrecte</h2>
              <p>Vous n’avez actuellement aucune erreur enregistrée à réviser.</p>
              <Link className={styles.primary} href="/pratique">Continuer à pratiquer</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
