"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Inscription() {
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);

  async function inscrire(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setMessage("");

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
    setMessage("Compte créé. Vérifiez votre e-mail pour confirmer votre inscription.");
  }

  return (
    <main className="container page">
      <div className="form card">
        <div className="logo">Haiti Nursing Exam Prep</div>
        <h1 style={{fontSize:"2rem"}}>Créer un compte</h1>
        <form onSubmit={inscrire}>
          <div className="field"><label>Nom complet</label><input type="text" name="nomComplet" required /></div>
          <div className="field"><label>Adresse e-mail</label><input type="email" name="email" required /></div>
          <div className="field"><label>Mot de passe</label><input type="password" name="motDePasse" minLength={6} required /></div>
          <button className="btn btn-primary" type="submit" disabled={chargement}>{chargement ? "Création..." : "Créer mon compte"}</button>
        </form>
        {message && <p className="muted">{message}</p>}
        <p className="muted">Déjà inscrit ? <Link href="/connexion"><strong>Se connecter</strong></Link></p>
      </div>
    </main>
  );
}
