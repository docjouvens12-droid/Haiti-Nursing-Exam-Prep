"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Explique-moi la pré-éclampsie simplement",
  "Fais-moi réviser la pharmacologie",
  "Donne-moi un mini cas clinique de pédiatrie",
  "Explique pourquoi une réponse est correcte",
];

export default function NightingaleChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Je suis Nightingale, votre assistante pédagogique en sciences infirmières. Posez-moi une question, demandez une explication ou entraînez-vous avec un cas clinique.",
    },
  ]);
  const [texte, setTexte] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(message?: string) {
    const contenu = (message ?? texte).trim();
    if (!contenu || chargement) return;

    const nouveauxMessages: Message[] = [...messages, { role: "user", content: contenu }];
    setMessages(nouveauxMessages);
    setTexte("");
    setErreur("");
    setChargement(true);

    try {
      const reponse = await fetch("/api/nightingale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nouveauxMessages }),
      });

      const data = await reponse.json();
      if (!reponse.ok) throw new Error(data?.error || "Nightingale est indisponible pour le moment.");

      setMessages((actuels) => [...actuels, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Nightingale est indisponible pour le moment.");
    } finally {
      setChargement(false);
    }
  }

  function soumettre(e: FormEvent) {
    e.preventDefault();
    void envoyer();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: "#eef2ff", fontSize: 26 }}>🩺</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Nightingale AI</h1>
            <p className="muted" style={{ margin: "3px 0 0" }}>Assistante pédagogique pour la préparation infirmière</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button key={s} type="button" className="button secondary" onClick={() => void envoyer(s)} disabled={chargement}>
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ minHeight: 420, display: "flex", flexDirection: "column", padding: 18 }}>
        <div style={{ flex: 1, display: "grid", gap: 12, alignContent: "start", marginBottom: 18 }}>
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              style={{
                maxWidth: "86%",
                justifySelf: m.role === "user" ? "end" : "start",
                background: m.role === "user" ? "#1d4ed8" : "#f3f4f6",
                color: m.role === "user" ? "white" : "inherit",
                borderRadius: 16,
                padding: "12px 14px",
                whiteSpace: "pre-wrap",
                lineHeight: 1.55,
              }}
            >
              {m.content}
            </div>
          ))}
          {chargement && <div className="muted">Nightingale réfléchit…</div>}
          {erreur && <div style={{ color: "#b91c1c" }}>{erreur}</div>}
        </div>

        <form onSubmit={soumettre} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Posez une question à Nightingale…"
            rows={3}
            style={{ resize: "vertical" }}
          />
          <button className="button" type="submit" disabled={!texte.trim() || chargement}>
            Envoyer
          </button>
        </form>
        <small className="muted" style={{ marginTop: 10 }}>
          Nightingale est un outil éducatif. Elle ne remplace pas un professionnel de santé ni les protocoles cliniques officiels.
        </small>
      </section>
    </div>
  );
}
