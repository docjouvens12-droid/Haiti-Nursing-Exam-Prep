"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AnswerExplanation from "./AnswerExplanation";

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

export default function QuestionInteractive({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [valide, setValide] = useState(false);
  const q = questions[index];
  const options = [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]] as const;

  async function valider() {
    if (!choix) return;
    setValide(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_answers").insert({ user_id: user.id, question_id: q.id, reponse_choisie: choix, correcte: choix === q.bonne_reponse });
    }
  }

  function suivante() {
    setIndex((index + 1) % questions.length);
    setChoix(null);
    setValide(false);
  }

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Mode pratique</div><Link href="/tableau-de-bord">Retour au tableau de bord</Link></div>
      <div className="card" style={{maxWidth:820, margin:"20px auto"}}>
        <p className="muted">{q.categorie} — Question {index + 1} sur {questions.length}</p>
        <h2 className="question-title">{q.question}</h2>
        {options.map(([lettre, texte]) => <button key={lettre} className={`option ${choix === lettre ? "selected" : ""}`} onClick={() => !valide && setChoix(lettre)}>{lettre}. {texte}</button>)}
        {!valide ? <button className="btn btn-primary" disabled={!choix} onClick={valider}>Valider la réponse</button> : <><div className="feedback"><strong>{choix === q.bonne_reponse ? "Bonne réponse ✅" : "Réponse incorrecte"}</strong><AnswerExplanation question={q} selected={choix} /></div><button className="btn btn-primary" onClick={suivante}>Question suivante</button></>}
      </div>
    </main>
  );
}
