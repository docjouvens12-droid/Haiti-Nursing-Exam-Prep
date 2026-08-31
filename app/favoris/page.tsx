import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "../revision.module.css";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function Favoris() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const { data: favoris } = await supabase
    .from("favorites")
    .select(`question_id,created_at,questions(annee,categorie,question,bonne_reponse,explication)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const categories = new Set(
    (favoris ?? []).map((f: any) => {
      const q = Array.isArray(f.questions) ? f.questions[0] : f.questions;
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
          <Link href="/questions-incorrectes">⊗ <span>Incorrectes</span></Link>
          <Link className={styles.active} href="/favoris">♡ <span>Favoris</span></Link>
          <Link href="/nightingale">✦ <span>Nightingale AI</span></Link>
        </nav>
        <div className={styles.tip}>
          <strong>Votre bibliothèque personnelle</strong>
          <p>Gardez ici les questions importantes que vous souhaitez revoir avant un examen.</p>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.breadcrumb}>Accueil / Révision</span>
            <h1>Questions favorites</h1>
          </div>
          <Link className={styles.back} href="/tableau-de-bord">← Tableau de bord</Link>
        </header>

        <section className={styles.content}>
          <div className={styles.hero}>
            <div className={styles.heroCard}>
              <span className={styles.eyebrow}>Votre sélection</span>
              <h2>Révisez ce qui compte le plus pour vous</h2>
              <p>Vos favoris regroupent les questions que vous avez choisies de conserver pour une révision rapide et ciblée.</p>
            </div>
            <div className={styles.countCard}>
              <span className={styles.countIcon}>♡</span>
              <div><strong>{favoris?.length ?? 0}</strong><span>question{(favoris?.length ?? 0) > 1 ? "s" : ""} sauvegardée{(favoris?.length ?? 0) > 1 ? "s" : ""} · {categories.size} catégorie{categories.size > 1 ? "s" : ""}</span></div>
            </div>
          </div>

          <div className={styles.toolbar}>
            <h2>Mes favoris</h2>
            <Link href="/pratique">Ajouter depuis la pratique →</Link>
          </div>

          {favoris && favoris.length > 0 ? (
            <div className={styles.list}>
              {favoris.map((f: any, index: number) => {
                const q = Array.isArray(f.questions) ? f.questions[0] : f.questions;
                return (
                  <article className={styles.card} key={f.question_id}>
                    <div className={styles.cardTop}>
                      <div className={styles.meta}>
                        <span className={styles.category}>{q?.categorie || "Question"}</span>
                        {q?.annee && <span className={styles.year}>{q.annee}</span>}
                        {f.created_at && <span className={styles.year}>Ajoutée le {formatDate(f.created_at)}</span>}
                      </div>
                      <span className={styles.statusFav}>Favori</span>
                    </div>
                    <h3>{index + 1}. {q?.question}</h3>
                    <div className={styles.answerBox}>
                      <div><span>Bonne réponse</span><strong className={styles.correct}>{q?.bonne_reponse ?? "—"}</strong></div>
                      <div><span>Objectif</span><strong>À maîtriser</strong></div>
                    </div>
                    {q?.explication && <div className={styles.explanation}><strong>Explication clinique</strong><p>{q.explication}</p></div>}
                    <div className={styles.actions}>
                      <Link className={styles.primary} href={`/pratique${q?.categorie ? `?categorie=${encodeURIComponent(q.categorie)}` : ""}`}>Réviser cette matière</Link>
                      <Link className={styles.secondary} href="/nightingale">Approfondir avec Nightingale AI</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>♡</span>
              <h2>Aucun favori pour le moment</h2>
              <p>Ajoutez des questions à vos favoris pendant vos sessions de pratique.</p>
              <Link className={styles.primary} href="/pratique">Commencer à pratiquer</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
