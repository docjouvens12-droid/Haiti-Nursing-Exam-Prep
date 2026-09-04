import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) redirect("/connexion");

  const { data: module } = await supabase
    .from("learning_modules")
    .select("id,title,summary,estimated_minutes,learning_objectives")
    .eq("slug", "medicaments-respiratoires")
    .eq("is_published", true)
    .single();

  if (!module) redirect("/cours-revisions");

  const { data: sections } = await supabase
    .from("learning_module_sections")
    .select("id,title,content,display_order")
    .eq("module_id", module.id)
    .order("display_order");

  const objectives = Array.isArray(module.learning_objectives)
    ? (module.learning_objectives as string[])
    : [];

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "26px 18px 90px" }}>
      <Link href="/cours-revisions" style={{ color: "#2563eb", fontWeight: 800, fontSize: 14 }}>
        ← Cours & Révisions
      </Link>

      <header style={{ margin: "18px 0 22px", background: "linear-gradient(135deg,#075985,#0ea5e9)", color: "white", borderRadius: 22, padding: "28px 24px" }}>
        <div style={{ opacity: .82, fontSize: 13, fontWeight: 800 }}>PHARMACOLOGIE • RESPIRATOIRE</div>
        <h1 style={{ margin: "7px 0 8px", fontSize: 34 }}>{module.title}</h1>
        <p style={{ margin: 0, lineHeight: 1.65, opacity: .95 }}>{module.summary}</p>
        <div style={{ marginTop: 14, fontSize: 13, fontWeight: 800 }}>⏱ Environ {module.estimated_minutes} minutes</div>
      </header>

      <section style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 18, padding: 20, marginBottom: 22 }}>
        <h2 style={{ color: "#075985", margin: "0 0 10px", fontSize: 21 }}>Objectifs du module</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#334155", lineHeight: 1.72 }}>
          {objectives.map((objective) => <li key={objective} style={{ marginBottom: 6 }}>{objective}</li>)}
        </ul>
      </section>

      <section style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 18, padding: 20, marginBottom: 22 }}>
        <h2 style={{ color: "#9a3412", margin: "0 0 8px", fontSize: 20 }}>Priorité de sécurité</h2>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.72 }}>
          Devant une détresse respiratoire, un thorax très silencieux, une cyanose, une altération de conscience ou une mauvaise réponse au traitement initial, l’évaluation ABC et l’escalade urgente priment sur l’enseignement médicamenteux.
        </p>
      </section>

      <div style={{ display: "grid", gap: 16 }}>
        {(sections ?? []).map((section) => (
          <article key={section.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 20, boxShadow: "0 5px 18px rgba(2,132,199,.05)" }}>
            <h2 style={{ color: "#075985", fontSize: 20, margin: "0 0 9px" }}>{section.title}</h2>
            <p style={{ margin: 0, color: "#334155", lineHeight: 1.72 }}>{section.content}</p>
          </article>
        ))}
      </div>

      <section style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 18, padding: 20, marginTop: 22 }}>
        <h2 style={{ color: "#047857", margin: "0 0 8px", fontSize: 20 }}>Références pédagogiques principales</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, margin: 0 }}>
          Contenu aligné sur les principes actuels de GINA 2026 pour l’asthme, complété par les principes de sécurité médicamenteuse et de surveillance infirmière. Les protocoles locaux et prescriptions individuelles restent prioritaires dans la pratique clinique.
        </p>
      </section>
    </main>
  );
}
