"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AnswerExplanation from "./AnswerExplanation";

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

function formaterTemps(secondes: number) {
  const minutes = Math.floor(secondes / 60);
  const reste = secondes % 60;
  return `${String(minutes).padStart(2, "0")}:${String(reste).padStart(2, "0")}`;
}

export default function QuestionInteractiveAvancee({ questions, chronometre = false }: { questions: Question[]; chronometre?: boolean }) {
  const questionsMelangees = useMemo(() => melanger(questions), [questions]);
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [valide, setValide] = useState(false);
  const [favori, setFavori] = useState(false);
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    setIndex(0);
    setChoix(null);
    setValide(false);
    setFavori(false);
    setSecondes(0);
  }, [questions, chronometre]);

  useEffect(() => {
    if (!chronometre) return;
    const timer = window.setInterval(() => setSecondes((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [chronometre, questions]);

  const q = questionsMelangees[index] ?? questionsMelangees[0];
  if (!q) return null;

  const options = [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]] as const;
  const progression = Math.round(((index + 1) / questionsMelangees.length) * 100);

  async function valider() {
    if (!choix) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_answers").insert({
      user_id: user.id,
      question_id: q.id,
      reponse_choisie: choix,
      correcte: choix === q.bonne_reponse,
    });
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
    <section className="practice-question-card">
      <div className="practice-question-topline">
        <div>
          <span className="practice-eyebrow">Mode pratique</span>
          <p>Question {index + 1} sur {questionsMelangees.length}</p>
          {chronometre && <p aria-live="polite"><strong>⏱ {formaterTemps(secondes)}</strong> écoulées</p>}
        </div>
        <button className={`practice-favorite ${favori ? "active" : ""}`} onClick={basculerFavori}>
          {favori ? "♥ Favori" : "♡ Ajouter aux favoris"}
        </button>
      </div>

      <div className="practice-progress-line">
        <span style={{ width: `${progression}%` }} />
      </div>

      <div className="practice-meta-row">
        <span>{q.categorie}</span>
        {q.annee && <span>Année {q.annee}</span>}
        <strong>{progression}%</strong>
      </div>

      <h2 className="practice-question-title">{q.question}</h2>
      <p className="practice-help">Sélectionnez la meilleure réponse.</p>

      <div className="practice-options">
        {options.map(([lettre, texte]) => {
          const bonne = valide && lettre === q.bonne_reponse;
          const mauvaise = valide && choix === lettre && lettre !== q.bonne_reponse;
          return (
            <button
              key={lettre}
              className={`practice-option ${choix === lettre ? "selected" : ""} ${bonne ? "correct" : ""} ${mauvaise ? "incorrect" : ""}`}
              onClick={() => !valide && setChoix(lettre)}
            >
              <span className="practice-letter">{lettre}</span>
              <span>{texte}</span>
              {bonne && <b>✓</b>}
              {mauvaise && <b>×</b>}
            </button>
          );
        })}
      </div>

      {valide && (
        <div className={`practice-feedback ${choix === q.bonne_reponse ? "correct" : "incorrect"}`}>
          <div className="practice-feedback-title">
            <span>{choix === q.bonne_reponse ? "✓" : "!"}</span>
            <strong>{choix === q.bonne_reponse ? "Bonne réponse" : `Réponse incorrecte — bonne réponse : ${q.bonne_reponse}`}</strong>
          </div>
          <AnswerExplanation question={q} selected={choix} />
        </div>
      )}

      <div className="practice-actions-row">
        <span className="practice-counter">{index + 1} / {questionsMelangees.length}</span>
        {!valide ? (
          <button className="practice-primary-action" disabled={!choix} onClick={valider}>Valider la réponse</button>
        ) : (
          <button className="practice-primary-action" onClick={suivante}>Question suivante →</button>
        )}
      </div>
    </section>
  );
}
