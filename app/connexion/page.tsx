"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    setChargement(false);

    if (error) {
      setMessage("Connexion impossible. Vérifiez votre e-mail et votre mot de passe.");
      return;
    }

    router.push("/tableau-de-bord");
    router.refresh();
  }

  return (
    <main className="container page">
      <div className="form card">
        <div className="logo">Haiti Nursing Exam Prep</div>
        <h1 style={{fontSize:"2rem"}}>Connexion</h1>

        <form onSubmit={connecter}>
          <div className="field">
            <label>Adresse e-mail</label>
            <input type="email" name="email" required placeholder="vous@exemple.com" />
          </div>

          <div className="field">
            <label>Mot de passe</label>
            <input type="password" name="motDePasse" minLength={6} required />
          </div>

          <button className="btn btn-primary" type="submit" disabled={chargement}>
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {message && <p className="muted">{message}</p>}

        <p className="muted">
          Pas encore de compte ? <Link href="/inscription"><strong>Créer un compte</strong></Link>
        </p>
      </div>
    </main>
  );
}
