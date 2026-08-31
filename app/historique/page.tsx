import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Historique() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const { data: sessions } = await supabase.from("exam_sessions").select("id,mode,score,total_questions,completed_at").not("completed_at", "is", null).order("completed_at", { ascending: false });

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Historique des examens</div><Link href="/tableau-de-bord">Tableau de bord</Link></div>
      <h1 style={{fontSize:"2.4rem"}}>Vos examens terminés</h1>
      <div style={{display:"grid", gap:14}}>
        {(sessions ?? []).map((s) => {
          const pct = s.total_questions ? Math.round((s.score / s.total_questions) * 100) : 0;
          return <div className="card" key={s.id}><div style={{display:"flex", justifyContent:"space-between", gap:16, flexWrap:"wrap"}}><div><strong>{s.mode.replace("_", " ")}</strong><p className="muted">{s.score}/{s.total_questions} — {pct} %</p></div><Link className="btn btn-secondary" href={`/resultats/${s.id}`}>Voir la correction</Link></div></div>;
        })}
      </div>
    </main>
  );
}
