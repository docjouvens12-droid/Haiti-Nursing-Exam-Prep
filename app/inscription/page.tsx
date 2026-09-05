"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "../auth-pages.css";

const plans = [
  { label: "1 mois", price: "1 500 HTG" },
  { label: "3 mois", price: "4 000 HTG" },
  { label: "6 mois", price: "6 500 HTG", badge: "Recommandé" },
  { label: "1 an", price: "10 000 HTG", badge: "Meilleure valeur" },
];

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
    <main className="auth-shell auth-register-shell">
      <section className="auth-panel auth-register-panel">
        <Link href="/" className="auth-brand" aria-label="Retour à l’accueil">
          <span className="auth-brand-mark">H</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>

        <div className="auth-copy">
          <span className="auth-kicker">Votre préparation commence ici</span>
          <h1>Créez votre espace étudiant.</h1>
          <p>Un compte unique pour pratiquer les QCM, suivre votre progression, accéder aux examens simulés et retrouver vos cours de révision.</p>

          <div className="auth-value-grid">
            <div><b>6 425</b><small>QCM expliqués</small></div>
            <div><b>78</b><small>Modules de cours</small></div>
            <div><b>17</b><small>Formats d’examen</small></div>
          </div>

          <div className="auth-benefits auth-benefits-modern">
            <div className="auth-benefit"><i>✓</i><div><strong>Explications complètes</strong><small>Bonne réponse, analyse A–D et point à retenir.</small></div></div>
            <div className="auth-benefit"><i>✓</i><div><strong>Progression personnelle</strong><small>Résultats, erreurs et favoris réunis dans votre espace.</small></div></div>
            <div className="auth-benefit"><i>✓</i><div><strong>Accessible partout</strong><small>Téléphone, tablette ou ordinateur.</small></div></div>
          </div>
        </div>

        <div className="auth-plan-preview" aria-label="Formules disponibles">
          <div className="auth-plan-head"><strong>Formules disponibles</strong><small>Le paiement sera sélectionné après la création du compte.</small></div>
          <div className="auth-plan-row">
            {plans.map((plan) => (
              <div className="auth-plan-chip" key={plan.label}>
                {plan.badge && <span>{plan.badge}</span>}
                <b>{plan.label}</b><small>{plan.price}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-form-side auth-register-form-side">
        <div className="auth-card auth-register-card">
          <Link className="auth-back" href="/">← Retour à l’accueil</Link>

          <div className="auth-card-head">
            <span className="auth-eyebrow">Créer votre compte</span>
            <h2>Bienvenue 👋</h2>
            <p>Renseignez vos informations. Vous pourrez choisir votre formule d’abonnement ensuite.</p>
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
              <span className="auth-field-hint">Utilisez au moins 6 caractères et évitez un mot de passe déjà utilisé ailleurs.</span>
            </div>

            <button className="auth-submit" type="submit" disabled={chargement}>
              {chargement ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          {message && <div className={`auth-message ${succes ? "success" : ""}`}>{message}</div>}

          <div className="auth-trust-row">
            <span>🔒 Connexion sécurisée</span>
            <span>✉ Confirmation par e-mail</span>
          </div>

          <div className="auth-divider">VOUS AVEZ DÉJÀ UN COMPTE ?</div>
          <p className="auth-switch">Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>

          <p className="auth-legal-note">En créant un compte, vous pourrez ensuite choisir une formule d’accès adaptée à votre période de préparation.</p>
        </div>
      </section>
    </main>
  );
}
