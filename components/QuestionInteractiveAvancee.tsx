"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AnswerExplanation from "./AnswerExplanation";

type AnswerLetter = "A" | "B" | "C" | "D";
type CorrectionMode = "immediate" | "fin";

type Question = {
  id: string;
  annee: number | null;
  categorie: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  bonne_reponse: AnswerLetter;
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

export default function QuestionInteractiveAvancee({
  questions,
  chronometre = false,
  correctionMode = "immediate",
}: {
  questions: Question[];
  chronometre?: boolean;
  correctionMode?: CorrectionMode;
}) {
  const questionsMelangees = useMemo(() => melanger(questions), [questions]);
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<AnswerLetter | null>(null);
  const [valide, setValide] = useState(false);
  const [favori, setFavori] = useState(false);
  const [secondes, setSecondes] = useState(0);
  const [reponses, setReponses] = useState<Record<string, AnswerLetter>>({});
  const [termine, setTermine] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    setIndex(0);
    setChoix(null);
    setValide(false);
    setFavori(false);
    setSecondes(0);
    setReponses({});
    setTermine(false);
    setEnregistrement(false);
  }, [questions, chronometre, correctionMode]);

  useEffect(() => {
    if (!chronometre || termine) return;
    const timer = window.setInterval(() => setSecondes((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [chronometre, questions, termine]);

  const q = questionsMelangees[index] ?? questionsMelangees[0];
  if (!q) return null;

  const options = [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]] as const;
  const progression = Math.round(((index + 1) / questionsMelangees.length) * 100);
  const score = questionsMelangees.reduce((total, question) => total + (reponses[question.id] === question.bonne_reponse ? 1 : 0), 0);
  const scorePourcentage = questionsMelangees.length ? Math.round((score / questionsMelangees.length) * 100) : 0;

  async function enregistrerReponse(question: Question, answer: AnswerLetter) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    await supabase.from("user_answers").insert({
      user_id: user.id,
      question_id: question.id,
      reponse_choisie: answer,
      correcte: answer === question.bonne_reponse,
    });
    return true;
  }

  async function valider() {
    if (!choix || enregistrement) return;
    setEnregistrement(true);
    await enregistrerReponse(q, choix);
    setReponses((actuelles) => ({ ...actuelles, [q.id]: choix }));

    if (correctionMode === "immediate") {
      setValide(true);
      setEnregistrement(false);
      return;
    }

    const derniereQuestion = index === questionsMelangees.length - 1;
    if (derniereQuestion) {
      setTermine(true);
      setEnregistrement(false);
      return;
    }

    setIndex((i) => i + 1);
    setChoix(null);
    setValide(false);
    setFavori(false);
    setEnregistrement(false);
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
    if (index === questionsMelangees.length - 1) {
      setTermine(true);
      return;
    }
    setIndex((i) => i + 1);
    setChoix(null);
    setValide(false);
    setFavori(false);
  }

  if (termine) {
    return (
      <section className="practice-question-card practice-results-card">
        <div className="practice-results-hero">
          <span className="practice-eyebrow">Série terminée</span>
          <h2>Votre résultat</h2>
          <strong>{score} / {questionsMelangees.length}</strong>
          <p>{scorePourcentage}% de bonnes réponses{chronometre ? ` · Temps : ${formaterTemps(secondes)}` : ""}</p>
        </div>

        <div className="practice-results-list">
          {questionsMelangees.map((question, questionIndex) => {
            const selected = reponses[question.id];
            const correcte = selected === question.bonne_reponse;
            return (
              <article className={`practice-result-item ${correcte ? "correct" : "incorrect"}`} key={question.id}>
                <div className="practice-result-heading">
                  <span>{correcte ? "✓" : "!"}</span>
                  <div>
                    <small>Question {questionIndex + 1}</small>
                    <h3>{question.question}</h3>
                  </div>
                </div>
                <AnswerExplanation question={question} selected={selected} />
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="practice-question-card">
      <div className="practice-question-topline">
        <div>
          <span className="practice-eyebrow">Mode pratique</span>
          <p>Question {index + 1} sur {questionsMelangees.length}</p>
          <p><strong>Correction : {correctionMode === "immediate" ? "après chaque question" : "à la fin"}</strong></p>
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
          const montrerCorrection = correctionMode === "immediate" && valide;
          const bonne = montrerCorrection && lettre === q.bonne_reponse;
          const mauvaise = montrerCorrection && choix === lettre && lettre !== q.bonne_reponse;
          return (
            <button
              key={lettre}
              className={`practice-option ${choix === lettre ? "selected" : ""} ${bonne ? "correct" : ""} ${mauvaise ? "incorrect" : ""}`}
              onClick={() => !valide && !enregistrement && setChoix(lettre)}
            >
              <span className="practice-letter">{lettre}</span>
              <span>{texte}</span>
              {bonne && <b>✓</b>}
              {mauvaise && <b>×</b>}
            </button>
          );
        })}
      </div>

      {correctionMode === "immediate" && valide && (
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
        {correctionMode === "immediate" && valide ? (
          <button className="practice-primary-action" onClick={suivante}>
            {index === questionsMelangees.length - 1 ? "Voir le résultat →" : "Question suivante →"}
          </button>
        ) : (
          <button className="practice-primary-action" disabled={!choix || enregistrement} onClick={valider}>
            {enregistrement
              ? "Enregistrement…"
              : correctionMode === "fin"
                ? index === questionsMelangees.length - 1 ? "Terminer la série" : "Enregistrer et continuer →"
                : "Valider la réponse"}
          </button>
        )}
      </div>
    </section>
  );
}
