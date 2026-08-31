import Link from "next/link";
import { exigerAdmin } from "@/lib/admin";

export default async function Admin() {
  const { supabase, profil } = await exigerAdmin();

  const { count: questions } = await supabase.from("questions").select("*", { count: "exact", head: true });
  const { count: utilisateurs } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: examens } = await supabase.from("exam_sessions").select("*", { count: "exact", head: true });

  return (
    <main className="container page">
      <div className="nav"><div><div className="logo">Administration</div><small className="muted">{profil.nom_complet ?? "Administrateur"}</small></div><Link href="/tableau-de-bord">Retour à la plateforme</Link></div>
      <h1 style={{fontSize:"2.4rem"}}>Panneau administrateur</h1>
      <p className="muted">Gérez les questions et le contenu de la plateforme sans modifier le code.</p>
      <div className="statgrid" style={{margin:"28px 0"}}><div className="card stat"><span>Questions</span><strong>{questions ?? 0}</strong></div><div className="card stat"><span>Utilisateurs</span><strong>{utilisateurs ?? 0}</strong></div><div className="card stat"><span>Examens</span><strong>{examens ?? 0}</strong></div></div>
      <div className="grid"><Link className="card" href="/admin/questions"><h2>Gérer les questions</h2><p className="muted">Ajouter, modifier et supprimer les questions.</p></Link><Link className="card" href="/admin/questions/nouvelle"><h2>Ajouter une question</h2><p className="muted">Créer une nouvelle question depuis un formulaire.</p></Link><Link className="card" href="/admin/import"><h2>Importer un CSV</h2><p className="muted">Ajouter plusieurs questions en une seule fois.</p></Link><Link className="card" href="/admin/statistiques"><h2>Statistiques avancées</h2><p className="muted">Analyser les performances par catégorie.</p></Link><Link className="card" href="/admin/utilisateurs"><h2>Utilisateurs</h2><p className="muted">Rechercher les comptes et gérer les rôles.</p></Link></div>
    </main>
  );
}
