import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ResultatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: session } = await supabase.from("exam_sessions").select("id,score,total_questions,completed_at,mode").eq("id", id).single();
  if (!session) notFound();

  const { data: reponses } = await supabase.from("user_answers").select(`id,reponse_choisie,correcte,questions(categorie,question,option_a,option_b,option_c,option_d,bonne_reponse,explication)`).eq("exam_session_id", id);
  const pourcentage = session.total_questions ? Math.round((session.score / session.total_questions) * 100) : 0;

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Résultat de l’examen</div><Link href="/historique">Historique</Link></div>
      <div className="card" style={{marginBottom:24}}><h1 style={{fontSize:"2.3rem"}}>{pourcentage} %</h1><p><strong>{session.score}</strong> bonnes réponses sur <strong>{session.total_questions}</strong>.</p><div className="actions"><Link className="btn btn-primary" href="/examens">Nouvel examen</Link><Link className="btn btn-secondary" href="/tableau-de-bord">Tableau de bord</Link></div></div>
      <h2>Correction détaillée</h2>
      <div style={{display:"grid", gap:16}}>
        {(reponses ?? []).map((r: any, i: number) => {
          const q = Array.isArray(r.questions) ? r.questions[0] : r.questions;
          return <div className="card" key={r.id}><p className="muted">Question {i + 1} — {q?.categorie}</p><h3>{q?.question}</h3><p>Votre réponse : <strong>{r.reponse_choisie ?? "Aucune"}</strong>{" — "}{r.correcte ? "Correcte ✅" : `Incorrecte ❌ (bonne réponse : ${q?.bonne_reponse})`}</p>{q?.explication && <p className="muted">{q.explication}</p>}</div>;
        })}
      </div>
    </main>
  );
}
