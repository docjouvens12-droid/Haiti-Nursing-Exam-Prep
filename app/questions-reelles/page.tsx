import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionInteractive from "@/components/QuestionInteractive";

export default async function QuestionsReelles() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: questions, error } = await supabase.from("questions").select("id,categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication").limit(20);
  if (error) return <main className="container page"><div className="card">Erreur de chargement des questions.</div></main>;
  if (!questions || questions.length === 0) return <main className="container page"><div className="card"><h2>Aucune question dans la base de données</h2><p className="muted">Ajoutez des questions dans Supabase pour commencer.</p></div></main>;
  return <QuestionInteractive questions={questions} />;
}
