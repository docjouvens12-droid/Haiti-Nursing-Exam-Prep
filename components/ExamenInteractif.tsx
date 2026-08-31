"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Question = {
  id: string;
  categorie: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  bonne_reponse: "A" | "B" | "C" | "D";
  explication: string | null;
};

type Reponses = Record<string, "A" | "B" | "C" | "D">;

export default function ExamenInteractif({ questions, tailleDemandee, dureeMinutes }: { questions: Question[]; tailleDemandee: number; dureeMinutes: number }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({});
  const [secondesRestantes, setSecondesRestantes] = useState(dureeMinutes * 60);
  const [soumission, setSoumission] = useState(false);
  const question = questions[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondesRestantes((s) => {
        if (s <= 1) {
          clearInterval(timer);
          soumettreExamen();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const temps = useMemo(() => {
    const min = Math.floor(secondesRestantes / 60);
    const sec = secondesRestantes % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }, [secondesRestantes]);

  async function soumettreExamen() {
    if (soumission) return;
    setSoumission(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/connexion"); return; }

    const bonnes = questions.reduce((total, q) => total + (reponses[q.id] === q.bonne_reponse ? 1 : 0), 0);
    const { data: session, error: sessionError } = await supabase.from("exam_sessions").insert({
      user_id: user.id,
      mode: `examen_${tailleDemandee}`,
      score: bonnes,
      total_questions: questions.length,
      completed_at: new Date().toISOString(),
    }).select("id").single();

    if (sessionError || !session) { setSoumission(false); return; }

    const lignes = questions.map((q) => ({
      user_id: user.id,
      question_id: q.id,
      exam_session_id: session.id,
      reponse_choisie: reponses[q.id] ?? null,
      correcte: reponses[q.id] === q.bonne_reponse,
    }));

    await supabase.from("user_answers").insert(lignes);
    router.push(`/resultats/${session.id}`);
  }

  const options = [["A", question.option_a], ["B", question.option_b], ["C", question.option_c], ["D", question.option_d]] as const;

  return (
    <main className="container page">
      <div className="nav"><div><div className="logo">Examen simulé</div><small className="muted">{questions.length} questions</small></div><div className="card" style={{padding:"10px 16px"}}><strong>Temps restant : {temps}</strong></div></div>
      <div className="card" style={{maxWidth:860, margin:"20px auto"}}>
        <p className="muted">Question {index + 1} sur {questions.length} — {question.categorie}</p>
        <h2 className="question-title">{question.question}</h2>
        {options.map(([lettre, texte]) => <button key={lettre} className={`option ${reponses[question.id] === lettre ? "selected" : ""}`} onClick={() => setReponses((r) => ({ ...r, [question.id]: lettre }))}>{lettre}. {texte}</button>)}
        <div className="actions" style={{justifyContent:"space-between"}}>
          <button className="btn btn-secondary" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>Précédente</button>
          {index < questions.length - 1 ? <button className="btn btn-primary" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}>Suivante</button> : <button className="btn btn-primary" disabled={soumission} onClick={soumettreExamen}>{soumission ? "Soumission..." : "Soumettre l’examen"}</button>}
        </div>
        <p className="muted">Réponses enregistrées localement pendant l’examen : {Object.keys(reponses).length}/{questions.length}</p>
      </div>
    </main>
  );
}
