"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
          void soumettreExamen();
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

  const progression = Math.round(((index + 1) / questions.length) * 100);
  const repondues = Object.keys(reponses).length;

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
    <main className="exam-session-shell">
      <header className="exam-session-header">
        <Link href="/examens" className="exam-session-brand">
          <span className="brand-mark">✚</span>
          <span><strong>Haiti Nursing Exam Prep</strong><small>Simulation de {questions.length} questions</small></span>
        </Link>
        <div className="exam-timer"><span>◷</span><span>Temps restant</span><strong>{temps}</strong></div>
        <Link href="/examens" className="exam-session-exit">Quitter l’examen</Link>
      </header>

      <div className="exam-session-progress"><i style={{ width: `${progression}%` }} /></div>

      <div className="exam-session-body">
        <section className="exam-question-card">
          <div className="exam-question-meta">
            <span>Question {index + 1} sur {questions.length}</span>
            <span className="exam-category-chip">{question.categorie || "Sciences infirmières"}</span>
          </div>

          <h2>{question.question}</h2>

          <div className="exam-answer-list">
            {options.map(([lettre, texte]) => (
              <button
                type="button"
                key={lettre}
                className={`exam-answer ${reponses[question.id] === lettre ? "selected" : ""}`}
                onClick={() => setReponses((r) => ({ ...r, [question.id]: lettre }))}
              >
                <span className="exam-answer-letter">{lettre}</span>
                <span>{texte}</span>
              </button>
            ))}
          </div>

          <div className="exam-question-actions">
            <button className="exam-nav-button" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>← Précédente</button>
            {index < questions.length - 1 ? (
              <button className="exam-nav-button primary" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}>Suivante →</button>
            ) : (
              <button className="exam-submit-button" disabled={soumission} onClick={soumettreExamen}>{soumission ? "Soumission..." : "Terminer l’examen"}</button>
            )}
          </div>
        </section>

        <aside className="exam-question-sidebar">
          <section className="exam-status-card">
            <h3>Progression</h3>
            <div className="exam-status-stats">
              <div><strong>{repondues}</strong><span>Répondues</span></div>
              <div><strong>{questions.length - repondues}</strong><span>Restantes</span></div>
            </div>
          </section>

          <section className="exam-status-card">
            <h3>Questions</h3>
            <div className="exam-question-nav">
              {questions.map((q, i) => (
                <button
                  type="button"
                  key={q.id}
                  aria-label={`Question ${i + 1}`}
                  className={`${i === index ? "current" : ""} ${reponses[q.id] ? "answered" : ""}`}
                  onClick={() => setIndex(i)}
                >{i + 1}</button>
              ))}
            </div>
            <div className="exam-status-legend"><span><i /> Non répondue</span><span><i /> Répondue</span></div>
          </section>

          <section className="exam-submit-card">
            <strong>Prêt à terminer ?</strong>
            <p>Vous avez répondu à {repondues} question{repondues > 1 ? "s" : ""} sur {questions.length}. Les questions non répondues seront comptées comme incorrectes.</p>
            <button type="button" disabled={soumission} onClick={soumettreExamen}>{soumission ? "Soumission..." : "Soumettre l’examen"}</button>
          </section>

          <p className="exam-loading-note">Vos réponses restent enregistrées dans cette session jusqu’à la soumission.</p>
        </aside>
      </div>
    </main>
  );
}
