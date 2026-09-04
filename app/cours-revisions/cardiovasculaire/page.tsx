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

const infarctusEnrichi: PathologieCardiovasculaire = {
  nom: "Infarctus aigu du myocarde",
  definition: "L’infarctus aigu du myocarde (IAM) correspond à une nécrose d’une partie du muscle cardiaque provoquée par une ischémie aiguë prolongée. Dans la majorité des cas, une plaque d’athérome coronaire se rompt ou s’érode, déclenchant la formation d’un thrombus qui réduit fortement ou interrompt le flux sanguin. L’IAM fait partie des syndromes coronariens aigus et constitue une urgence vitale : plus la reperfusion est tardive, plus la quantité de myocarde définitivement lésée peut être importante.",
  physiopathologie: "Après rupture ou érosion d’une plaque, les plaquettes s’activent et un thrombus se forme dans l’artère coronaire. La réduction du débit provoque d’abord une ischémie réversible, puis une lésion cellulaire irréversible lorsque l’occlusion persiste. L’étendue de la nécrose dépend notamment de l’artère atteinte, de la durée de l’occlusion, de la circulation collatérale et des besoins métaboliques du myocarde. Un infarctus avec sus-décalage persistant du segment ST évoque généralement une occlusion coronaire aiguë nécessitant une stratégie de reperfusion urgente, tandis qu’un infarctus sans sus-décalage peut résulter d’une obstruction partielle ou intermittente mais reste une urgence cardiovasculaire.",
  risques: "Les principaux facteurs de risque sont ceux de la maladie coronarienne : tabagisme, hypertension artérielle, dyslipidémie, diabète, âge, antécédents familiaux de maladie cardiovasculaire précoce, obésité, sédentarité et maladie rénale chronique. Un antécédent de maladie coronarienne, d’angine, de stent ou d’infarctus augmente également le risque. Certains infarctus peuvent toutefois survenir par d’autres mécanismes, notamment déséquilibre majeur entre apport et demande en oxygène, embolie coronaire, dissection coronaire spontanée ou vasospasme.",
  manifestations: "La présentation classique est une douleur, une pression, un serrement ou une lourdeur thoracique prolongée, souvent rétrosternale, pouvant irradier vers les bras, les épaules, la mâchoire, le cou, le dos ou l’épigastre. Des sueurs froides, dyspnée, nausées, vomissements, faiblesse, anxiété, pâleur, palpitations ou syncope peuvent accompagner l’épisode. Certaines personnes, notamment âgées ou diabétiques, peuvent présenter une dyspnée, une fatigue extrême, un malaise ou une confusion sans douleur thoracique typique. Toute suspicion clinique impose une évaluation urgente.",
  examens: "L’ECG 12 dérivations doit être obtenu rapidement et répété si les symptômes persistent ou évoluent. Les troponines cardiaques sont les biomarqueurs essentiels pour détecter une lésion myocardique et doivent être interprétées avec le contexte clinique et leur évolution dans le temps. L’échocardiographie peut évaluer la fonction ventriculaire et rechercher certaines complications. La coronarographie identifie la lésion responsable et permet une intervention coronaire percutanée lorsque cela est indiqué. D’autres examens biologiques évaluent notamment fonction rénale, électrolytes, glycémie, hémogramme et profil lipidique.",
  traitement: "Le traitement vise à restaurer la perfusion, limiter l’extension de la nécrose et prévenir les complications. Lorsqu’une occlusion aiguë nécessitant une reperfusion est identifiée, l’intervention coronaire percutanée est privilégiée lorsqu’elle peut être réalisée rapidement ; une fibrinolyse peut être envisagée dans certaines situations lorsque l’angioplastie n’est pas disponible dans les délais appropriés et qu’il n’existe pas de contre-indication. Le traitement peut inclure antiplaquettaires, anticoagulation, statine, nitrates, bêtabloquants ou autres agents selon le type d’infarctus, la pression artérielle, la fréquence cardiaque, le risque hémorragique et les protocoles. L’oxygène n’est pas systématique : il est utilisé lorsqu’il existe une hypoxémie ou une autre indication clinique.",
  soins: "Reconnaître immédiatement les signes d’un syndrome coronarien aigu, arrêter l’effort et organiser une prise en charge urgente. Évaluer ABC, douleur, signes vitaux, saturation, perfusion périphérique et état neurologique ; mettre en place un monitorage cardiaque et obtenir l’ECG selon le protocole. Préparer l’accès veineux, les prélèvements et les traitements prescrits sans retarder une éventuelle reperfusion. Surveiller étroitement l’apparition d’arythmies, d’hypotension, de dyspnée, de crépitants, d’altération de la conscience ou d’oligurie. Après angioplastie, surveiller le site d’abord vasculaire, les saignements, l’hématome, les pouls et la perfusion distale. Réévaluer régulièrement la douleur et la réponse aux interventions.",
  complications: "Les complications précoces comprennent arythmies ventriculaires, blocs de conduction, insuffisance cardiaque aiguë, œdème pulmonaire, choc cardiogénique et arrêt cardiaque. Des complications mécaniques peuvent survenir, notamment rupture du septum interventriculaire, rupture d’un muscle papillaire avec insuffisance mitrale aiguë ou rupture de la paroi libre. D’autres complications comprennent péricardite, thrombus ventriculaire, embolies, anévrisme ventriculaire et remodelage conduisant à une insuffisance cardiaque chronique.",
  education: "Après stabilisation, expliquer l’importance de la prévention secondaire : prise régulière des médicaments, arrêt du tabac, contrôle de la pression artérielle, du diabète et des lipides, activité physique progressive et réadaptation cardiaque selon le plan de soins. Après pose d’un stent, insister sur le fait que les antiplaquettaires prescrits ne doivent pas être interrompus sans avis spécialisé. Enseigner au patient et à sa famille à reconnaître immédiatement une récidive possible : douleur ou pression thoracique, dyspnée soudaine, sueurs froides, syncope ou malaise important, et à activer les services d’urgence plutôt que d’attendre une amélioration spontanée.",
  points: "L’infarctus du myocarde est une urgence où le temps compte : reconnaître rapidement le tableau, obtenir un ECG et organiser la reperfusion lorsque indiquée peut limiter la perte myocardique. Les troponines confirment la lésion myocardique mais ne doivent pas retarder les décisions urgentes basées sur l’ECG et l’état clinique. La surveillance infirmière vise autant la douleur que les complications potentiellement mortelles : arythmies, insuffisance cardiaque et choc."
};

const prioritesInfirmieres: Partial<Record<number, string>> = {
  0: "Devant une pression très élevée, évaluer immédiatement le patient et rechercher des signes d’atteinte aiguë d’organe. La gravité dépend du contexte clinique et de l’atteinte d’organe, pas uniquement du chiffre affiché sur le tensiomètre.",
  1: "Devant une douleur ou une pression thoracique nouvelle, persistante, survenant au repos ou associée à dyspnée, sueurs, nausées, malaise ou syncope, considérer d’abord un syndrome coronarien aigu. Interrompre l’effort, évaluer rapidement les signes vitaux et la perfusion, obtenir un ECG selon le protocole, maintenir une surveillance rapprochée et alerter sans retarder la prise en charge urgente.",
  2: "Devant une douleur thoracique, interrompre l’effort et déterminer immédiatement si elle correspond au profil habituel d’une angine stable ou si elle est nouvelle, plus intense, plus longue, plus fréquente ou présente au repos. En cas de changement ou de signes d’instabilité, traiter la situation comme un possible syndrome coronarien aigu : évaluation rapide, signes vitaux, ECG selon protocole, surveillance et alerte urgente.",
  3: "Devant un infarctus suspecté, la priorité est de reconnaître l’urgence et de ne pas perdre de temps : évaluer ABC et signes vitaux, mettre le patient au repos, obtenir rapidement l’ECG, installer le monitorage, préparer l’accès veineux et les traitements prescrits, puis organiser sans délai la stratégie de reperfusion lorsqu’elle est indiquée. Toute arythmie, hypotension, détresse respiratoire, altération de conscience ou signe de choc impose une escalade immédiate."
};

export default async function CardiovasculairePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/connexion");

  const pathologies = pathologiesCardiovasculaires.map((pathologie, index) => {
    if (index === 2) return angineEnrichie;
    if (index === 3) return infarctusEnrichi;
    return pathologie;
  });

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
