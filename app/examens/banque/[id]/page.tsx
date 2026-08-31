import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExamenInteractif from "@/components/ExamenInteractif";

export default async function ExamenBanquePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: banque, error: banqueError } = await supabase
    .from("exam_banks")
    .select("id,annee,session,titre,authenticite,total_questions")
    .eq("id", id)
    .single();

  if (banqueError || !banque) notFound();

  const { data: liens, error: liensError } = await supabase
    .from("exam_bank_questions")
    .select("question_id,numero_question")
    .eq("exam_bank_id", id)
    .order("numero_question", { ascending: true });

  if (liensError || !liens?.length) {
    return (
      <main className="exam-error-shell">
        <div className="exam-error-card">
          <span className="exam-format-icon" style={{ margin: "0 auto 16px" }}>!</span>
          <h2>Examen indisponible</h2>
          <p>Les questions de cette banque ne sont pas encore disponibles.</p>
          <Link className="exam-start-button" href="/examens">← Retour aux examens</Link>
        </div>
      </main>
    );
  }

  const ids = liens.map((l) => l.question_id);
  const { data: questionsBrutes, error: questionsError } = await supabase
    .from("questions")
    .select("id,categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication")
    .in("id", ids);

  if (questionsError || !questionsBrutes || questionsBrutes.length !== liens.length) {
    return (
      <main className="exam-error-shell">
        <div className="exam-error-card">
          <span className="exam-format-icon" style={{ margin: "0 auto 16px" }}>!</span>
          <h2>Impossible de charger cet examen</h2>
          <p>La banque est incomplète. Aucun examen ne sera lancé afin de préserver l’ordre et l’intégrité des 100 questions.</p>
          <Link className="exam-start-button" href="/examens">← Retour aux examens</Link>
        </div>
      </main>
    );
  }

  const parId = new Map(questionsBrutes.map((q) => [q.id, q]));
  const questions = liens.map((l) => parId.get(l.question_id)).filter(Boolean) as typeof questionsBrutes;

  if (questions.length !== liens.length) notFound();

  return (
    <ExamenInteractif
      questions={questions}
      tailleDemandee={questions.length}
      dureeMinutes={140}
      modeSession={`examen_reconstitue_${banque.annee}`}
      titreSession={`Examen reconstitué ${banque.annee}`}
      sousTitreSession="Préparation Examen d’État Haïtien · Banque non officielle"
    />
  );
}
