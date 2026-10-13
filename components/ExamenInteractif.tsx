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

export default function ExamenInteractif({ questions: initialQuestions, tailleDemandee, dureeMinutes, modeSession, titreSession, sousTitreSession }: Props) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({});
  const [marquees, setMarquees] = useState<Set<string>>(new Set());
  const [secondesRestantes, setSecondesRestantes] = useState(dureeMinutes * 60);
  const [soumission, setSoumission] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [chargementBrouillon, setChargementBrouillon] = useState(true);
  const [brouillonKey, setBrouillonKey] = useState("");
  const [dateLimite, setDateLimite] = useState(0);
  const [messageErreur, setMessageErreur] = useState("");
  const pendingSessionRef = useRef<string | null>(null);
  const autoSubmittedRef = useRef(false);
  const reponsesRef = useRef<Reponses>({});
  const soumissionRef = useRef(false);
  const question = questions[index];

  useEffect(() => { reponsesRef.current = reponses; }, [reponses]);
  useEffect(() => { soumissionRef.current = soumission; }, [soumission]);

  useEffect(() => {
    let cancelled = false;
    async function chargerBrouillon() {
      try {
        const { data: { user } } = await createClient().auth.getUser();
        if (cancelled) return;
        if (!user) { router.replace("/connexion"); return; }
        const key = "haiti-nursing-examen-v1:" + user.id + ":" + (modeSession || "examen_" + tailleDemandee);
        let expiration = Date.now() + dureeMinutes * 60000;
        try {
          const saved = JSON.parse(localStorage.getItem(key) || "null");
          if (saved?.version === 1 && Array.isArray(saved.questions) &&
              saved.questions.length === initialQuestions.length &&
              saved.questions.every((q: Question) => q?.id && q?.question && q?.bonne_reponse) &&
              typeof saved.expiration === "number") {
            const savedIds = new Set<string>(saved.questions.map((q: Question) => q.id));
            const answers: Reponses = {};
            for (const [id, answer] of Object.entries(saved.reponses || {})) {
              if (savedIds.has(id) && ["A","B","C","D"].includes(String(answer)))
                answers[id] = answer as Reponses[string];
            }
            setQuestions(saved.questions);
            setReponses(answers);
            reponsesRef.current = answers;
            setMarquees(new Set<string>((saved.marquees || []).filter((id: string) => savedIds.has(id))));
            setIndex(Math.min(Math.max(Number(saved.index) || 0, 0), saved.questions.length - 1));
            expiration = saved.expiration;
            pendingSessionRef.current = typeof saved.pendingSessionId === "string" ? saved.pendingSessionId : null;
          }
        } catch { /* Private browsing may deny local storage. */ }
        setDateLimite(expiration);
        setBrouillonKey(key);
        setChargementBrouillon(false);
      } catch {
        if (!cancelled) setMessageErreur("Connexion indisponible. Vos réponses seront conservées si le stockage local est accessible.");
      }
    }
    void chargerBrouillon();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (chargementBrouillon || !brouillonKey) return;
    try {
      localStorage.setItem(brouillonKey, JSON.stringify({
        version: 1, questions, reponses, marquees: Array.from(marquees),
        index, expiration: dateLimite, pendingSessionId: pendingSessionRef.current
      }));
    } catch { setMessageErreur("Le stockage local est indisponible. Gardez cette page ouverte pendant l'examen."); }
  }, [chargementBrouillon, brouillonKey, questions, reponses, marquees, index, dateLimite]);

  useEffect(() => {
    if (chargementBrouillon || !dateLimite) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((dateLimite - Date.now()) / 1000));
      setSecondesRestantes(remaining);
      if (remaining === 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        void soumettreExamen(true);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [chargementBrouillon, dateLimite]);

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
    if (chargementBrouillon || soumission) return;
    if (restantes > 0 || marquees.size > 0) {
      setConfirmation(true);
      return;
    }
    void soumettreExamen(false);
  }

  async function soumettreExamen(force = false) {
    if (chargementBrouillon || soumissionRef.current) return;
    soumissionRef.current = true;
    setSoumission(true);
    setConfirmation(false);
    setMessageErreur("");
    const finales = force ? reponsesRef.current : reponses;
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Votre connexion a expiré. Reconnectez-vous avant de soumettre l'examen.");
      const bonnes = questions.reduce((total, q) => total + (finales[q.id] === q.bonne_reponse ? 1 : 0), 0);
      let sessionId = pendingSessionRef.current;
      if (!sessionId) {
        const { data: session, error: sessionError } = await supabase.from("exam_sessions").insert({
          user_id: user.id,
          mode: modeSession || "examen_" + tailleDemandee,
          score: bonnes,
          total_questions: questions.length,
          completed_at: null,
        }).select("id").single();
        if (sessionError || !session) throw sessionError || new Error("Erreur lors de la création de l'examen.");
        sessionId = session.id;
        pendingSessionRef.current = sessionId;
        if (brouillonKey) {
          try {
            const saved = JSON.parse(localStorage.getItem(brouillonKey) || "{}");
            localStorage.setItem(brouillonKey, JSON.stringify({...saved, pendingSessionId: sessionId}));
          } catch { /* Resume is best-effort when browser storage is disabled. */ }
        }
      }
      const { data: existing, error: readError } = await supabase.from("user_answers")
        .select("question_id").eq("user_id", user.id).eq("exam_session_id", sessionId);
      if (readError) throw readError;
      const savedIds = new Set((existing || []).map((r) => r.question_id));
      const lignes = questions.filter((q) => !savedIds.has(q.id)).map((q) => ({
        user_id: user.id,
        question_id: q.id,
        exam_session_id: sessionId,
        reponse_choisie: finales[q.id] ?? null,
        correcte: finales[q.id] === q.bonne_reponse,
      }));
      if (lignes.length) {
        const { error: answersError } = await supabase.from("user_answers").insert(lignes);
        if (answersError) throw answersError;
      }
      const { error: doneError } = await supabase.from("exam_sessions")
        .update({ score: bonnes, completed_at: new Date().toISOString() })
        .eq("id", sessionId).eq("user_id", user.id);
      if (doneError) throw doneError;
      if (brouillonKey) {
        try { localStorage.removeItem(brouillonKey); } catch { /* Already saved remotely. */ }
      }
      router.push("/resultats/" + sessionId);
    } catch {
      setMessageErreur("Impossible d'enregistrer l'examen. Vos réponses restent dans le brouillon de cet appareil. Réessayez lorsque la connexion revient.");
      setSoumission(false);
      soumissionRef.current = false;
    }
  }

  if (chargementBrouillon || !question) {
    return <main className="exam-session-shell" style={{padding:30}}><p>{messageErreur || "Récupération sécurisée de votre examen en cours…"}</p></main>;
  }

  const options = [["A", question.option_a], ["B", question.option_b], ["C", question.option_c], ["D", question.option_d]] as const;

  return (
    <main className="exam-session-shell">
      <div role="status" style={{padding:"8px 18px",fontSize:13,color:"#0a6852"}}>✓ Vos réponses en cours sont conservées sur cet appareil. Le chronomètre continue après fermeture.</div>
      {messageErreur && <div role="alert" style={{margin:16,padding:12,borderRadius:10,background:"#fff3ef",color:"#9a2525",border:"1px solid #f0b9a5"}}>
        {messageErreur} <button type="button" onClick={() => void soumettreExamen(secondesRestantes === 0)} disabled={soumission} style={{borderRadius:8,border:0,padding:"8px 12px",background:"#154a96",color:"#fff"}}>Réessayer l'enregistrement</button>
      </div>}
      <header className="exam-session-header">
        <Link href="/examens" className="exam-session-brand"><img src="/pwa-icon.svg" alt="" width={40} height={40} style={{borderRadius:9}} /><span><strong>{titreSession || "Haiti Nursing Exam Prep"}</strong><small>{sousTitreSession || `Simulation de ${questions.length} questions`}</small></span></Link>
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
