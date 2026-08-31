import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NightingaleChat from "@/components/NightingaleChat";
import "./nightingale.css";

export default async function NightingalePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  return (
    <div className="nightingale-shell">
      <aside className="nightingale-sidebar">
        <Link href="/tableau-de-bord" className="brand-lockup">
          <span className="brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>
        <nav className="side-nav">
          <Link href="/tableau-de-bord">⌂ <span>Accueil</span></Link>
          <Link href="/pratique">✎ <span>Questions</span></Link>
          <Link href="/examens">▣ <span>Examens</span></Link>
          <Link href="/questions-incorrectes">⊗ <span>Questions incorrectes</span></Link>
          <Link href="/favoris">♡ <span>Favoris</span></Link>
          <Link className="active" href="/nightingale">✦ <span>Nightingale AI</span></Link>
        </nav>
        <div className="nightingale-sidebar-note">
          <strong>Votre tuteur d’étude</strong>
          <p>Demandez une explication, un mini-cas clinique, un QCM ou une méthode simple pour mémoriser une notion.</p>
        </div>
      </aside>

      <main className="nightingale-main">
        <header className="nightingale-topbar">
          <div>
            <span className="nightingale-breadcrumb">Accueil / Nightingale AI</span>
            <h1>Nightingale AI</h1>
          </div>
          <Link href="/tableau-de-bord" className="nightingale-back-link">← Tableau de bord</Link>
        </header>

        <section className="nightingale-content">
          <div className="nightingale-hero">
            <div className="nightingale-avatar">✦</div>
            <div>
              <span className="nightingale-eyebrow">Assistante pédagogique infirmière</span>
              <h2>Étudiez avec une aide disponible à la demande</h2>
              <p>Nightingale peut expliquer une notion, créer un cas clinique, vous faire réviser une matière ou clarifier une réponse de QCM.</p>
            </div>
            <div className="nightingale-capabilities">
              <span>Explications</span>
              <span>Cas cliniques</span>
              <span>QCM</span>
              <span>Révision</span>
            </div>
          </div>

          <NightingaleChat />
        </section>
      </main>
    </div>
  );
}
