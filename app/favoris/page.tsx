import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Favoris() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: favoris } = await supabase.from("favorites").select(`question_id,created_at,questions(annee,categorie,question,bonne_reponse,explication)`).order("created_at", { ascending: false });

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Questions favorites</div><Link href="/tableau-de-bord">Tableau de bord</Link></div>
      <h1 style={{fontSize:"2.4rem"}}>Favoris</h1>
      <div style={{display:"grid", gap:14}}>
        {(favoris ?? []).map((f: any) => { const q = Array.isArray(f.questions) ? f.questions[0] : f.questions; return <div className="card" key={f.question_id}><p className="muted">{q?.annee ? `${q.annee} — ` : ""}{q?.categorie}</p><h3>{q?.question}</h3><p>Bonne réponse : <strong>{q?.bonne_reponse}</strong></p>{q?.explication && <p className="muted">{q.explication}</p>}</div>; })}
        {(!favoris || favoris.length === 0) && <div className="card"><p className="muted">Vous n’avez encore ajouté aucune question aux favoris.</p></div>}
      </div>
    </main>
  );
}
