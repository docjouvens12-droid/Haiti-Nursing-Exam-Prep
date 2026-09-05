import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "./cours-revisions.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const domaines = [
  { titre: "Soins infirmiers médico-chirurgicaux", description: "Révision structurée des principaux systèmes, pathologies de l’adulte, transfusion, musculosquelettique, oncologie, infections systémiques, équilibres hydro-électrolytiques et soins périopératoires.", modules: ["Cardiovasculaire","Respiratoire","Neurologie","Gastro-intestinal","Rénal","Endocrinologie","Hématologie","Transfusion sanguine et sécurité transfusionnelle","Musculosquelettique et rhumatologie","Oncologie et soins infirmiers en cancérologie","Sepsis et infections systémiques","Équilibre hydro-électrolytique et acido-basique","Soins périopératoires et complications chirurgicales"] },
  { titre: "Santé maternelle, obstétrique et néonatale", description: "Grossesse, travail, accouchement, postpartum et soins du nouveau-né.", modules: ["Grossesse","Travail et accouchement","Postpartum","Nouveau-né"] },
  { titre: "Soins infirmiers pédiatriques", description: "Croissance, développement et prise en charge des principales affections pédiatriques.", modules: ["Croissance et développement","Nouveau-né","Maladies pédiatriques","Urgences pédiatriques"] },
  { titre: "Pharmacologie", description: "Classes médicamenteuses, surveillance, sécurité et administration infirmière.", modules: ["Principes de pharmacologie","Médicaments cardiovasculaires","Anti-infectieux","Analgésiques","Médicaments respiratoires","Endocrinologie et diabète","Gastro-intestinal et rénal","Neurologie et psychiatrie","Pharmacologie obstétricale","Médicaments d’urgence et antidotes","Vaccins et immunologie"] },
  { titre: "Santé mentale et psychiatrie", description: "Troubles psychiatriques, communication thérapeutique, sécurité et interventions infirmières.", modules: ["Évaluation psychiatrique","Troubles de l’humeur","Psychoses","Anxiété et stress","Troubles de la personnalité","Addictions et sevrage","Troubles neurocognitifs","Troubles alimentaires","Urgences psychiatriques","Psychiatrie de l’enfant et de l’adolescent","Éthique, droits et cadre légal"] },
  { titre: "Santé communautaire et santé publique", description: "Prévention, épidémiologie, vaccination, maladies transmissibles, nutrition et suivi communautaire des maladies chroniques.", modules: ["Prévention et promotion","Épidémiologie et surveillance","Santé familiale et soins à domicile","Éducation sanitaire et communication","Maladies transmissibles et environnement","Vaccination et chaîne du froid","VIH/SIDA et IST","Tuberculose en communauté","Nutrition communautaire","Maladies chroniques en communauté","Catastrophes et populations vulnérables"] },
  { titre: "Fondements des soins infirmiers", description: "Démarche clinique, sécurité, médicaments, perfusions, prélèvements, mobilité, soins de base et continuité des soins.", modules: ["Démarche de soins","Sécurité du patient","Hygiène, asepsie et infection","Soins de base et autonomie","Constantes vitales et douleur","Documentation, transmission et éthique","Administration sécuritaire des médicaments","Thérapie IV, perfusions et équilibre hydrique","Prélèvements et examens diagnostiques","Mobilité, positionnement et transfert","Admission, transfert, sortie et continuité"] },
  { titre: "Urgences et soins critiques", description: "Reconnaissance rapide, triage, réanimation, intoxications, urgences obstétricales et pédiatriques, afflux massif et soins critiques.", modules: ["Évaluation ABCDE et triage","État de choc et sepsis","Urgences respiratoires","Urgences cardiovasculaires et arrêt cardiaque","Urgences neurologiques et métaboliques","Traumatismes, brûlures et hémorragies","Surveillance du patient critique et transfert","Intoxications et surdosages","Urgences obstétricales","Urgences pédiatriques et néonatales","Triage avancé et afflux massif de victimes","Réanimation et soins critiques approfondis"] },
  { titre: "Modules transversaux", description: "Compétences essentielles applicables à plusieurs domaines cliniques et à la sécurité des soins.", modules: ["Sécurité médicamenteuse"] },
];

const medico: Record<string,string> = { Cardiovasculaire:"/cours-revisions/cardiovasculaire", Respiratoire:"/cours-revisions/respiratoire", Neurologie:"/cours-revisions/neurologie", "Gastro-intestinal":"/cours-revisions/gastro-intestinal", Rénal:"/cours-revisions/renal", Endocrinologie:"/cours-revisions/endocrinologie", Hématologie:"/cours-revisions/hematologie", "Transfusion sanguine et sécurité transfusionnelle":"/cours-revisions/transfusion-securite", "Musculosquelettique et rhumatologie":"/cours-revisions/musculosquelettique-rhumatologie", "Oncologie et soins infirmiers en cancérologie":"/cours-revisions/oncologie", "Sepsis et infections systémiques":"/cours-revisions/sepsis-infections-systemiques", "Équilibre hydro-électrolytique et acido-basique":"/cours-revisions/equilibre-hydroelectrolytique", "Soins périopératoires et complications chirurgicales":"/cours-revisions/perioperatoire" };
const maternite: Record<string,string> = { Grossesse:"/cours-revisions/maternite/grossesse", "Travail et accouchement":"/cours-revisions/maternite/travail-accouchement", Postpartum:"/cours-revisions/maternite/postpartum", "Nouveau-né":"/cours-revisions/maternite/nouveau-ne" };
const pediatrie: Record<string,string> = { "Croissance et développement":"/cours-revisions/pediatrie/croissance-developpement", "Nouveau-né":"/cours-revisions/pediatrie/nouveau-ne", "Maladies pédiatriques":"/cours-revisions/pediatrie/maladies-pediatriques", "Urgences pédiatriques":"/cours-revisions/pediatrie/urgences-pediatriques" };
const pharmacologie: Record<string,string> = { "Principes de pharmacologie":"/cours-revisions/pharmacologie/principes", "Médicaments cardiovasculaires":"/cours-revisions/pharmacologie/cardiovasculaires", "Anti-infectieux":"/cours-revisions/pharmacologie/anti-infectieux", "Analgésiques":"/cours-revisions/pharmacologie/analgesiques", "Médicaments respiratoires":"/cours-revisions/pharmacologie/respiratoire", "Endocrinologie et diabète":"/cours-revisions/pharmacologie/endocriniens", "Gastro-intestinal et rénal":"/cours-revisions/pharmacologie/gastro-intestinaux", "Neurologie et psychiatrie":"/cours-revisions/pharmacologie/neuro-psychiatriques", "Pharmacologie obstétricale":"/cours-revisions/pharmacologie/obstetricaux", "Médicaments d’urgence et antidotes":"/cours-revisions/pharmacologie/urgence", "Vaccins et immunologie":"/cours-revisions/pharmacologie/vaccins" };
const psy: Record<string,string> = { "Évaluation psychiatrique":"/cours-revisions/sante-mentale/evaluation", "Troubles de l’humeur":"/cours-revisions/sante-mentale/humeur", Psychoses:"/cours-revisions/sante-mentale/psychoses", "Anxiété et stress":"/cours-revisions/sante-mentale/anxiete-stress", "Troubles de la personnalité":"/cours-revisions/sante-mentale/personnalite", "Addictions et sevrage":"/cours-revisions/sante-mentale/addictions", "Troubles neurocognitifs":"/cours-revisions/sante-mentale/neurocognitifs", "Troubles alimentaires":"/cours-revisions/sante-mentale/alimentaires", "Urgences psychiatriques":"/cours-revisions/sante-mentale/urgences-psy", "Psychiatrie de l’enfant et de l’adolescent":"/cours-revisions/sante-mentale/enfant-adolescent", "Éthique, droits et cadre légal":"/cours-revisions/sante-mentale/ethique-legal" };
const communautaire: Record<string,string> = { "Prévention et promotion":"/cours-revisions/sante-communautaire/prevention", "Épidémiologie et surveillance":"/cours-revisions/sante-communautaire/epidemiologie", "Santé familiale et soins à domicile":"/cours-revisions/sante-communautaire/famille", "Éducation sanitaire et communication":"/cours-revisions/sante-communautaire/education", "Maladies transmissibles et environnement":"/cours-revisions/sante-communautaire/infectieuses", "Vaccination et chaîne du froid":"/cours-revisions/sante-communautaire/vaccination", "VIH/SIDA et IST":"/cours-revisions/sante-communautaire/vih-ist", "Tuberculose en communauté":"/cours-revisions/sante-communautaire/tuberculose", "Nutrition communautaire":"/cours-revisions/sante-communautaire/nutrition", "Maladies chroniques en communauté":"/cours-revisions/sante-communautaire/chroniques", "Catastrophes et populations vulnérables":"/cours-revisions/sante-communautaire/catastrophes" };
const fondements: Record<string,string> = { "Démarche de soins":"/cours-revisions/fondements/demarche-soins", "Sécurité du patient":"/cours-revisions/fondements/securite", "Hygiène, asepsie et infection":"/cours-revisions/fondements/hygiene-infection", "Soins de base et autonomie":"/cours-revisions/fondements/soins-base", "Constantes vitales et douleur":"/cours-revisions/fondements/constantes-douleur", "Documentation, transmission et éthique":"/cours-revisions/fondements/documentation", "Administration sécuritaire des médicaments":"/cours-revisions/fondements/medicaments", "Thérapie IV, perfusions et équilibre hydrique":"/cours-revisions/fondements/perfusion-hydrique", "Prélèvements et examens diagnostiques":"/cours-revisions/fondements/prelevements", "Mobilité, positionnement et transfert":"/cours-revisions/fondements/mobilite-transferts", "Admission, transfert, sortie et continuité":"/cours-revisions/fondements/transitions-soins" };
const urgences: Record<string,string> = { "Évaluation ABCDE et triage":"/cours-revisions/urgences/abcde", "État de choc et sepsis":"/cours-revisions/urgences/choc", "Urgences respiratoires":"/cours-revisions/urgences/respiratoires", "Urgences cardiovasculaires et arrêt cardiaque":"/cours-revisions/urgences/cardiovasculaires", "Urgences neurologiques et métaboliques":"/cours-revisions/urgences/neurologiques", "Traumatismes, brûlures et hémorragies":"/cours-revisions/urgences/trauma", "Surveillance du patient critique et transfert":"/cours-revisions/urgences/soins-critiques", "Intoxications et surdosages":"/cours-revisions/urgences/intoxications", "Urgences obstétricales":"/cours-revisions/urgences/obstetricales", "Urgences pédiatriques et néonatales":"/cours-revisions/urgences/pediatriques-neonatales", "Triage avancé et afflux massif de victimes":"/cours-revisions/urgences/afflux-massif", "Réanimation et soins critiques approfondis":"/cours-revisions/urgences/soins-critiques-avances" };
const transversal: Record<string,string> = { "Sécurité médicamenteuse":"/cours-revisions/securite-medicamenteuse" };

const destinations = [medico, maternite, pediatrie, pharmacologie, psy, communautaire, fondements, urgences, transversal];
const totalModules = domaines.reduce((sum, domaine) => sum + domaine.modules.length, 0);

type ProgressRow = { module_key: string; status: "a_commencer" | "en_cours" | "termine"; progress_percent: number };

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ? String(data.claims.sub) : null;
  if (!userId) redirect("/connexion");

  const { data: progressRows } = await supabase
    .from("learning_module_progress")
    .select("module_key,status,progress_percent")
    .eq("user_id", userId);

  const progressByKey = new Map<string, ProgressRow>();
  for (const row of (progressRows ?? []) as ProgressRow[]) progressByKey.set(row.module_key, row);

  const startedCount = [...progressByKey.values()].filter((row) => row.status === "en_cours").length;
  const completedCount = [...progressByKey.values()].filter((row) => row.status === "termine").length;

  return (
    <main className="courses-shell">
      <section className="courses-hero">
        <div className="courses-eyebrow">Bibliothèque d’apprentissage</div>
        <h1>Cours & Révisions</h1>
        <p>Étudiez les notions essentielles des sciences infirmières grâce à des modules structurés, avec une progression enregistrée automatiquement pendant votre lecture.</p>
        <div className="courses-summary">
          <div><strong>{totalModules}</strong><span>modules disponibles</span></div>
          <div><strong>{startedCount}</strong><span>modules en cours</span></div>
          <div><strong>{completedCount}</strong><span>modules terminés</span></div>
        </div>
      </section>

      <div className="courses-domain-list">
        {domaines.map((domaine, index) => (
          <section className={`courses-domain domain-${index}`} key={domaine.titre}>
            <div className="courses-domain-head">
              <div><h2>{domaine.titre}</h2><p>{domaine.description}</p></div>
              <span className="courses-domain-count">{domaine.modules.length} module{domaine.modules.length > 1 ? "s" : ""}</span>
            </div>

            <div className="courses-module-grid">
              {domaine.modules.map((module) => {
                const href = destinations[index]?.[module];
                const hasQuiz = index === 3;
                if (!href) return null;
                const progress = progressByKey.get(href);
                const percent = progress?.progress_percent ?? 0;
                const statusLabel = progress?.status === "termine" ? "Terminé" : progress?.status === "en_cours" ? "En cours" : "À commencer";
                const actionLabel = progress?.status === "termine" ? "Revoir" : progress?.status === "en_cours" ? "Reprendre" : "Commencer";
                return (
                  <a className={`course-module-card ${progress?.status ?? "a_commencer"}`} href={href} key={module}>
                    <span className="course-module-icon">{index === 3 ? "Rx" : index === 7 ? "+" : "▤"}</span>
                    <span className="course-module-copy">
                      <strong>{module}</strong>
                      <span className="course-module-meta">
                        <span className={`course-status course-status-${progress?.status ?? "a_commencer"}`}>{statusLabel}</span>
                        {hasQuiz && <span className="course-quiz">Mini-évaluation</span>}
                      </span>
                      <span className="course-progress-line"><i style={{ width: `${percent}%` }} /><b>{percent}%</b></span>
                    </span>
                    <span className="course-module-action">{actionLabel} →</span>
                  </a>
                );
              })}
            </div>

            {index === 3 && <div className="courses-note"><strong>Pharmacologie :</strong> chaque module comprend un cours structuré et une mini-évaluation dédiée de 15 questions.</div>}
          </section>
        ))}
      </div>
    </main>
  );
}
