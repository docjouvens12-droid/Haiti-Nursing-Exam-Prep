"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type Props = {
  questions: Question[];
  tailleDemandee: number;
  dureeMinutes: number;
  modeSession?: string;
  titreSession?: string;
  sousTitreSession?: string;
};

export default function ExamenInteractif({ questions, tailleDemandee, dureeMinutes, modeSession, titreSession, sousTitreSession }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({});
  const [marquees, setMarquees] = useState<Set<string>>(new Set());
  const [secondesRestantes, setSecondesRestantes] = useState(dureeMinutes * 60);
  const [soumission, setSoumission] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const reponsesRef = useRef<Reponses>({});
  const soumissionRef = useRef(false);
  const question = questions[index];

  useEffect(() => { reponsesRef.current = reponses; }, [reponses]);
  useEffect(() => { soumissionRef.current = soumission; }, [soumission]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondesRestantes((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          void soumettreExamen(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const temps = useMemo(() => {
    const min = Math.floor(secondesRestantes / 60);
    const sec = secondesRestantes % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }, [secondesRestantes]);

  const progression = Math.round(((index + 1) / questions.length) * 100);
  const repondues = Object.keys(reponses).length;
  const restantes = questions.length - repondues;

  function basculerRevision(id: string) {
    setMarquees((courantes) => {
      const suivant = new Set(courantes);
      if (suivant.has(id)) suivant.delete(id); else suivant.add(id);
      return suivant;
    });
  }

  function demanderSoumission() {
    if (soumission) return;
    if (restantes > 0 || marquees.size > 0) {
      setConfirmation(true);
      return;
    }
    void soumettreExamen(false);
  }

  async function soumettreExamen(force = false) {
    if (soumissionRef.current) return;
    soumissionRef.current = true;
    setSoumission(true);
    setConfirmation(false);
    const reponsesFinales = force ? reponsesRef.current : reponses;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/connexion"); return; }

    const bonnes = questions.reduce((total, q) => total + (reponsesFinales[q.id] === q.bonne_reponse ? 1 : 0), 0);
    const { data: session, error: sessionError } = await supabase.from("exam_sessions").insert({
      user_id: user.id,
      mode: modeSession || `examen_${tailleDemandee}`,
      score: bonnes,
      total_questions: questions.length,
      completed_at: new Date().toISOString(),
    }).select("id").single();

    if (sessionError || !session) {
      soumissionRef.current = false;
      setSoumission(false);
      return;
    }

    const lignes = questions.map((q) => ({
      user_id: user.id,
      question_id: q.id,
      exam_session_id: session.id,
      reponse_choisie: reponsesFinales[q.id] ?? null,
      correcte: reponsesFinales[q.id] === q.bonne_reponse,
    }));

    const { error: answersError } = await supabase.from("user_answers").insert(lignes);
    if (answersError) {
      soumissionRef.current = false;
      setSoumission(false);
      return;
    }
    router.push(`/resultats/${session.id}`);
  }

  const options = [["A", question.option_a], ["B", question.option_b], ["C", question.option_c], ["D", question.option_d]] as const;

  return (
    <main className="exam-session-shell">
      <header className="exam-session-header">
        <Link href="/examens" className="exam-session-brand"><span className="brand-mark">✚</span><span><strong>{titreSession || "Haiti Nursing Exam Prep"}</strong><small>{sousTitreSession || `Simulation de ${questions.length} questions`}</small></span></Link>
        <div className="exam-timer"><span>◷</span><span>Temps restant</span><strong>{temps}</strong></div>
        <Link href="/examens" className="exam-session-exit">Quitter l’examen</Link>
      </header>

      <div className="exam-session-progress"><i style={{ width: `${progression}%` }} /></div>

      <div className="exam-session-body">
        <section className="exam-question-card">
          <div className="exam-question-meta"><span>Question {index + 1} sur {questions.length}</span><span className="exam-category-chip">{question.categorie || "Sciences infirmières"}</span></div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button type="button" onClick={() => basculerRevision(question.id)} aria-pressed={marquees.has(question.id)} style={{ border: "1px solid #dce3ef", borderRadius: 9, padding: "9px 12px", background: marquees.has(question.id) ? "#fff4d6" : "#fff", color: "#24304d", fontWeight: 700, cursor: "pointer" }}>
              {marquees.has(question.id) ? "⚑ Marquée pour révision" : "⚐ Marquer pour révision"}
            </button>
          </div>
          <h2>{question.question}</h2>

          <div className="exam-answer-list">
            {options.map(([lettre, texte]) => (
              <button type="button" key={lettre} className={`exam-answer ${reponses[question.id] === lettre ? "selected" : ""}`} onClick={() => setReponses((r) => ({ ...r, [question.id]: lettre }))}>
                <span className="exam-answer-letter">{lettre}</span><span>{texte}</span>
              </button>
            ))}
          </div>

          <div className="exam-question-actions">
            <button className="exam-nav-button" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>← Précédente</button>
            {index < questions.length - 1 ? <button className="exam-nav-button primary" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}>Suivante →</button> : <button className="exam-submit-button" disabled={soumission} onClick={demanderSoumission}>{soumission ? "Soumission..." : "Terminer l’examen"}</button>}
          </div>
        </section>

        <aside className="exam-question-sidebar">
          <section className="exam-status-card">
            <h3>Progression</h3>
            <div className="exam-status-stats"><div><strong>{repondues}</strong><span>Répondues</span></div><div><strong>{restantes}</strong><span>Restantes</span></div><div><strong>{marquees.size}</strong><span>À revoir</span></div></div>
          </section>

          <section className="exam-status-card">
            <h3>Questions</h3>
            <div className="exam-question-nav">
              {questions.map((q, i) => (
                <button type="button" key={q.id} aria-label={`Question ${i + 1}${marquees.has(q.id) ? ", marquée pour révision" : ""}`} className={`${i === index ? "current" : ""} ${reponses[q.id] ? "answered" : ""}`} onClick={() => setIndex(i)} style={marquees.has(q.id) ? { outline: "2px solid #f2a900", outlineOffset: "2px" } : undefined}>{i + 1}</button>
              ))}
            </div>
            <div className="exam-status-legend"><span><i /> Non répondue</span><span><i /> Répondue</span><span>⚑ À revoir</span></div>
          </section>

          {marquees.size > 0 && <section className="exam-status-card"><h3>Marquées pour révision</h3><div className="exam-question-nav">{questions.map((q, i) => marquees.has(q.id) ? <button type="button" key={q.id} onClick={() => setIndex(i)}>{i + 1}</button> : null)}</div></section>}

          <section className="exam-submit-card">
            <strong>Prêt à terminer ?</strong>
            <p>Vous avez répondu à {repondues} question{repondues > 1 ? "s" : ""} sur {questions.length}. {marquees.size > 0 ? `${marquees.size} question${marquees.size > 1 ? "s sont" : " est"} encore marquée${marquees.size > 1 ? "s" : ""} pour révision. ` : ""}Les questions non répondues seront comptées comme incorrectes.</p>
            <button type="button" disabled={soumission} onClick={demanderSoumission}>{soumission ? "Soumission..." : "Soumettre l’examen"}</button>
          </section>

          <p className="exam-loading-note">Aucune correction n’est affichée pendant l’examen. À 00:00, l’examen est soumis automatiquement avec toutes les réponses enregistrées jusque-là.</p>
        </aside>
      </div>

      {confirmation && (
        <div role="dialog" aria-modal="true" aria-labelledby="exam-confirm-title" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.55)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: "min(460px, 100%)", background: "white", borderRadius: 18, padding: 24, boxShadow: "0 24px 70px rgba(15,23,42,.25)" }}>
            <span style={{ fontSize: 30 }}>⚠</span>
            <h2 id="exam-confirm-title" style={{ margin: "8px 0" }}>Confirmer la soumission</h2>
            <p style={{ color: "#526078", lineHeight: 1.55 }}>{restantes > 0 ? `Il reste ${restantes} question${restantes > 1 ? "s" : ""} sans réponse. ` : ""}{marquees.size > 0 ? `${marquees.size} question${marquees.size > 1 ? "s sont" : " est"} encore marquée${marquees.size > 1 ? "s" : ""} pour révision. ` : ""}Voulez-vous vraiment terminer l’examen ?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 20 }}>
              <button type="button" onClick={() => setConfirmation(false)} style={{ border: "1px solid #dce3ef", background: "white", borderRadius: 10, padding: "11px 16px", fontWeight: 700 }}>Continuer l’examen</button>
              <button type="button" onClick={() => void soumettreExamen(false)} style={{ border: 0, background: "#173f8a", color: "white", borderRadius: 10, padding: "11px 16px", fontWeight: 800 }}>Soumettre quand même</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
