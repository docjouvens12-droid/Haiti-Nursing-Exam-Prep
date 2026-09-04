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
    .select(`id,answered_at,reponse_choisie,question_id,correcte,questions(annee,categorie,sous_categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication)`)
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(1000);

  const historique = new Map<string, any[]>();
  for (const ligne of lignes ?? []) {
    const courant = historique.get((ligne as any).question_id) ?? [];
    courant.push(ligne);
    historique.set((ligne as any).question_id, courant);
  }

  const erreursPassees = [...historique.entries()]
    .filter(([, tentatives]) => tentatives.some((t) => !t.correcte))
    .map(([questionId, tentatives]) => {
      const derniere = tentatives[0];
      const erreurs = tentatives.filter((t) => !t.correcte).length;
      const reussites = tentatives.filter((t) => t.correcte).length;
      return {
        questionId,
        derniere,
        erreurs,
        reussites,
        maitrisee: Boolean(derniere.correcte),
      };
    });

  const aRevoir = erreursPassees.filter((x) => !x.maitrisee);
  const maitrisees = erreursPassees.filter((x) => x.maitrisee);
  const categories = new Set(aRevoir.map((item) => {
    const q = Array.isArray(item.derniere.questions) ? item.derniere.questions[0] : item.derniere.questions;
    return q?.categorie;
  }).filter(Boolean));

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
          <Link href="/categories">▦ <span>Catégories & thématiques</span></Link>
          <Link href="/examens">▣ <span>Examens</span></Link>
          <Link className={styles.active} href="/questions-incorrectes">⊗ <span>Incorrectes</span></Link>
          <Link href="/favoris">♡ <span>Favoris</span></Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
        </nav>
        <div className={styles.tip}>
          <strong>Révision ciblée</strong>
          <p>Une question passe dans « Maîtrisées » dès que votre tentative la plus récente est correcte.</p>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.breadcrumb}>Accueil / Révision</span>
            <h1>Révision des erreurs</h1>
          </div>
          <Link className={styles.back} href="/tableau-de-bord">← Tableau de bord</Link>
        </header>

        <section className={styles.content}>
          <div className={styles.hero}>
            <div className={styles.heroCard}>
              <span className={styles.eyebrow}>Remédiation personnalisée</span>
              <h2>Transformez vos erreurs en acquis</h2>
              <p>Retravaillez les questions manquées, consultez leurs explications et suivez automatiquement celles que vous avez ensuite maîtrisées.</p>
            </div>
            <div className={styles.countCard}>
              <span className={styles.countIcon}>×</span>
              <div><strong>{aRevoir.length}</strong><span>à revoir · {maitrisees.length} maîtrisée{maitrisees.length > 1 ? "s" : ""} · {categories.size} catégorie{categories.size > 1 ? "s" : ""}</span></div>
            </div>
          </div>

          <div className={styles.toolbar}>
            <h2>À revoir maintenant</h2>
            <Link href="/pratique?statut=incorrectes&nombre=25">Lancer une session erreurs →</Link>
          </div>

          {aRevoir.length > 0 ? (
            <div className={styles.list}>
              {aRevoir.map((item, index) => {
                const r = item.derniere;
                const q = Array.isArray(r.questions) ? r.questions[0] : r.questions;
                const pratiqueHref = `/pratique?statut=incorrectes&nombre=25${q?.categorie ? `&categorie=${encodeURIComponent(q.categorie)}` : ""}${q?.sous_categorie ? `&sous_categorie=${encodeURIComponent(q.sous_categorie)}` : ""}`;
                return (
                  <article className={styles.card} key={item.questionId}>
                    <div className={styles.cardTop}>
                      <div className={styles.meta}>
                        <span className={styles.category}>{q?.categorie || "Question"}</span>
                        {q?.sous_categorie && <span className={styles.year}>{q.sous_categorie}</span>}
                        {r.answered_at && <span className={styles.year}>{formatDate(r.answered_at)}</span>}
                      </div>
                      <span className={styles.statusBad}>À revoir</span>
                    </div>
                    <h3>{index + 1}. {q?.question}</h3>
                    <div className={styles.answerBox}>
                      <div><span>Dernière réponse</span><strong className={styles.wrong}>{r.reponse_choisie ?? "Aucune réponse"}</strong></div>
                      <div><span>Bonne réponse</span><strong className={styles.correct}>{q?.bonne_reponse ?? "—"}</strong></div>
                    </div>
                    <p style={{ margin: "10px 0", color: "#667085", fontSize: 14 }}>
                      {item.erreurs} erreur{item.erreurs > 1 ? "s" : ""} enregistrée{item.erreurs > 1 ? "s" : ""}{item.reussites ? ` · ${item.reussites} réussite${item.reussites > 1 ? "s" : ""}` : ""}
                    </p>
                    {q && <div className={styles.explanation}><AnswerExplanation question={q} selected={r.reponse_choisie} /></div>}
                    <div className={styles.actions}>
                      <Link className={styles.primary} href={pratiqueHref}>Retenter cette thématique</Link>
                      <Link className={styles.secondary} href="/nightingale">Demander à Nightingale AI</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>✓</span>
              <h2>Aucune erreur active à revoir</h2>
              <p>Toutes les questions précédemment manquées ont été réussies lors de votre tentative la plus récente.</p>
              <Link className={styles.primary} href="/pratique">Continuer à pratiquer</Link>
            </div>
          )}

          {maitrisees.length > 0 && (
            <>
              <div className={styles.toolbar} style={{ marginTop: 28 }}>
                <h2>Maîtrisées après révision</h2>
                <span>{maitrisees.length} question{maitrisees.length > 1 ? "s" : ""}</span>
              </div>
              <div className={styles.list}>
                {maitrisees.slice(0, 20).map((item) => {
                  const r = item.derniere;
                  const q = Array.isArray(r.questions) ? r.questions[0] : r.questions;
                  return (
                    <article className={styles.card} key={item.questionId}>
                      <div className={styles.cardTop}>
                        <div className={styles.meta}>
                          <span className={styles.category}>{q?.categorie || "Question"}</span>
                          {q?.sous_categorie && <span className={styles.year}>{q.sous_categorie}</span>}
                        </div>
                        <span style={{ fontWeight: 800, color: "#16865c" }}>✓ Maîtrisée</span>
                      </div>
                      <h3>{q?.question}</h3>
                      <p style={{ margin: "8px 0 0", color: "#667085", fontSize: 14 }}>
                        Dernière tentative correcte · {item.erreurs} erreur{item.erreurs > 1 ? "s" : ""} auparavant
                      </p>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
