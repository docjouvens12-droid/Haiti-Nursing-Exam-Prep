import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAutreSysteme } from "@/lib/cours/autres-systemes";
import { getComplementsSysteme } from "@/lib/cours/complements-systemes";
import { perioperatoire } from "@/lib/cours/perioperatoire";
import { equilibreHydroelectrolytique } from "@/lib/cours/equilibre-hydroelectrolytique";
import { sepsisInfectionsSystemiques } from "@/lib/cours/sepsis-infections-systemiques";
import SystemAnatomyDiagrams from "@/components/SystemAnatomyDiagrams";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const rubriques = [
  ["definition", "Définition"], ["physiopathologie", "Physiopathologie"], ["risques", "Facteurs de risque"],
  ["manifestations", "Manifestations cliniques"], ["examens", "Examens diagnostiques"], ["traitement", "Traitement"],
  ["soins", "Prise en charge infirmière"], ["complications", "Complications"], ["education", "Éducation du patient"],
  ["points", "Points clés à retenir"],
] as const;

export default async function SystemeCoursPage({ params }: { params: Promise<{ systeme: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/connexion");
  const { systeme: slug } = await params;
  const moduleSpecial = slug === "perioperatoire"
    ? perioperatoire
    : slug === "equilibre-hydroelectrolytique"
      ? equilibreHydroelectrolytique
      : slug === "sepsis-infections-systemiques"
        ? sepsisInfectionsSystemiques
        : undefined;
  const systeme = moduleSpecial ?? getAutreSysteme(slug);
  if (!systeme) notFound();
  const pathologies = moduleSpecial ? systeme.pathologies : [...systeme.pathologies, ...getComplementsSysteme(slug)];

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "26px 18px 90px" }}>
      <Link href="/cours-revisions" style={{ color: "#2563eb", fontWeight: 800, fontSize: 14 }}>← Cours & Révisions</Link>
      <header style={{ margin: "18px 0 22px", background: "linear-gradient(135deg,#071b4f,#1748b7)", color: "white", borderRadius: 22, padding: "28px 24px" }}>
        <div style={{ opacity: 0.8, fontSize: 13, fontWeight: 800 }}>SOINS INFIRMIERS MÉDICO-CHIRURGICAUX</div>
        <h1 style={{ margin: "7px 0 8px", fontSize: 34 }}>{systeme.titre}</h1>
        <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.92 }}>Rappel essentiel, situations prioritaires et prise en charge infirmière structurée.</p>
      </header>
      <section style={{ background: "#eef6ff", border: "1px solid #cfe3fb", borderRadius: 18, padding: 20, marginBottom: 22 }}>
        <h2 style={{ color: "#0b1f59", margin: "0 0 8px", fontSize: 20 }}>Objectifs du module</h2><p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>{systeme.objectifs}</p>
      </section>
      <section style={{ background: "white", border: "1px solid #e4eaf3", borderRadius: 18, padding: 22, marginBottom: 22 }}>
        <h2 style={{ color: "#0b1f59", margin: "0 0 12px", fontSize: 23 }}>Bref rappel d’anatomie et de physiologie</h2>
        {systeme.rappel.map((texte) => <p key={texte} style={{ color: "#334155", lineHeight: 1.72, margin: "0 0 10px" }}>{texte}</p>)}
      </section>
      {!moduleSpecial && <SystemAnatomyDiagrams systeme={slug} />}
      <div style={{ display: "grid", gap: 18 }}>
        {pathologies.map((pathologie, index) => (
          <article key={pathologie.nom} style={{ background: "white", border: "1px solid #dfe6f0", borderRadius: 19, overflow: "hidden", boxShadow: "0 6px 20px rgba(11,31,89,.05)" }}>
            <div style={{ background: "#0b1f59", color: "white", padding: "17px 20px" }}><div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: 0.8 }}>THÈME {index + 1}</div><h2 style={{ margin: "4px 0 0", fontSize: 22 }}>{pathologie.nom}</h2></div>
            <div style={{ padding: "8px 20px 18px" }}>
              {rubriques.map(([cle, label]) => <section key={cle} style={{ padding: "13px 0", borderBottom: cle === "points" ? "none" : "1px solid #edf1f6" }}><h3 style={{ color: cle === "points" ? "#137a4d" : "#1748b7", fontSize: 15, margin: "0 0 6px" }}>{label}</h3><p style={{ color: "#334155", lineHeight: 1.68, margin: 0 }}>{pathologie[cle]}</p></section>)}
              <aside style={{ background: "#eef6ff", border: "1px solid #cfe3fb", borderRadius: 14, padding: 14, marginTop: 8 }}><strong style={{ color: "#0b1f59" }}>Priorité infirmière</strong><p style={{ margin: "6px 0 0", color: "#475569", lineHeight: 1.65, fontSize: 14 }}>{pathologie.priorite}</p></aside>
            </div>
          </article>
        ))}
      </div>
      <section style={{ background: "#f8fafc", border: "1px solid #dfe6f0", borderRadius: 18, padding: 20, marginTop: 22 }}>
        <h2 style={{ color: "#0b1f59", margin: "0 0 12px", fontSize: 21 }}>Références principales</h2>
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10 }}>{systeme.references.map((reference) => <li key={reference.href} style={{ color: "#334155", lineHeight: 1.55, fontSize: 13 }}><a href={reference.href} target="_blank" rel="noreferrer" style={{ color: "#1748b7", fontWeight: 700, textDecoration: "underline" }}>{reference.label}</a></li>)}</ol>
      </section>
      <p style={{ marginTop: 22, color: "#718096", fontSize: 12, lineHeight: 1.55 }}>Contenu éducatif de révision. Les protocoles et recommandations cliniques peuvent évoluer.</p>
    </main>
  );
}
