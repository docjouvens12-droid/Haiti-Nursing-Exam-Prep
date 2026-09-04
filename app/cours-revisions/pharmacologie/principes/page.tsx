import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ModuleQuiz from "@/components/ModuleQuiz";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type QuizQuestion = {
  id: string;
  question_order: number;
  question_type: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  option_rationales: Record<string, string> | null;
  learning_point: string;
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/connexion");

  const { data: module } = await supabase
    .from("learning_modules")
    .select("id,title,summary,estimated_minutes,learning_objectives")
    .eq("slug", "principes-pharmacologie")
    .eq("is_published", true)
    .single();

  if (!module) redirect("/cours-revisions");

  const [{ data: sections }, { data: quiz }] = await Promise.all([
    supabase
      .from("learning_module_sections")
      .select("section_key,title,content,display_order")
      .eq("module_id", module.id)
      .order("display_order"),
    supabase
      .from("learning_module_quiz_questions")
      .select("id,question_order,question_type,question,option_a,option_b,option_c,option_d,correct_answer,explanation,option_rationales,learning_point")
      .eq("module_id", module.id)
      .order("question_order"),
  ]);

  const objectives = Array.isArray(module.learning_objectives) ? module.learning_objectives : [];

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px 90px" }}>
      <a href="/cours-revisions" style={{ color: "#1657d8", fontWeight: 800, fontSize: 14 }}>← Cours & Révisions</a>

      <section style={{ background: "linear-gradient(135deg,#071b4f,#1748b7)", color: "white", borderRadius: 22, padding: "28px 24px", margin: "18px 0 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, opacity: .8, textTransform: "uppercase", letterSpacing: 1 }}>Pharmacologie</div>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>{module.title}</h1>
        <p style={{ maxWidth: 760, lineHeight: 1.65, margin: 0, opacity: .94 }}>{module.summary}</p>
        <div style={{ marginTop: 16, fontWeight: 800 }}>{module.estimated_minutes} min · 15 sections · Mini-évaluation de 15 questions</div>
      </section>

      <section style={{ border: "1px solid #e3e9f3", borderRadius: 18, background: "white", padding: 20, marginBottom: 18 }}>
        <h2 style={{ color: "#0b1f59", marginTop: 0 }}>Objectifs d’apprentissage</h2>
        <ul style={{ lineHeight: 1.7, color: "#334155", paddingLeft: 22 }}>
          {objectives.map((o: unknown, i: number) => <li key={i}>{String(o)}</li>)}
        </ul>
      </section>

      <div style={{ display: "grid", gap: 14 }}>
        {(sections ?? []).map((s) => (
          <section key={s.section_key} style={{ border: "1px solid #e3e9f3", borderRadius: 18, background: "white", padding: 20, boxShadow: "0 6px 22px rgba(11,31,89,.04)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#1657d8", textTransform: "uppercase", letterSpacing: .8 }}>Section {s.display_order}</div>
            <h2 style={{ color: "#0b1f59", fontSize: 20, margin: "6px 0 10px" }}>{s.title}</h2>
            <p style={{ color: "#475569", lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{s.content}</p>
          </section>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <ModuleQuiz questions={(quiz ?? []) as QuizQuestion[]} />
      </div>
    </main>
  );
}
