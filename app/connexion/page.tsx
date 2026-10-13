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

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
      if (error) {
        if (error.code === "email_not_confirmed") {
          setMessage("Confirmez votre adresse e-mail avant de vous connecter.");
        } else if (error.code === "over_request_rate_limit" || error.status === 429) {
          setMessage("Trop de tentatives. Attendez quelques minutes et réessayez.");
        } else if (error.code === "invalid_credentials") {
          setMessage("E-mail ou mot de passe incorrect. Vérifiez vos identifiants.");
        } else if ((error.status ?? 0) >= 500 || /fetch|network|timeout/i.test(error.message)) {
          setMessage("Le service de connexion est momentanément indisponible. Réessayez plus tard.");
        } else {
          setMessage("Connexion indisponible. Vérifiez votre accès et réessayez.");
        }
        return;
      }
      router.push("/tableau-de-bord");
      router.refresh();
    } catch {
      setMessage("Problème de réseau. Vos données sont conservées ; réessayez quand la connexion revient.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="signup-showcase">
      <section className="signup-story">
        <Link href="/" className="signup-brand" aria-label="Haiti Nursing Exam Prep - Accueil">
          <img src={"/hn-logo.svg?v=hn-b-20261013-2"} alt="Haiti Nursing Exam Prep" width={215} height={65} style={{width:"min(215px,100%)",height:"auto"}} />
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
