import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const domaines = [
  { titre: "Soins infirmiers médico-chirurgicaux", description: "Révision structurée des principaux systèmes et pathologies de l’adulte.", modules: ["Cardiovasculaire", "Respiratoire", "Neurologie", "Gastro-intestinal", "Rénal", "Endocrinologie", "Hématologie"] },
  { titre: "Santé maternelle, obstétrique et néonatale", description: "Grossesse, travail, accouchement, postpartum et soins du nouveau-né.", modules: ["Grossesse", "Travail et accouchement", "Postpartum", "Nouveau-né"] },
  { titre: "Soins infirmiers pédiatriques", description: "Croissance, développement et prise en charge des principales affections pédiatriques.", modules: ["Croissance et développement", "Nouveau-né", "Maladies pédiatriques", "Urgences pédiatriques"] },
  { titre: "Pharmacologie", description: "Classes médicamenteuses, surveillance, sécurité et administration infirmière.", modules: ["Principes de pharmacologie", "Médicaments cardiovasculaires", "Anti-infectieux", "Analgésiques"] },
  { titre: "Santé mentale et psychiatrie", description: "Troubles psychiatriques, communication thérapeutique et interventions infirmières.", modules: ["Évaluation psychiatrique", "Troubles de l’humeur", "Psychoses", "Anxiété et stress"] },
  { titre: "Santé communautaire et santé publique", description: "Prévention, promotion de la santé, épidémiologie et soins communautaires.", modules: ["Prévention", "Épidémiologie", "Santé familiale", "Éducation sanitaire"] },
  { titre: "Fondements des soins infirmiers", description: "Principes essentiels, sécurité, hygiène et démarche de soins.", modules: ["Démarche de soins", "Sécurité du patient", "Hygiène et infection", "Soins de base"] },
  { titre: "Urgences et soins critiques", description: "Priorités, stabilisation et surveillance du patient critique.", modules: ["Évaluation ABCDE", "État de choc", "Urgences respiratoires", "Urgences cardiovasculaires"] },
];

export default async function CoursRevisionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/connexion");

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 18px 90px" }}>
      <section style={{ background: "linear-gradient(135deg,#071b4f,#1748b7)", color: "white", borderRadius: 22, padding: "28px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 800, opacity: .8, textTransform: "uppercase", letterSpacing: 1 }}>Bibliothèque d’apprentissage</div>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Cours & Révisions</h1>
        <p style={{ maxWidth: 720, lineHeight: 1.65, margin: 0, opacity: .92 }}>Étudiez les notions essentielles des sciences infirmières grâce à des modules structurés, indépendants de la banque de questions et des examens.</p>
      </section>

      <div style={{ display: "grid", gap: 16 }}>
        {domaines.map((domaine, index) => (
          <section key={domaine.titre} style={{ border: "1px solid #e3e9f3", borderRadius: 18, background: "white", padding: 20, boxShadow: "0 6px 22px rgba(11,31,89,.05)" }}>
            <h2 style={{ color: "#0b1f59", fontSize: 20, margin: "0 0 7px" }}>{domaine.titre}</h2>
            <p style={{ color: "#64748b", lineHeight: 1.55, margin: "0 0 16px" }}>{domaine.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {domaine.modules.map((module) => {
                const cardiovasculaire = index === 0 && module === "Cardiovasculaire";
                return cardiovasculaire ? (
                  <a key={module} href="/cours-revisions/cardiovasculaire" style={{ background: "#eaf2ff", color: "#1657d8", border: "1px solid #bfd3ff", padding: "9px 13px", borderRadius: 999, fontWeight: 800, fontSize: 13 }}>{module} →</a>
                ) : (
                  <span key={module} style={{ background: "#f5f7fb", color: "#64748b", border: "1px solid #e5eaf2", padding: "9px 13px", borderRadius: 999, fontWeight: 700, fontSize: 13 }}>{module}</span>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
