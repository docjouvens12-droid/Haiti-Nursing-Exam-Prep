import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Examens() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const formats = [
    { taille: 25, duree: 35, description: "Simulation courte pour révision ciblée." },
    { taille: 50, duree: 70, description: "Simulation intermédiaire." },
    { taille: 100, duree: 140, description: "Simulation complète." },
  ];

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Examens simulés</div><Link href="/tableau-de-bord">Tableau de bord</Link></div>
      <h1 style={{fontSize:"2.4rem"}}>Choisir un examen</h1>
      <p className="muted">Chaque examen est chronométré et génère un score final avec correction.</p>
      <div className="grid" style={{marginTop:24}}>
        {formats.map((f) => <div className="card" key={f.taille}><h2>{f.taille} questions</h2><p className="muted">{f.description}</p><p><strong>Durée indicative :</strong> {f.duree} minutes</p><Link className="btn btn-primary" href={`/examens/${f.taille}`}>Commencer</Link></div>)}
      </div>
    </main>
  );
}
