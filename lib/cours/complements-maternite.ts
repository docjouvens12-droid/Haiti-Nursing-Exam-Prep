import type { SujetMaternite } from "@/lib/cours/maternite";

const edu = "Expliquer les signes d’alarme, vérifier la compréhension et préciser quand consulter en urgence.";

export const complementsMaternite: Record<string, SujetMaternite[]> = {
  grossesse: [
    {
      nom: "Anémie pendant la grossesse",
      definition: "Diminution de la concentration d’hémoglobine pendant la grossesse, souvent liée à une carence en fer mais pouvant avoir d’autres causes.",
      physiopathologie: "L’expansion du volume plasmatique provoque une hémodilution physiologique. Une insuffisance des réserves ou apports en fer, des pertes, infections ou autres déficits peuvent entraîner une anémie pathologique et réduire le transport d’oxygène.",
      risques: "Carence nutritionnelle, grossesses rapprochées ou multiples, pertes sanguines, parasitoses ou infections selon le contexte, maladies hématologiques et absence de supplémentation adaptée.",
      manifestations: "Fatigue, pâleur, faiblesse, vertiges, dyspnée d’effort, tachycardie; une anémie légère peut être asymptomatique.",
      examens: "Hémogramme; bilan martial et autres examens selon la sévérité, les indices érythrocytaires et la cause suspectée.",
      traitement: "Prévention et traitement par fer et acide folique selon recommandations et bilan; rechercher et traiter la cause. Les formes sévères nécessitent une évaluation médicale rapide et une stratégie individualisée.",
      soins: "Évaluer symptômes, tolérance au traitement, alimentation et adhésion; surveiller l’hémoglobine selon le suivi et rechercher saignement ou signes d’intolérance clinique.",
      complications: "Mauvaise tolérance aux pertes sanguines, fatigue importante, prématurité ou faible poids de naissance selon cause et sévérité.",
      education: edu + " Expliquer les aliments riches en fer et la prise correcte des suppléments prescrits.",
      points: "La grossesse peut produire une hémodilution physiologique, mais une anémie significative doit être recherchée, caractérisée et traitée.",
      priorite: "Devant dyspnée au repos, syncope, tachycardie importante, saignement ou signes d’instabilité, évaluer immédiatement la mère et rechercher une cause urgente plutôt que d’attribuer les symptômes à la grossesse."
    },
    {
      nom: "Grossesse extra-utérine et hémorragie du début de grossesse",
      definition: "Implantation d’une grossesse hors de la cavité utérine, le plus souvent tubaire, pouvant se rompre et provoquer une hémorragie interne grave.",
      physiopathologie: "La croissance trophoblastique dans un site non adapté peut éroder les tissus et vaisseaux. La rupture tubaire peut entraîner une hémorragie intrapéritonéale et un choc.",
      risques: "Antécédent de grossesse extra-utérine, atteinte ou chirurgie tubaire, infection pelvienne antérieure, procréation assistée et tabagisme; elle peut aussi survenir sans facteur connu.",
      manifestations: "Retard de règles ou test de grossesse positif avec douleur pelvienne et/ou saignement. Douleur intense, douleur à l’épaule, malaise, syncope, pâleur ou hypotension évoquent une rupture avec hémorragie.",
      examens: "Évaluation clinique et hémodynamique, dosage sériel de β-hCG selon situation et échographie transvaginale; groupe/Rh et bilan sanguin si saignement.",
      traitement: "Prise en charge expectative, médicamenteuse ou chirurgicale selon stabilité, localisation, évolution et protocole. Rupture ou instabilité impose une prise en charge chirurgicale urgente.",
      soins: "Évaluer douleur, pertes, constantes et perfusion; établir un accès IV si urgence, préparer bilans et intervention, apporter soutien émotionnel et respecter les procédures liées au Rh si indiquées.",
      complications: "Hémorragie massive, choc hypovolémique, perte tubaire, baisse de fertilité et décès maternel.",
      education: edu + " Toute douleur importante, syncope ou aggravation du saignement impose une consultation immédiate.",
      points: "Chez une personne enceinte présentant douleur abdominale et saignement, une grossesse extra-utérine doit être exclue rapidement.",
      priorite: "Si douleur aiguë avec signes de choc ou syncope: ABC, accès IV, alerte obstétrico-chirurgicale immédiate et préparation à la prise en charge de l’hémorragie."
    },
    {
      nom: "Rupture prématurée des membranes et risque de prématurité",
      definition: "Rupture des membranes avant le début du travail; lorsqu’elle survient avant 37 semaines, elle expose particulièrement à la prématurité et à l’infection.",
      physiopathologie: "La rupture de la barrière amniotique favorise la perte de liquide, l’ascension de microorganismes et peut déclencher le travail; une présentation haute augmente aussi le risque de procidence du cordon.",
      risques: "Antécédent de prématurité ou rupture prématurée, infection génitale, grossesse multiple, anomalies cervicales ou utérines et tabagisme.",
      manifestations: "Écoulement vaginal aqueux continu ou intermittent; fièvre, douleur utérine, liquide malodorant ou tachycardie maternelle/fœtale font suspecter une infection.",
      examens: "Confirmer la rupture selon méthodes et protocole obstétrical, évaluer terme, température et signes infectieux, quantité/aspect du liquide, présentation et bien-être fœtal. Limiter les examens vaginaux digitaux non nécessaires.",
      traitement: "Conduite selon terme, infection, travail et état fœtal; peut inclure surveillance, antibiotiques, corticothérapie anténatale et naissance lorsque indiquée selon protocole.",
      soins: "Noter heure, couleur, odeur et quantité du liquide; surveiller température, contractions et rythme fœtal, appliquer prévention de l’infection et préparer transfert/naissance si complication.",
      complications: "Chorioamniotite, sepsis maternel ou néonatal, prématurité, procidence du cordon, décollement placentaire et détresse fœtale.",
      education: edu + " Signaler fièvre, liquide malodorant, saignement, contractions ou diminution des mouvements fœtaux.",
      points: "Après rupture des membranes, la surveillance porte autant sur l’infection que sur le bien-être fœtal et le risque de prématurité.",
      priorite: "Après rupture suspectée, évaluer immédiatement mère et fœtus; devant fièvre, douleur utérine, détresse fœtale ou procidence du cordon, déclencher une prise en charge obstétricale urgente."
    },
    {
      nom: "Infections maternelles pendant la grossesse",
      definition: "Infections urinaires, génitales ou systémiques pouvant affecter la mère, le placenta, le fœtus ou le nouveau-né.",
      physiopathologie: "Les adaptations immunitaires et urinaires de la grossesse modifient la susceptibilité à certaines infections. Une infection non traitée peut progresser, provoquer inflammation, travail prématuré ou transmission materno-fœtale.",
      risques: "Absence de dépistage prénatal, infection urinaire récurrente, exposition à une IST, immunodépression, rupture prolongée des membranes et accès limité aux soins.",
      manifestations: "Fièvre, frissons, dysurie, douleur lombaire, pertes anormales, lésions génitales ou symptômes systémiques; certaines infections restent asymptomatiques et sont détectées au dépistage.",
      examens: "Dépistages prénatals recommandés, analyse/culture d’urine et tests microbiologiques ciblés selon symptômes, exposition et contexte épidémiologique.",
      traitement: "Antimicrobiens compatibles avec la grossesse selon agent et protocole, traitement des partenaires lorsque indiqué et mesures spécifiques de prévention de transmission materno-fœtale.",
      soins: "Prélever correctement avant traitement lorsque indiqué sans retarder une urgence, surveiller température et signes de sepsis, favoriser hydratation appropriée et adhésion au traitement.",
      complications: "Pyélonéphrite, sepsis, rupture prématurée des membranes, prématurité, infection congénitale ou néonatale.",
      education: edu + " Renforcer hygiène, prévention des IST, adhésion aux dépistages et au traitement complet.",
      points: "L’absence de symptômes n’exclut pas une infection importante en grossesse; le dépistage prénatal est une mesure de prévention.",
      priorite: "Fièvre avec hypotension, altération mentale, dyspnée ou signes de mauvaise perfusion chez une femme enceinte doit faire suspecter une infection sévère/sepsis et entraîner une escalade immédiate."
    },
    {
      nom: "Incompatibilité Rh et allo-immunisation fœto-maternelle",
      definition: "Réponse immunitaire maternelle contre des antigènes érythrocytaires fœtaux, notamment l’antigène RhD, pouvant provoquer une maladie hémolytique fœtale ou néonatale.",
      physiopathologie: "Après exposition à des hématies fœtales antigène-positives, une mère non immunisée peut produire des anticorps IgG capables de traverser le placenta lors d’une grossesse actuelle ou ultérieure et d’hémolyser les globules rouges fœtaux.",
      risques: "Mère RhD négatif avec fœtus potentiellement RhD positif, grossesse/accouchement antérieur, saignement, traumatisme, procédures invasives ou transfusion incompatible antérieure.",
      manifestations: "La mère est généralement asymptomatique. Le fœtus atteint peut développer anémie, hydrops ou détresse; le nouveau-né peut présenter anémie et ictère.",
      examens: "Détermination du groupe/Rh et recherche d’anticorps maternels; si allo-immunisation, surveillance spécialisée des anticorps et de l’anémie fœtale selon protocole.",
      traitement: "Immunoglobuline anti-D pour prévenir la sensibilisation chez les femmes RhD négatif non immunisées selon calendrier et événements à risque prévus par le protocole; une allo-immunisation établie nécessite une surveillance spécialisée.",
      soins: "Vérifier groupe/Rh et statut d’anticorps, identifier les événements sensibilisants, administrer et documenter l’anti-D lorsqu’indiqué et organiser le suivi obstétrical spécialisé si anticorps présents.",
      complications: "Anémie fœtale sévère, hydrops, insuffisance cardiaque, mort fœtale, ictère et complications neurologiques néonatales liées à l’hyperbilirubinémie.",
      education: edu + " Expliquer pourquoi tout saignement, traumatisme ou procédure pendant la grossesse doit être signalé et pourquoi le suivi du groupe/Rh est important.",
      points: "L’anti-D prévient la sensibilisation; il ne traite pas une allo-immunisation déjà établie.",
      priorite: "Chez une femme RhD négatif, vérifier rapidement le statut d’immunisation et reconnaître tout événement potentiellement sensibilisant afin que la prophylaxie indiquée ne soit pas omise."
    }
  ]
};

export function getComplementsMaternite(slug: string) {
  return complementsMaternite[slug] ?? [];
}
