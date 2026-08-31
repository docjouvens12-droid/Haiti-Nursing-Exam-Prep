"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "../auth-pages.css";

export default function Inscription() {
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function inscrire(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setMessage("");
    setSucces(false);

    const form = new FormData(e.currentTarget);
    const nomComplet = String(form.get("nomComplet") || "");
    const email = String(form.get("email") || "");
    const motDePasse = String(form.get("motDePasse") || "");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: {
        data: { nom_complet: nomComplet },
        emailRedirectTo: `${window.location.origin}/auth/confirmation`,
      },
    });

    setChargement(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setSucces(true);
    setMessage("Compte créé. Vérifiez votre e-mail pour confirmer votre inscription.");
    e.currentTarget.reset();
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark">✚</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>

        <div className="auth-copy">
          <span>Préparez-vous avec méthode</span>
          <h1>Créez votre espace d’étude.</h1>
          <p>Un seul compte vous permet de suivre votre progression, pratiquer des QCM, passer des examens simulés et revoir vos erreurs.</p>
          <div className="auth-benefits">
            <div className="auth-benefit"><i>1</i><div><strong>Créez votre compte</strong><small>Inscription rapide avec votre adresse e-mail.</small></div></div>
            <div className="auth-benefit"><i>2</i><div><strong>Confirmez votre e-mail</strong><small>Activez votre espace étudiant en toute sécurité.</small></div></div>
            <div className="auth-benefit"><i>3</i><div><strong>Commencez à pratiquer</strong><small>Accédez aux questions, examens et outils de révision.</small></div></div>
          </div>
        </div>

        <div className="auth-panel-footer">Haiti Nursing Exam Prep · Apprendre, pratiquer, progresser</div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <Link className="auth-back" href="/">← Retour à l’accueil</Link>
          <div className="auth-card-head">
            <span className="auth-eyebrow">Nouveau compte</span>
            <h2>Créer un compte</h2>
            <p>Renseignez vos informations pour ouvrir votre espace personnel de préparation.</p>
          </div>

          <form className="auth-form" onSubmit={inscrire}>
            <div className="auth-field">
              <label htmlFor="nomComplet">Nom complet</label>
              <input id="nomComplet" type="text" name="nomComplet" required autoComplete="name" placeholder="Votre nom complet" />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" type="email" name="email" required autoComplete="email" placeholder="vous@exemple.com" />
            </div>
            <div className="auth-field">
              <label htmlFor="motDePasse">Mot de passe</label>
              <input id="motDePasse" type="password" name="motDePasse" minLength={6} required autoComplete="new-password" placeholder="Au moins 6 caractères" />
              <span className="auth-field-hint">Utilisez un mot de passe que vous n’utilisez pas ailleurs.</span>
            </div>
            <button className="auth-submit" type="submit" disabled={chargement}>
              {chargement ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          {message && <div className={`auth-message ${succes ? "success" : ""}`}>{message}</div>}

          <div className="auth-divider">VOUS AVEZ DÉJÀ UN COMPTE ?</div>
          <p className="auth-switch">Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>
          <div className="auth-security"><span>✉️</span><p>Après l’inscription, un e-mail de confirmation peut être requis avant votre première connexion.</p></div>
        </div>
      </section>
    </main>
  );
}
