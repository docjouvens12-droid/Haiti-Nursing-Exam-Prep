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
    <main className="signup-showcase">
      <section className="signup-story">
        <Link href="/" className="signup-brand" aria-label="Haiti Nursing Exam Prep - Accueil">
          <span className="hnep-brand-lockup">
          <span className="hnep-brand-icon" style={{width:50,height:50}}>
            <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
              <defs>
                <linearGradient id="hnepLoginBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0a2f86"/><stop offset="1" stopColor="#0c6bd8"/>
                </linearGradient>
                <linearGradient id="hnepLoginRed" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ff2b37"/><stop offset="1" stopColor="#b80f1e"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#hnepLoginBg)"/>
              <path d="M23 11h18v8h7v18H16V19h7z" fill="#fff"/>
              <path d="M31 18c2-2 5-1 6 1 1 2 0 4-1 5l2 2c-2 1-4 1-5 0-2 2-5 1-6-1-1-2 0-4 1-5l3-2z" fill="#0b3b92"/>
              <path d="M10 39c7-3 13-3 22 3 9-6 15-6 22-3v13c-8-3-14-2-22 4-8-6-14-7-22-4V39z" fill="#fff"/>
              <path d="M10 43c7-3 13-3 22 3 9-6 15-6 22-3" fill="none" stroke="#0d4ca6" strokeWidth="3"/>
              <path d="M10 48c7-3 13-3 22 3 9-6 15-6 22-3" fill="none" stroke="url(#hnepLoginRed)" strokeWidth="3"/>
            </svg>
          </span>
          <span className="hnep-brand-copy"><strong>Haiti Nursing</strong><small>Exam Prep</small></span>
        </span>
        </Link>

        <div className="signup-story-copy">
          <span className="signup-eyebrow">Espace étudiant</span>
          <h1>Reprenez votre <em>progression.</em></h1>
          <p>Connectez-vous pour retrouver vos QCM, vos examens simulés, vos cours de révision et votre progression personnelle.</p>

          <div className="signup-benefit-list">
            <div><i>▥</i><span><b>Progression enregistrée</b><small>Retrouvez vos scores et votre historique.</small></span></div>
            <div><i>✓</i><span><b>Révision ciblée</b><small>Revenez sur vos erreurs et vos points faibles.</small></span></div>
            <div><i>★</i><span><b>Favoris accessibles</b><small>Gardez vos questions importantes à portée de main.</small></span></div>
            <div><i>▣</i><span><b>Cours & Révisions</b><small>Continuez vos modules là où vous les avez laissés.</small></span></div>
          </div>
        </div>

        <div className="signup-visual" aria-hidden="true">
          <div className="signup-wave" />
          <div className="signup-nurse-symbol">✚</div>
          <p>Continuez aujourd’hui.<br/><strong>Progressez chaque jour.</strong></p>
        </div>
      </section>

      <section className="signup-form-zone">
        <Link className="signup-back" href="/">← Retour à l’accueil</Link>

        <div className="signup-card">
          <div className="signup-card-head">
            <span>VOTRE ESPACE ÉTUDIANT</span>
            <h2>Se connecter</h2>
            <p>Entrez vos identifiants pour accéder à votre tableau de bord.</p>
          </div>

          <form className="signup-form" onSubmit={connecter}>
            <label>
              <span>Adresse e-mail</span>
              <div className="signup-input-wrap"><i>✉</i><input type="email" name="email" required autoComplete="email" placeholder="votre@email.com" /></div>
            </label>

            <label>
              <span>Mot de passe</span>
              <div className="signup-input-wrap"><i>🔒</i><input type="password" name="motDePasse" required autoComplete="current-password" placeholder="Votre mot de passe" /></div>
            </label>

            <button className="signup-submit" type="submit" disabled={chargement}>
              {chargement ? "Connexion en cours..." : "Se connecter →"}
            </button>
          </form>

          {message && <div className="auth-message">{message}</div>}

          <div className="signup-login-separator"><span>NOUVEAU SUR LA PLATEFORME ?</span></div>
          <p className="signup-existing">Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></p>

          <div className="signup-trust">
            <div><b>🔒</b><span>Connexion sécurisée</span></div>
            <div><b>📊</b><span>Progression conservée</span></div>
            <div><b>📱</b><span>Mobile, tablette et ordinateur</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
