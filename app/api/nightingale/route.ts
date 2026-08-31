import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Nightingale est installée, mais sa clé d’intelligence artificielle n’est pas encore configurée." },
      { status: 503 }
    );
  }

  let body: { messages?: Message[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (m): m is Message =>
      (m?.role === "user" || m?.role === "assistant") &&
      typeof m?.content === "string" &&
      m.content.trim().length > 0
  );

  if (messages.length === 0) {
    return NextResponse.json({ error: "Aucun message à traiter." }, { status: 400 });
  }

  const conversation = messages.slice(-12).map((m) => `${m.role === "user" ? "Étudiant" : "Nightingale"}: ${m.content}`).join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.NIGHTINGALE_MODEL || "gpt-5.4",
      instructions:
        "Tu es Nightingale, une assistante pédagogique de Haiti Nursing Exam Prep. Tu aides des étudiants en sciences infirmières à préparer leurs examens. Réponds principalement en français clair, structuré et pédagogique. Tu peux expliquer des notions, créer des mini-cas cliniques, des QCM d'entraînement et expliquer les réponses. Ne prétends jamais qu'une question reconstituée est officielle. Pour toute question clinique réelle concernant une personne, rappelle que tu fournis une information éducative et qu'il faut suivre les protocoles locaux et l'avis d'un professionnel qualifié. N'invente pas de source officielle. Sois concise mais suffisamment explicative.",
      input: conversation,
      max_output_tokens: 700,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Erreur Nightingale/OpenAI:", response.status, details.slice(0, 500));
    return NextResponse.json({ error: "Nightingale n’a pas pu répondre pour le moment." }, { status: 502 });
  }

  const data = await response.json();
  const reply =
    data.output_text ||
    data.output?.flatMap((item: any) => item?.content ?? []).find((c: any) => c?.type === "output_text")?.text;

  if (!reply) {
    return NextResponse.json({ error: "Réponse vide de Nightingale." }, { status: 502 });
  }

  return NextResponse.json({ reply });
}
