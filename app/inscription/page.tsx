"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "../auth-pages.css";

export default function Inscription() {
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  async function inscrire(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (chargement || succes) return;

    setChargement(true);
    setMessage("");
    setSucces(false);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: {
        data: { nom_complet: nomComplet, acces_test: true },
        emailRedirectTo: `${window.location.origin}/auth/confirmation`,
      },
    });

    setChargement(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setSucces(true);
    setMessage("Compte créé. Vérifiez votre e-mail pour confirmer votre inscription et accéder à la plateforme de test.");
  }

  return (
    <main className="signup-showcase">
      <section className="signup-story">
        <Link href="/" className="signup-brand" aria-label="Haiti Nursing Exam Prep - Accueil">
          <span className="signup-brand-mark">H</span>
          <span><strong>Haiti Nursing</strong><small>EXAM PREP</small></span>
        </Link>

        <div className="signup-story-copy">
          <span className="signup-eyebrow">Préparation Examen d’État infirmier 🇭🇹</span>
          <h1>Votre réussite <em>commence ici.</em></h1>
          <p>Créez votre espace personnel et accédez directement aux outils de préparation pendant la phase de test.</p>

          <div className="signup-benefit-list">
            <div><i>▤</i><span><b>6 425 QCM expliqués</b><small>Pour vous entraîner efficacement</small></span></div>
            <div><i>▣</i><span><b>78 modules de cours</b><small>Pour réviser par domaine infirmier</small></span></div>
            <div><i>✓</i><span><b>17 formats d’examen</b><small>Pour varier vos entraînements</small></span></div>
            <div><i>▥</i><span><b>Suivez vos progrès</b><small>Statistiques, erreurs et favoris</small></span></div>
          </div>
        </div>

        <div className="signup-visual" aria-hidden="true">
          <div className="signup-wave" />
          <div className="signup-nurse-symbol">✚</div>
          <p>Préparer aujourd’hui.<br/><strong>Réussir demain.</strong></p>
        </div>
      </section>

      <section className="signup-form-zone">
        <Link className="signup-back" href="/">← Retour à l’accueil</Link>

        <div className="signup-card">
          <div className="signup-card-head">
            <span>ACCÈS TESTEURS</span>
            <h2>Créer votre compte</h2>
            <p>Aucun tarif ni choix de formule pendant la phase de test. Créez simplement votre compte pour commencer.</p>
          </div>

          <form className="signup-form" onSubmit={inscrire}>
            <label>
              <span>Nom complet</span>
              <div className="signup-input-wrap"><i>♙</i><input type="text" value={nomComplet} onChange={(e)=>setNomComplet(e.target.value)} required autoComplete="name" placeholder="Votre nom complet" /></div>
            </label>

            <label>
              <span>Adresse e-mail</span>
              <div className="signup-input-wrap"><i>✉</i><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" placeholder="votre@email.com" /></div>
            </label>

            <label>
              <span>Mot de passe</span>
              <div className="signup-input-wrap"><i>🔒</i><input type="password" value={motDePasse} onChange={(e)=>setMotDePasse(e.target.value)} minLength={8} required autoComplete="new-password" placeholder="Créez un mot de passe sécurisé" /></div>
              <small className="signup-password-note">✓ Au moins 8 caractères · utilisez un mot de passe unique</small>
            </label>

            <button className="signup-submit" type="submit" disabled={chargement || succes}>{chargement ? "Création en cours..." : succes ? "Compte créé ✓" : "Créer mon compte →"}</button>
          </form>

          {message && <div className={`auth-message ${succes ? "success" : ""}`}>{message}</div>}

          {!succes && <>
            <div className="signup-login-separator"><span>OU</span></div>
            <p className="signup-existing">Déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
          </>}

          <div className="signup-trust">
            <div><b>🔒</b><span>Données protégées</span></div>
            <div><b>✉</b><span>Confirmation par e-mail</span></div>
            <div><b>📱</b><span>Mobile, tablette et ordinateur</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
