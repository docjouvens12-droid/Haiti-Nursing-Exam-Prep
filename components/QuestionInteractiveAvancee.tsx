"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Question = {
  id: string;
  annee: number | null;
  categorie: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  bonne_reponse: "A" | "B" | "C" | "D";
  explication: string | null;
};

function melanger<T>(tableau: T[]) {
  return [...tableau].map((x) => ({ x, r: Math.random() })).sort((a, b) => a.r - b.r).map(({ x }) => x);
}

export default function QuestionInteractiveAvancee({ questions }: { questions: Question[] }) {
  const questionsMelangees = useMemo(() => melanger(questions), [questions]);
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [valide, setValide] = useState(false);
  const [favori, setFavori] = useState(false);

  useEffect(() => {
    setIndex(0);
    setChoix(null);
    setValide(false);
    setFavori(false);
  }, [questions]);

  const q = questionsMelangees[index] ?? questionsMelangees[0];
  if (!q) return null;
  const options = [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]] as const;

  async function valider() {
    if (!choix) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_answers").insert({ user_id: user.id, question_id: q.id, reponse_choisie: choix, correcte: choix === q.bonne_reponse });
    setValide(true);
  }

  async function basculerFavori() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (favori) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("question_id", q.id);
      setFavori(false);
    } else {
      await supabase.from("favorites").upsert({ user_id: user.id, question_id: q.id });
      setFavori(true);
    }
  }

  function suivante() {
    setIndex((i) => (i + 1) % questionsMelangees.length);
    setChoix(null);
    setValide(false);
    setFavori(false);
  }

  return (
    <div className="card" style={{maxWidth:860, margin:"0 auto"}}>
      <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}><p className="muted">Question {index + 1} sur {questionsMelangees.length}{q.annee ? ` — ${q.annee}` : ""} — {q.categorie}</p><button className="btn btn-secondary" onClick={basculerFavori}>{favori ? "Retirer des favoris" : "Ajouter aux favoris"}</button></div>
      <h2 className="question-title">{q.question}</h2>
      {options.map(([lettre, texte]) => <button key={lettre} className={`option ${choix === lettre ? "selected" : ""}`} onClick={() => !valide && setChoix(lettre)}>{lettre}. {texte}</button>)}
      {!valide ? <button className="btn btn-primary" disabled={!choix} onClick={valider}>Valider la réponse</button> : <><div className="feedback"><strong>{choix === q.bonne_reponse ? "Bonne réponse ✅" : `Réponse incorrecte ❌ — Bonne réponse : ${q.bonne_reponse}`}</strong>{q.explication && <p>{q.explication}</p>}</div><button className="btn btn-primary" onClick={suivante}>Question suivante</button></>}
    </div>
  );
}
