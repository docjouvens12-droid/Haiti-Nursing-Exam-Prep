import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pathologiesCardiovasculaires, type PathologieCardiovasculaire } from "@/lib/cours/cardiovasculaire";

const rubriques: Array<[keyof PathologieCardiovasculaire, string]> = [
  ["definition", "Définition"],
  ["physiopathologie", "Physiopathologie"],
  ["risques", "Facteurs de risque"],
  ["manifestations", "Manifestations cliniques"],
  ["examens", "Examens diagnostiques"],
  ["traitement", "Traitement"],
  ["soins", "Prise en charge infirmière"],
  ["complications", "Complications"],
  ["education", "Éducation du patient"],
  ["points", "Points clés à retenir"],
];

const prioritesInfirmieres: Partial<Record<number, string>> = {
  0: "Devant une pression très élevée, évaluer immédiatement le patient et rechercher des signes d’atteinte aiguë d’organe. La gravité dépend du contexte clinique et de l’atteinte d’organe, pas uniquement du chiffre affiché sur le tensiomètre.",
  1: "Devant une douleur ou une pression thoracique nouvelle, persistante, survenant au repos ou associée à dyspnée, sueurs, nausées, malaise ou syncope, considérer d’abord un syndrome coronarien aigu. Interrompre l’effort, évaluer rapidement les signes vitaux et la perfusion, obtenir un ECG selon le protocole, maintenir une surveillance rapprochée et alerter sans retarder la prise en charge urgente.",
};

export default async function CardiovasculairePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/connexion");

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "26px 18px 90px" }}>
      <Link href="/cours-revisions" style={{ color: "#2563eb", fontWeight: 800, fontSize: 14 }}>
        ← Cours & Révisions
      </Link>

      <header style={{ margin: "18px 0 22px", background: "linear-gradient(135deg,#071b4f,#1748b7)", color: "white", borderRadius: 22, padding: "28px 24px" }}>
        <div style={{ opacity: 0.8, fontSize: 13, fontWeight: 800 }}>SOINS INFIRMIERS MÉDICO-CHIRURGICAUX</div>
        <h1 style={{ margin: "7px 0 8px", fontSize: 34 }}>Système cardiovasculaire</h1>
        <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.92 }}>
          Bref rappel anatomique et physiologique, puis étude structurée des principales pathologies cardiovasculaires.
        </p>
      </header>

      <section style={{ background: "white", border: "1px solid #e4eaf3", borderRadius: 18, padding: 22, marginBottom: 22 }}>
        <h2 style={{ color: "#0b1f59", margin: "0 0 12px", fontSize: 23 }}>Bref rappel d’anatomie et de physiologie</h2>
        <p style={{ color: "#334155", lineHeight: 1.72 }}>Le cœur est un organe musculaire à quatre cavités : oreillette droite, ventricule droit, oreillette gauche et ventricule gauche. Les valves tricuspide, pulmonaire, mitrale et aortique maintiennent normalement un flux sanguin unidirectionnel.</p>
        <p style={{ color: "#334155", lineHeight: 1.72 }}>Le cœur droit reçoit le sang veineux et l’envoie vers les poumons par la circulation pulmonaire. Le cœur gauche reçoit le sang oxygéné et le propulse dans l’aorte vers les organes par la circulation systémique. Les artères coronaires assurent l’apport sanguin au myocarde lui-même.</p>
        <p style={{ color: "#334155", lineHeight: 1.72 }}>L’activité électrique naît normalement au nœud sinusal, traverse les oreillettes, le nœud auriculo-ventriculaire puis le système His-Purkinje afin de coordonner la contraction des ventricules. Le cycle cardiaque alterne diastole, période de remplissage, et systole, période d’éjection.</p>
        <p style={{ color: "#334155", lineHeight: 1.72, marginBottom: 0 }}>Le débit cardiaque correspond au produit de la fréquence cardiaque par le volume d’éjection systolique. Une perfusion adéquate dépend donc d’une pompe efficace, d’un rythme approprié, d’un volume circulant suffisant et d’un réseau vasculaire fonctionnel.</p>
      </section>

      <div style={{ display: "grid", gap: 18 }}>
        {pathologiesCardiovasculaires.map((pathologie, index) => (
          <article key={pathologie.nom} style={{ background: "white", border: "1px solid #dfe6f0", borderRadius: 19, overflow: "hidden", boxShadow: "0 6px 20px rgba(11,31,89,.05)" }}>
            <div style={{ background: "#0b1f59", color: "white", padding: "17px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: 0.8 }}>PATHOLOGIE {index + 1}</div>
              <h2 style={{ margin: "4px 0 0", fontSize: 22 }}>{pathologie.nom}</h2>
            </div>

            <div style={{ padding: "8px 20px 18px" }}>
              {rubriques.map(([cle, label]) => (
                <section key={String(cle)} style={{ padding: "13px 0", borderBottom: cle === "points" ? "none" : "1px solid #edf1f6" }}>
                  <h3 style={{ color: cle === "points" ? "#137a4d" : "#1748b7", fontSize: 15, margin: "0 0 6px" }}>{label}</h3>
                  <p style={{ color: "#334155", lineHeight: 1.68, margin: 0 }}>{pathologie[cle]}</p>
                </section>
              ))}

              {prioritesInfirmieres[index] && (
                <aside style={{ background: "#eef6ff", border: "1px solid #cfe3fb", borderRadius: 14, padding: 14, marginTop: 8 }}>
                  <strong style={{ color: "#0b1f59" }}>Priorité infirmière</strong>
                  <p style={{ margin: "6px 0 0", color: "#475569", lineHeight: 1.65, fontSize: 14 }}>
                    {prioritesInfirmieres[index]}
                  </p>
                </aside>
              )}
            </div>
          </article>
        ))}
      </div>

      <p style={{ marginTop: 22, color: "#718096", fontSize: 12, lineHeight: 1.55 }}>
        Contenu éducatif de révision. Les seuils diagnostiques, indications thérapeutiques et protocoles peuvent évoluer et doivent être interprétés selon les recommandations et protocoles cliniques applicables.
      </p>
    </main>
  );
}
