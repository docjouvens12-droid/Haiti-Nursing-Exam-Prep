"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "../auth-pages.css";

const plans = [
  { duration: "1 mois", price: "1 500", label: "Flexible", note: "Idéal pour une préparation courte et intensive." },
  { duration: "3 mois", price: "4 000", label: "Populaire", note: "Un bon rythme pour progresser régulièrement." },
  { duration: "6 mois", price: "6 500", label: "Recommandé", note: "Le meilleur équilibre entre durée et prix.", featured: true },
  { duration: "1 an", price: "10 000", label: "Meilleure valeur", note: "Le tarif le plus avantageux pour une préparation complète.", bestValue: true },
];

export default function Inscription() {
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [etape, setEtape] = useState<1 | 2>(1);
  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [plan, setPlan] = useState("6 mois");

  function continuer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setEtape(2);
  }

  async function inscrire() {
    setChargement(true);
    setMessage("");
    setSucces(false);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: {
        data: { nom_complet: nomComplet, abonnement_souhaite: plan },
        emailRedirectTo: `${window.location.origin}/auth/confirmation`,
      },
    });

    setChargement(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setSucces(true);
    setMessage(`Compte créé avec la formule ${plan}. Vérifiez votre e-mail pour confirmer votre inscription.`);
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
          <p>Créez votre espace personnel, choisissez votre formule et préparez-vous avec des outils structurés pour l’Examen d’État infirmier.</p>

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

        <div className={`signup-card ${etape === 2 ? "signup-card-plans" : ""}`}>
          <div className="signup-stepper" aria-label="Étapes de l’inscription">
            <span className={etape === 1 ? "active" : "done"}>1 <b>Compte</b></span>
            <i />
            <span className={etape === 2 ? "active" : ""}>2 <b>Formule</b></span>
          </div>

          {etape === 1 ? (
            <>
              <div className="signup-card-head">
                <span>ÉTAPE 1 SUR 2</span>
                <h2>Créer votre compte</h2>
                <p>Renseignez vos informations avant de choisir votre formule.</p>
              </div>

              <form className="signup-form" onSubmit={continuer}>
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

                <button className="signup-submit" type="submit">Continuer vers les formules →</button>
              </form>
            </>
          ) : (
            <>
              <div className="signup-card-head">
                <span>ÉTAPE 2 SUR 2</span>
                <h2>Choisissez votre formule</h2>
                <p>Sélectionnez la durée qui correspond le mieux à votre préparation.</p>
              </div>

              <div className="signup-plan-grid">
                {plans.map((item)=>(
                  <button
                    type="button"
                    key={item.duration}
                    className={`signup-plan${plan === item.duration ? " selected" : ""}${item.featured ? " featured" : ""}`}
                    onClick={()=>setPlan(item.duration)}
                    aria-pressed={plan === item.duration}
                  >
                    <div className="signup-plan-heading"><span>{item.label}</span><strong>{item.duration}</strong></div>
                    <div className="signup-plan-price"><b>{item.price}</b><small>HTG</small></div>
                    <p>{item.note}</p>
                    <em>{plan === item.duration ? "✓ Sélectionné" : "Choisir"}</em>
                  </button>
                ))}
              </div>

              <div className="signup-plan-benefits">
                <span>✓ 6 425 QCM expliqués</span>
                <span>✓ Examens simulés</span>
                <span>✓ 78 modules de cours</span>
                <span>✓ Statistiques, erreurs et favoris</span>
              </div>

              <p className="signup-payment-note">Le paiement en ligne n’est pas encore activé. Votre choix de formule sera enregistré avec votre inscription.</p>

              <div className="signup-plan-actions">
                <button type="button" className="signup-back-step" onClick={()=>setEtape(1)}>← Modifier mes informations</button>
                <button className="signup-submit" type="button" disabled={chargement || succes} onClick={inscrire}>{chargement ? "Création en cours..." : succes ? "Compte créé ✓" : "Créer mon compte →"}</button>
              </div>
            </>
          )}

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
