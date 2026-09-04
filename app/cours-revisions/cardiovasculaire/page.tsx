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

const angineEnrichie: PathologieCardiovasculaire = {
  nom: "Angine de poitrine",
  definition: "L’angine de poitrine est un syndrome clinique provoqué par une ischémie myocardique transitoire : l’apport en oxygène au muscle cardiaque devient momentanément insuffisant par rapport à ses besoins, sans preuve de nécrose myocardique aiguë. Elle se manifeste le plus souvent par une gêne, une pression ou un serrement thoracique. L’angine stable suit généralement un profil prévisible, alors qu’une douleur nouvelle, plus fréquente, plus intense, plus prolongée ou survenant au repos doit faire rechercher rapidement un syndrome coronarien aigu.",
  physiopathologie: "Dans l’angine stable, une plaque athéroscléreuse réduit la réserve de débit d’une artère coronaire. Au repos, le débit peut rester suffisant, mais l’effort, le stress, la tachycardie ou une augmentation de la pression artérielle accroissent les besoins du myocarde en oxygène. Lorsque la circulation coronaire ne peut pas répondre à cette demande, une ischémie réversible apparaît et provoque les symptômes. Dans les formes instables, une modification aiguë de la plaque avec activation plaquettaire et thrombose partielle peut réduire brutalement le débit coronaire ; cette situation appartient au spectre des syndromes coronariens aigus et nécessite une évaluation urgente.",
  risques: "Les facteurs de risque sont principalement ceux de l’athérosclérose et de la maladie coronarienne : tabagisme, hypertension artérielle, dyslipidémie, diabète, surpoids ou obésité, sédentarité, maladie rénale chronique, âge et antécédents familiaux de maladie cardiovasculaire précoce. Chez une personne ayant déjà une maladie coronarienne, l’effort important, le froid, un repas copieux, le stress émotionnel, la tachycardie ou une anémie peuvent favoriser un déséquilibre entre apport et demande en oxygène et déclencher des symptômes.",
  manifestations: "Le patient décrit souvent une pression, un serrement, une lourdeur, une brûlure ou un inconfort rétrosternal plutôt qu’une douleur ponctuelle. La gêne peut irradier vers un ou les deux bras, les épaules, le cou, la mâchoire, le dos ou l’épigastre. Elle peut s’accompagner de dyspnée, sueurs, nausées, fatigue ou malaise. Dans l’angine stable, les symptômes sont généralement provoqués par un niveau d’effort relativement prévisible et s’améliorent avec le repos ou le traitement prescrit. Les personnes âgées, diabétiques ou certaines femmes peuvent présenter des symptômes moins typiques, notamment dyspnée ou fatigue sans douleur thoracique classique.",
  examens: "L’évaluation commence par une histoire précise des symptômes et des facteurs de risque, un examen cardiovasculaire et un ECG. Lorsqu’un syndrome coronarien aigu est possible, l’ECG doit être obtenu rapidement et les troponines cardiaques sont utilisées pour rechercher une lésion myocardique. Un ECG normal au repos n’exclut pas une ischémie. Chez un patient stable, une épreuve d’effort, une imagerie de stress ou une angiographie coronaire par tomodensitométrie peut être utilisée selon le profil clinique. Une coronarographie invasive est indiquée dans certaines situations à haut risque ou lorsque la revascularisation est envisagée.",
  traitement: "Pendant un épisode compatible avec une angine stable connue, l’effort est interrompu et le patient suit le plan thérapeutique prescrit, qui peut comprendre de la nitroglycérine. Le traitement de fond vise à réduire les symptômes et le risque cardiovasculaire : contrôle des facteurs de risque, statine, traitement antiplaquettaire et médicaments antiangineux selon les indications individuelles. Les bêtabloquants, inhibiteurs calciques ou nitrates peuvent être utilisés selon le contexte. Une angioplastie avec stent ou un pontage coronarien peut être indiqué lorsque les symptômes persistent malgré un traitement approprié ou selon l’anatomie et le niveau de risque.",
  soins: "Interrompre immédiatement l’activité et installer le patient au repos. Évaluer la douleur de façon structurée : début, localisation, caractère, intensité, irradiation, durée, facteurs déclenchants et soulageants ainsi que symptômes associés. Mesurer les signes vitaux, évaluer la perfusion et la respiration, et obtenir un ECG rapidement lorsqu’un syndrome aigu est possible. Administrer les médicaments prescrits en vérifiant leurs contre-indications et surveiller la réponse clinique. Avant l’administration d’un nitrate, contrôler notamment la pression artérielle et rechercher l’utilisation récente de médicaments inhibiteurs de la phosphodiestérase-5 lorsqu’elle est pertinente, en raison du risque d’hypotension sévère. Toute modification du profil habituel de l’angine doit entraîner une escalade rapide de la prise en charge.",
  complications: "Une angine stable peut témoigner d’une maladie coronarienne significative et évoluer avec le temps. Une rupture de plaque et une thrombose peuvent transformer un tableau stable en syndrome coronarien aigu, avec risque d’infarctus du myocarde. Les complications de la maladie coronaire sous-jacente comprennent également arythmies, insuffisance cardiaque, choc cardiogénique et mort subite. Une aggravation récente des symptômes ne doit donc pas être considérée comme une simple augmentation de l’angine habituelle sans réévaluation.",
  education: "Aider le patient à reconnaître son profil habituel de symptômes et ses facteurs déclenchants, tout en insistant sur le fait qu’un changement de ce profil constitue un signal d’alarme. Expliquer comment utiliser la nitroglycérine exactement selon la prescription et comment la conserver correctement. Renforcer l’adhésion aux traitements de prévention secondaire, l’arrêt du tabac, l’activité physique adaptée, une alimentation cardioprotectrice et le contrôle de la pression, du diabète et des lipides. Une douleur ou pression thoracique nouvelle, sévère ou persistante, surtout au repos ou accompagnée de dyspnée, sueurs, syncope ou malaise important, nécessite l’activation rapide des services d’urgence.",
  points: "L’angine correspond à une ischémie myocardique transitoire et constitue un signal de maladie coronarienne. L’angine stable présente habituellement un schéma reproductible lié à l’effort ; une douleur nouvelle, croissante, prolongée ou au repos doit faire suspecter un syndrome coronarien aigu. Un ECG normal n’exclut pas l’ischémie. Pour l’infirmier, la priorité est d’identifier rapidement les signes d’instabilité et de ne pas retarder l’évaluation urgente."
};

const prioritesInfirmieres: Partial<Record<number, string>> = {
  0: "Devant une pression très élevée, évaluer immédiatement le patient et rechercher des signes d’atteinte aiguë d’organe. La gravité dépend du contexte clinique et de l’atteinte d’organe, pas uniquement du chiffre affiché sur le tensiomètre.",
  1: "Devant une douleur ou une pression thoracique nouvelle, persistante, survenant au repos ou associée à dyspnée, sueurs, nausées, malaise ou syncope, considérer d’abord un syndrome coronarien aigu. Interrompre l’effort, évaluer rapidement les signes vitaux et la perfusion, obtenir un ECG selon le protocole, maintenir une surveillance rapprochée et alerter sans retarder la prise en charge urgente.",
  2: "Devant une douleur thoracique, interrompre l’effort et déterminer immédiatement si elle correspond au profil habituel d’une angine stable ou si elle est nouvelle, plus intense, plus longue, plus fréquente ou présente au repos. En cas de changement ou de signes d’instabilité, traiter la situation comme un possible syndrome coronarien aigu : évaluation rapide, signes vitaux, ECG selon protocole, surveillance et alerte urgente."
};

export default async function CardiovasculairePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/connexion");

  const pathologies = pathologiesCardiovasculaires.map((pathologie, index) => index === 2 ? angineEnrichie : pathologie);

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
        {pathologies.map((pathologie, index) => (
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
