import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExamenInteractif from "@/components/ExamenInteractif";

export default async function ExamenPage({ params }: { params: Promise<{ taille: string }> }) {
  const { taille: tailleBrute } = await params;
  const taille = Number(tailleBrute);
  if (![25, 50, 100].includes(taille)) notFound();

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: questions, error } = await supabase
    .from("questions")
    .select("id,categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication")
    .limit(Math.max(taille * 3, taille));

  if (error || !questions || questions.length < taille) {
    return (
      <main className="exam-error-shell">
        <div className="exam-error-card">
          <span className="exam-format-icon" style={{ margin: "0 auto 16px" }}>!</span>
          <h2>Impossible de démarrer cet examen</h2>
          <p>La banque ne contient pas encore assez de questions pour générer une simulation de {taille} questions.</p>
          <Link className="exam-start-button" href="/examens">← Retour aux examens</Link>
        </div>
      </main>
    );
  }

  const selection = [...questions]
    .map((q) => ({ q, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, taille)
    .map(({ q }) => q);

  const dureeMinutes = taille === 25 ? 35 : taille === 50 ? 70 : 140;
  return <ExamenInteractif questions={selection} tailleDemandee={taille} dureeMinutes={dureeMinutes} />;
}
