import Link from "next/link";
import { exigerAdmin } from "@/lib/admin";

type SearchParams = { q?: string };

type AdminUser = {
  id: string;
  nom_complet: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
  qcm_realises: number;
  bonnes_reponses: number;
  taux_reussite: number;
  examens_realises: number;
  derniere_activite: string | null;
};

function dateFr(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminUtilisateurs({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { supabase } = await exigerAdmin();
  const params = await searchParams;
  const recherche = (params.q ?? "").trim().toLowerCase();

  const { data, error } = await supabase.rpc("admin_registered_users");
  const utilisateurs = ((data ?? []) as AdminUser[]).filter((utilisateur) => {
    if (!recherche) return true;
    return `${utilisateur.nom_complet ?? ""} ${utilisateur.email ?? ""}`.toLowerCase().includes(recherche);
  });

  const total = (data ?? []).length;
  const actifs = ((data ?? []) as AdminUser[]).filter((u) => u.qcm_realises > 0 || u.examens_realises > 0).length;
  const admins = ((data ?? []) as AdminUser[]).filter((u) => u.role === "admin").length;

  return (
    <main className="container page" style={{ maxWidth: 1280 }}>
      <div className="nav">
        <div>
          <div className="logo">Utilisateurs inscrits</div>
          <small className="muted">Administration · comptes étudiants</small>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin">← Administration</Link>
          <Link href="/tableau-de-bord">Retour à la plateforme</Link>
        </div>
      </div>

      <section style={{ marginTop: 28 }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>Toutes les personnes inscrites</h1>
        <p className="muted">Consultez les comptes, leur activité QCM et leurs examens. Cette page est réservée aux administrateurs.</p>
      </section>

      <div className="statgrid" style={{ margin: "24px 0" }}>
        <div className="card stat"><span>Inscrits</span><strong>{total}</strong></div>
        <div className="card stat"><span>Actifs</span><strong>{actifs}</strong></div>
        <div className="card stat"><span>Administrateurs</span><strong>{admins}</strong></div>
      </div>

      <form method="get" style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Rechercher par nom ou e-mail"
          aria-label="Rechercher un utilisateur"
          style={{ flex: "1 1 280px", minHeight: 46, border: "1px solid #dbe3ef", borderRadius: 12, padding: "0 14px", fontSize: 15, background: "white" }}
        />
        <button type="submit" className="btn btn-primary" style={{ minHeight: 46 }}>Rechercher</button>
        {params.q ? <Link className="btn" href="/admin/utilisateurs" style={{ minHeight: 46, display: "grid", placeItems: "center" }}>Effacer</Link> : null}
      </form>

      {error ? (
        <div className="card" style={{ borderColor: "#f1b9be", background: "#fff7f8" }}>
          <strong>Impossible de charger les utilisateurs.</strong>
          <p className="muted" style={{ marginBottom: 0 }}>Vérifiez les droits administrateur puis réessayez.</p>
        </div>
      ) : utilisateurs.length === 0 ? (
        <div className="card"><strong>Aucun utilisateur trouvé.</strong></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead>
                <tr style={{ background: "#f5f8fd", textAlign: "left" }}>
                  {['Utilisateur','Inscription','QCM','Réussite','Examens','Dernière activité','Rôle'].map((titre) => (
                    <th key={titre} style={{ padding: "14px 16px", fontSize: 12, color: "#66728a", borderBottom: "1px solid #e4eaf2" }}>{titre}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((utilisateur) => (
                  <tr key={utilisateur.id} style={{ borderBottom: "1px solid #edf1f5" }}>
                    <td style={{ padding: "15px 16px" }}>
                      <strong style={{ display: "block", color: "#14204a" }}>{utilisateur.nom_complet || "Nom non renseigné"}</strong>
                      <small className="muted">{utilisateur.email || "E-mail non disponible"}</small>
                    </td>
                    <td style={{ padding: "15px 16px", fontSize: 13 }}>{dateFr(utilisateur.created_at)}</td>
                    <td style={{ padding: "15px 16px", fontWeight: 700 }}>{utilisateur.qcm_realises}</td>
                    <td style={{ padding: "15px 16px" }}><strong>{Number(utilisateur.taux_reussite || 0).toFixed(1)}%</strong><small className="muted" style={{ display: "block" }}>{utilisateur.bonnes_reponses} bonnes réponses</small></td>
                    <td style={{ padding: "15px 16px", fontWeight: 700 }}>{utilisateur.examens_realises}</td>
                    <td style={{ padding: "15px 16px", fontSize: 13 }}>{dateFr(utilisateur.derniere_activite)}</td>
                    <td style={{ padding: "15px 16px" }}><span style={{ display: "inline-block", padding: "5px 9px", borderRadius: 999, background: utilisateur.role === "admin" ? "#e9efff" : "#eef8f2", color: utilisateur.role === "admin" ? "#3151c8" : "#287a4e", fontSize: 11, fontWeight: 800 }}>{utilisateur.role === "admin" ? "Admin" : "Étudiant"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
