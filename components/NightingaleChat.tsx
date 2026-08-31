"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  { icon: "✚", text: "Explique-moi la pré-éclampsie simplement" },
  { icon: "Rx", text: "Fais-moi réviser la pharmacologie" },
  { icon: "◉", text: "Donne-moi un mini cas clinique de pédiatrie" },
  { icon: "?", text: "Explique pourquoi une réponse est correcte" },
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
  const finConversation = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    finConversation.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, chargement]);

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

  function gererClavier(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (texte.trim() && !chargement) void envoyer();
    }
  }

  function nouvelleConversation() {
    setMessages([
      {
        role: "assistant",
        content:
          "Nouvelle session ouverte. Que souhaitez-vous réviser aujourd’hui ? Je peux expliquer un concept, créer un QCM ou vous proposer un cas clinique.",
      },
    ]);
    setTexte("");
    setErreur("");
  }

  return (
    <div className="nightingale-workspace">
      <aside className="nightingale-tools">
        <div className="nightingale-tools-heading">
          <div>
            <span className="nightingale-eyebrow">Démarrage rapide</span>
            <h3>Que voulez-vous travailler ?</h3>
          </div>
          <button type="button" className="nightingale-new-chat" onClick={nouvelleConversation}>＋ Nouvelle discussion</button>
        </div>

        <div className="nightingale-suggestion-grid">
          {suggestions.map((s) => (
            <button key={s.text} type="button" className="nightingale-suggestion" onClick={() => void envoyer(s.text)} disabled={chargement}>
              <span>{s.icon}</span>
              <strong>{s.text}</strong>
            </button>
          ))}
        </div>

        <div className="nightingale-study-tip">
          <span>💡</span>
          <div>
            <strong>Conseil</strong>
            <p>Pour une meilleure réponse, indiquez la matière, ce que vous ne comprenez pas et le niveau de détail souhaité.</p>
          </div>
        </div>
      </aside>

      <section className="nightingale-chat-card">
        <div className="nightingale-chat-header">
          <div className="nightingale-chat-identity">
            <div className="nightingale-chat-avatar">✦</div>
            <div>
              <strong>Nightingale</strong>
              <span><i /> Assistante d’étude disponible</span>
            </div>
          </div>
          <div className="nightingale-chat-status">Sciences infirmières</div>
        </div>

        <div className="nightingale-messages" aria-live="polite">
          {messages.map((m, i) => (
            <div key={`${m.role}-${i}`} className={`nightingale-message-row ${m.role}`}>
              {m.role === "assistant" && <div className="nightingale-message-avatar">✦</div>}
              <div className={`nightingale-message ${m.role}`}>
                <span className="nightingale-message-author">{m.role === "assistant" ? "Nightingale" : "Vous"}</span>
                <div>{m.content}</div>
              </div>
            </div>
          ))}

          {chargement && (
            <div className="nightingale-message-row assistant">
              <div className="nightingale-message-avatar">✦</div>
              <div className="nightingale-message assistant nightingale-thinking">
                <span className="nightingale-message-author">Nightingale</span>
                <div className="nightingale-dots"><i /><i /><i /></div>
              </div>
            </div>
          )}

          {erreur && <div className="nightingale-error">⚠ {erreur}</div>}
          <div ref={finConversation} />
        </div>

        <form onSubmit={soumettre} className="nightingale-composer">
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={gererClavier}
            placeholder="Posez une question à Nightingale…"
            rows={3}
            aria-label="Message à Nightingale"
          />
          <div className="nightingale-composer-footer">
            <span>Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne</span>
            <button type="submit" disabled={!texte.trim() || chargement}>{chargement ? "Patientez…" : "Envoyer ➜"}</button>
          </div>
        </form>

        <div className="nightingale-disclaimer">
          <span>ⓘ</span>
          <p>Nightingale est un outil éducatif. Elle ne remplace pas un professionnel de santé ni les protocoles cliniques officiels.</p>
        </div>
      </section>
    </div>
  );
}
