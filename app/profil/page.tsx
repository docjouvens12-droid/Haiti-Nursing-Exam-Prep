import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const email = String(claimsData.claims.email ?? "");
  const { data: profil } = await supabase
    .from("profiles")
    .select("nom_complet,role")
    .eq("id", userId)
    .single();

  const nom = profil?.nom_complet || "Étudiant";
  const initiale = nom.charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <Link href="/tableau-de-bord" className="profile-back">← Tableau de bord</Link>
        <div className="profile-avatar">{initiale}</div>
        <div>
          <span className="profile-eyebrow">Votre espace</span>
          <h1>{nom}</h1>
          <p>Gérez votre parcours de préparation et accédez rapidement à vos outils d’étude.</p>
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <h2>Informations du compte</h2>
          <div className="profile-detail"><span>Nom complet</span><strong>{nom}</strong></div>
          <div className="profile-detail"><span>Adresse e-mail</span><strong>{email || "Non disponible"}</strong></div>
          <div className="profile-detail"><span>Type de compte</span><strong>{profil?.role === "admin" ? "Administrateur" : "Étudiant"}</strong></div>
        </article>

        <article className="profile-card">
          <h2>Raccourcis</h2>
          <div className="profile-links">
            <Link href="/performance">Voir ma performance <span>→</span></Link>
            <Link href="/historique">Historique des examens <span>→</span></Link>
            <Link href="/favoris">Mes favoris <span>→</span></Link>
            <Link href="/questions-incorrectes">Questions à revoir <span>→</span></Link>
            <Link href="/nightingale">Nightingale AI <span>→</span></Link>
          </div>
        </article>
      </section>
    </main>
  );
}
