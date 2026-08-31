"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../auth-pages.css";

export default function Connexion() {
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function connecter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setMessage("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const motDePasse = String(form.get("motDePasse") || "");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    setChargement(false);

    if (error) {
      setMessage("Connexion impossible. Vérifiez votre e-mail et votre mot de passe.");
      return;
    }

    router.push("/tableau-de-bord");
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>

        <div className="auth-copy">
          <span>Votre préparation commence ici</span>
          <h1>Reprenez votre progression.</h1>
          <p>Connectez-vous pour continuer vos questions, simulations d’examen, statistiques et révisions personnalisées.</p>
          <div className="auth-benefits">
            <div className="auth-benefit"><i>✓</i><div><strong>Progression enregistrée</strong><small>Retrouvez vos scores et votre historique.</small></div></div>
            <div className="auth-benefit"><i>✎</i><div><strong>Révision ciblée</strong><small>Travaillez vos erreurs et vos matières faibles.</small></div></div>
            <div className="auth-benefit"><i>✦</i><div><strong>Nightingale AI</strong><small>Demandez des explications pédagogiques à tout moment.</small></div></div>
          </div>
        </div>

        <div className="auth-panel-footer">Haiti Nursing Exam Prep · Plateforme éducative de préparation</div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <Link className="auth-back" href="/">← Retour à l’accueil</Link>
          <div className="auth-card-head">
            <span className="auth-eyebrow">Espace étudiant</span>
            <h2>Connexion</h2>
            <p>Entrez vos identifiants pour accéder à votre tableau de bord.</p>
          </div>

          <form className="auth-form" onSubmit={connecter}>
            <div className="auth-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" type="email" name="email" required autoComplete="email" placeholder="vous@exemple.com" />
            </div>
            <div className="auth-field">
              <label htmlFor="motDePasse">Mot de passe</label>
              <input id="motDePasse" type="password" name="motDePasse" minLength={6} required autoComplete="current-password" placeholder="Votre mot de passe" />
            </div>
            <button className="auth-submit" type="submit" disabled={chargement}>
              {chargement ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          {message && <div className="auth-message">{message}</div>}

          <div className="auth-divider">NOUVEAU SUR LA PLATEFORME ?</div>
          <p className="auth-switch">Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></p>
          <div className="auth-security"><span>🔒</span><p>Votre session est gérée par Supabase Auth. Ne partagez jamais votre mot de passe avec une autre personne.</p></div>
        </div>
      </section>
    </main>
  );
}
