import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function QuestionsIncorrectes() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: lignes } = await supabase.from("user_answers").select(`id,answered_at,reponse_choisie,question_id,questions(annee,categorie,question,bonne_reponse,explication)`).eq("correcte", false).order("answered_at", { ascending: false }).limit(100);
  const vues = new Set<string>();
  const uniques = (lignes ?? []).filter((x: any) => { if (vues.has(x.question_id)) return false; vues.add(x.question_id); return true; });

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Questions incorrectes</div><Link href="/tableau-de-bord">Tableau de bord</Link></div>
      <h1 style={{fontSize:"2.4rem"}}>À revoir</h1>
      <p className="muted">Les questions auxquelles vous avez répondu incorrectement.</p>
      <div style={{display:"grid", gap:14}}>
        {uniques.map((r: any) => { const q = Array.isArray(r.questions) ? r.questions[0] : r.questions; return <div className="card" key={r.question_id}><p className="muted">{q?.annee ? `${q.annee} — ` : ""}{q?.categorie}</p><h3>{q?.question}</h3><p>Votre réponse : <strong>{r.reponse_choisie ?? "Aucune"}</strong>{" — "}Bonne réponse : <strong>{q?.bonne_reponse}</strong></p>{q?.explication && <p className="muted">{q.explication}</p>}</div>; })}
        {uniques.length === 0 && <div className="card"><p className="muted">Aucune question incorrecte pour le moment.</p></div>}
      </div>
    </main>
  );
}
