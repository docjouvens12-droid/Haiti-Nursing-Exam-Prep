import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const sections = [
  { titre: "1. Anatomie et physiologie", contenu: ["Le cœur est une pompe musculaire à quatre cavités : oreillette droite, ventricule droit, oreillette gauche et ventricule gauche.", "La circulation pulmonaire conduit le sang désoxygéné du ventricule droit vers les poumons. La circulation systémique distribue le sang oxygéné depuis le ventricule gauche vers les tissus.", "Les valves tricuspide, pulmonaire, mitrale et aortique assurent un flux sanguin unidirectionnel. Le débit cardiaque dépend de la fréquence cardiaque et du volume d’éjection systolique."] },
  { titre: "2. Évaluation cardiovasculaire", contenu: ["L’évaluation commence par les symptômes : douleur thoracique, dyspnée, palpitations, fatigue, syncope, œdèmes et diminution de la tolérance à l’effort.", "L’examen infirmier comprend notamment fréquence et rythme cardiaques, pression artérielle, perfusion périphérique, coloration et température cutanées, temps de remplissage capillaire, pouls périphériques, œdèmes et signes de congestion.", "Une douleur thoracique aiguë, une dyspnée sévère, une syncope, une hypotension avec altération de l’état mental ou des signes de mauvaise perfusion nécessitent une évaluation urgente."] },
  { titre: "3. Examens diagnostiques", contenu: ["L’électrocardiogramme évalue l’activité électrique, le rythme et certaines anomalies compatibles avec une ischémie ou un infarctus.", "Les biomarqueurs cardiaques, notamment la troponine, participent à l’évaluation d’une lésion myocardique. L’échocardiographie renseigne sur la structure, les valves et la fonction de pompe.", "D’autres examens peuvent inclure radiographie thoracique, monitorage ambulatoire du rythme, épreuve d’effort, angiographie coronaire et bilans biologiques selon la situation clinique."] },
  { titre: "4. Hypertension artérielle", contenu: ["L’hypertension est une élévation persistante de la pression artérielle. Souvent asymptomatique, elle augmente à long terme le risque cardiovasculaire, cérébrovasculaire et rénal.", "La prise en charge associe mesures de mode de vie et, lorsque indiqué, traitement pharmacologique. L’infirmier surveille la pression artérielle, l’adhésion thérapeutique, les effets indésirables et l’éducation du patient.", "Une pression très élevée associée à des signes d’atteinte aiguë d’organes constitue une situation urgente nécessitant une évaluation médicale immédiate."] },
  { titre: "5. Maladie coronarienne, angine et infarctus", contenu: ["La maladie coronarienne résulte principalement d’un rétrécissement athéroscléreux des artères coronaires. Une réduction du débit sanguin peut provoquer une ischémie myocardique et une douleur angineuse.", "Un syndrome coronarien aigu peut se manifester par douleur ou pression thoracique, dyspnée, sueurs, nausées ou malaise. Certaines personnes, notamment âgées ou diabétiques, peuvent avoir des présentations moins typiques.", "Les priorités sont l’évaluation rapide, le monitorage, l’ECG et l’application des protocoles et prescriptions. L’infirmier surveille douleur, signes vitaux, rythme, perfusion, réponse au traitement et complications."] },
  { titre: "6. Insuffisance cardiaque", contenu: ["L’insuffisance cardiaque apparaît lorsque le cœur ne peut pas assurer un débit suffisant ou le fait au prix de pressions de remplissage élevées.", "L’atteinte gauche est fréquemment associée à dyspnée, orthopnée et congestion pulmonaire. L’atteinte droite favorise œdèmes périphériques, turgescence jugulaire et congestion systémique.", "La surveillance infirmière porte notamment sur respiration, saturation selon indication, poids, bilan hydrique, œdèmes, pression artérielle, fréquence cardiaque, réponse aux traitements et signes d’aggravation."] },
  { titre: "7. Troubles du rythme", contenu: ["Les arythmies résultent d’anomalies de formation ou de conduction de l’influx électrique. Leur importance dépend du rythme, de sa fréquence et surtout de son effet sur la perfusion.", "L’évaluation associe pouls, pression artérielle, état mental, douleur thoracique, dyspnée, syncope et ECG. Une arythmie avec instabilité hémodynamique exige une prise en charge urgente selon les protocoles de réanimation."] },
  { titre: "8. Valvulopathies", contenu: ["Une valve peut être rétrécie (sténose) ou ne pas se fermer correctement (insuffisance/régurgitation), ce qui perturbe le flux sanguin et augmente la charge de travail cardiaque.", "Les manifestations varient selon la valve et la gravité : dyspnée, fatigue, douleur thoracique, syncope, palpitations ou signes d’insuffisance cardiaque. L’échocardiographie joue un rôle central dans l’évaluation."] },
  { titre: "9. Maladies vasculaires et thromboemboliques", contenu: ["L’artériopathie périphérique diminue la perfusion artérielle des membres et peut provoquer douleur à l’effort, diminution des pouls et troubles trophiques. L’insuffisance veineuse favorise œdème et modifications cutanées.", "Une thrombose veineuse profonde peut entraîner une embolie pulmonaire. Une douleur ou un gonflement unilatéral d’un membre associés à des facteurs de risque nécessitent une évaluation appropriée ; une dyspnée brutale ou douleur thoracique peut signaler une embolie pulmonaire."] },
  { titre: "10. Choc cardiogénique", contenu: ["Le choc cardiogénique est une défaillance sévère de la pompe cardiaque entraînant une perfusion tissulaire insuffisante. Il peut survenir notamment après une atteinte myocardique importante.", "Les signes possibles comprennent hypotension, tachycardie, extrémités froides, altération de l’état mental, oligurie et détresse respiratoire. La priorité est la reconnaissance rapide, le support des fonctions vitales et la prise en charge urgente."] },
  { titre: "11. Médicaments cardiovasculaires", contenu: ["Les classes courantes comprennent antihypertenseurs, diurétiques, bêtabloquants, inhibiteurs du système rénine-angiotensine, antiangineux, antiarythmiques, antiplaquettaires, anticoagulants et hypolipémiants.", "Avant et après administration, l’infirmier vérifie les paramètres pertinents : pression artérielle, fréquence cardiaque, fonction rénale, électrolytes, risque de saignement et effets indésirables selon le médicament. Les médicaments sont administrés conformément à la prescription et aux protocoles locaux."] },
  { titre: "12. Prise en charge infirmière", contenu: ["Les priorités reposent sur l’évaluation ABC, la perfusion, les signes vitaux, la douleur, le rythme cardiaque et l’évolution clinique. Toute détérioration doit être reconnue et communiquée rapidement.", "La surveillance comprend également bilan hydrique, poids lorsque pertinent, réponse thérapeutique, tolérance à l’activité, prévention des complications et préparation aux examens ou interventions prescrits."] },
  { titre: "13. Éducation du patient", contenu: ["L’éducation doit être individualisée : prise correcte des médicaments, suivi de la pression artérielle lorsque recommandé, activité adaptée, alimentation équilibrée, réduction du sodium selon indication, arrêt du tabac et suivi médical.", "Le patient doit connaître les signes qui nécessitent une aide urgente, particulièrement douleur thoracique persistante, dyspnée importante, syncope ou signes neurologiques soudains."] },
  { titre: "14. Points clés à retenir", contenu: ["Toujours relier les données cardiovasculaires à la perfusion et à la stabilité hémodynamique.", "Une modification aiguë de l’état mental, une hypotension, une douleur thoracique ou une détresse respiratoire sont des signaux d’alarme.", "Comparer les données dans le temps : tendance de la pression artérielle, poids, œdèmes, bilan hydrique, symptômes et réponse au traitement.", "La sécurité médicamenteuse et la reconnaissance précoce de la détérioration sont des responsabilités infirmières majeures."] },
];

export default async function CardiovasculairePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/connexion");

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "26px 18px 90px" }}>
      <Link href="/cours-revisions" style={{ color: "#2563eb", fontWeight: 800, fontSize: 14 }}>← Cours & Révisions</Link>
      <header style={{ margin: "18px 0 24px", background: "linear-gradient(135deg,#071b4f,#1748b7)", color: "white", borderRadius: 22, padding: "28px 24px" }}>
        <div style={{ opacity: .8, fontSize: 13, fontWeight: 800 }}>SOINS INFIRMIERS MÉDICO-CHIRURGICAUX</div>
        <h1 style={{ margin: "7px 0 8px", fontSize: 34 }}>Cardiovasculaire</h1>
        <p style={{ margin: 0, lineHeight: 1.6, opacity: .92 }}>Module de révision : compréhension du système cardiovasculaire, principales pathologies, surveillance et prise en charge infirmière.</p>
      </header>

      <aside style={{ background: "#f4f7fc", border: "1px solid #e0e8f5", borderRadius: 16, padding: 18, marginBottom: 20 }}>
        <strong style={{ color: "#0b1f59" }}>Objectifs du module</strong>
        <p style={{ margin: "7px 0 0", color: "#53627b", lineHeight: 1.6 }}>Reconnaître les manifestations cardiovasculaires importantes, comprendre les mécanismes essentiels, surveiller le patient et identifier rapidement les situations nécessitant une intervention urgente.</p>
      </aside>

      <div style={{ display: "grid", gap: 14 }}>
        {sections.map((section) => (
          <section key={section.titre} style={{ background: "white", border: "1px solid #e4eaf3", borderRadius: 17, padding: "20px 20px 16px", boxShadow: "0 5px 18px rgba(11,31,89,.045)" }}>
            <h2 style={{ color: "#0b1f59", fontSize: 20, margin: "0 0 12px" }}>{section.titre}</h2>
            {section.contenu.map((p) => <p key={p} style={{ color: "#334155", lineHeight: 1.72, margin: "0 0 10px" }}>{p}</p>)}
          </section>
        ))}
      </div>

      <p style={{ marginTop: 22, color: "#718096", fontSize: 12, lineHeight: 1.55 }}>Contenu éducatif de révision. Il complète l’enseignement et les protocoles de l’établissement de formation et ne remplace pas les directives cliniques locales.</p>
    </main>
  );
}
