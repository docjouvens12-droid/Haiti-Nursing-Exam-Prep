export type PathologieCardiovasculaire = {
  nom: string;
  definition: string;
  physiopathologie: string;
  risques: string;
  manifestations: string;
  examens: string;
  traitement: string;
  soins: string;
  complications: string;
  education: string;
  points: string;
};

export const pathologiesCardiovasculaires: PathologieCardiovasculaire[] = [
  {
    nom: "Hypertension artérielle (HTA)",
    definition: "L’hypertension artérielle (HTA) est une élévation persistante de la pression exercée par le sang sur la paroi des artères. Le diagnostic ne repose pas sur une valeur isolée : il nécessite des mesures fiables, répétées et interprétées selon les recommandations utilisées, l’âge, les comorbidités et le contexte clinique. L’HTA est souvent silencieuse, mais elle augmente progressivement le risque d’atteinte cardiovasculaire, cérébrale, rénale et rétinienne.",
    physiopathologie: "La pression artérielle dépend principalement du débit cardiaque et des résistances vasculaires périphériques. Une activation excessive du système sympathique, du système rénine–angiotensine–aldostérone, une rétention hydrosodée, une dysfonction endothéliale ou une augmentation durable du tonus vasculaire peuvent maintenir la pression à un niveau élevé. Avec le temps, les artères deviennent plus rigides et se remodèlent. Le ventricule gauche doit alors travailler contre une postcharge accrue, ce qui peut provoquer une hypertrophie ventriculaire gauche puis contribuer à l’insuffisance cardiaque.",
    risques: "Les facteurs non modifiables comprennent notamment l’âge, les antécédents familiaux et certaines prédispositions individuelles. Les facteurs modifiables comprennent une alimentation trop riche en sodium, le surpoids ou l’obésité, la sédentarité, le tabagisme et une consommation excessive d’alcool. Le diabète, la maladie rénale chronique et l’apnée obstructive du sommeil sont fréquemment associés. Une HTA peut également être secondaire à une maladie rénale ou endocrinienne, ou à certains médicaments et substances.",
    manifestations: "La majorité des patients ne ressentent aucun symptôme pendant longtemps, d’où l’importance du dépistage. Lorsque la pression est très élevée ou qu’une atteinte aiguë d’un organe apparaît, le patient peut présenter céphalées importantes, troubles visuels, confusion ou déficit neurologique, douleur thoracique, dyspnée, œdème pulmonaire ou diminution de la fonction rénale. Ces manifestations imposent une évaluation rapide.",
    examens: "La première étape est une mesure correcte de la pression artérielle : patient au repos, brassard de taille appropriée, bras soutenu et mesures répétées. Une automesure à domicile ou une mesure ambulatoire sur 24 heures peut aider à confirmer l’HTA et à détecter un effet blouse blanche ou une HTA masquée. Le bilan peut comprendre créatinine et fonction rénale, sodium et potassium, glycémie ou HbA1c, bilan lipidique, analyse urinaire et ECG. Selon le contexte, d’autres examens recherchent une atteinte des organes cibles ou une cause secondaire.",
    traitement: "La prise en charge associe des modifications du mode de vie et, lorsque cela est indiqué, un traitement pharmacologique. Les mesures comprennent réduction de l’excès de sodium, alimentation équilibrée, activité physique adaptée, contrôle du poids, arrêt du tabac et limitation de l’alcool. Les médicaments peuvent inclure diurétiques thiazidiques ou apparentés, inhibiteurs de l’enzyme de conversion, antagonistes des récepteurs de l’angiotensine, inhibiteurs calciques et, dans certaines indications, bêtabloquants ou autres agents. Le choix et les objectifs tensionnels sont individualisés.",
    soins: "Mesurer et documenter la pression avec une technique standardisée, comparer les tendances plutôt qu’une seule valeur et évaluer les symptômes associés. Surveiller fréquence cardiaque, état neurologique, douleur thoracique, respiration, perfusion et diurèse lorsqu’une complication est suspectée. Rechercher une hypotension orthostatique chez les patients à risque et surveiller les effets indésirables des antihypertenseurs. Vérifier l’adhésion thérapeutique sans jugement et identifier les obstacles pratiques : coût, oubli, effets secondaires ou compréhension insuffisante.",
    complications: "Une HTA chronique mal contrôlée accélère l’athérosclérose et peut provoquer AVC ischémique ou hémorragique, maladie coronarienne et infarctus, hypertrophie ventriculaire gauche, insuffisance cardiaque, maladie artérielle périphérique, maladie rénale chronique et rétinopathie hypertensive. Une élévation sévère accompagnée d’une atteinte aiguë d’organe constitue une urgence hypertensive.",
    education: "Expliquer que l’absence de symptômes ne signifie pas que la pression est normale. Encourager la prise quotidienne des médicaments à l’heure prescrite et éviter tout arrêt brutal sans avis professionnel. Enseigner, lorsque cela fait partie du plan de soins, l’automesure tensionnelle et la tenue d’un relevé. Renforcer la diminution du sodium, l’activité régulière adaptée, le contrôle du poids, l’arrêt du tabac et le suivi des maladies associées. Le patient doit connaître les symptômes nécessitant une aide urgente : douleur thoracique, dyspnée importante, déficit neurologique, confusion ou trouble visuel aigu.",
    points: "L’HTA est souvent asymptomatique : le dépistage et la qualité de la mesure sont essentiels. Une seule valeur élevée ne suffit généralement pas à définir une HTA chronique. L’infirmier joue un rôle majeur dans la surveillance des tendances tensionnelles, l’observance, la détection des effets indésirables et l’éducation. Une pression très élevée associée à des signes d’atteinte aiguë d’un organe doit faire rechercher une urgence hypertensive."
  },
  {
    nom: "Athérosclérose et maladie coronarienne",
    definition: "L’athérosclérose correspond à la formation de plaques dans la paroi artérielle. Lorsqu’elle touche les artères coronaires, elle réduit l’apport sanguin au myocarde.",
    physiopathologie: "Lésion endothéliale, inflammation et accumulation lipidique conduisent progressivement à une plaque athéromateuse. Le rétrécissement limite le débit coronaire ; la rupture d’une plaque peut déclencher une thrombose aiguë.",
    risques: "Tabagisme, HTA, dyslipidémie, diabète, âge, antécédents familiaux, obésité, sédentarité et maladie rénale chronique.",
    manifestations: "Peut rester silencieuse. L’ischémie coronaire peut provoquer pression ou douleur thoracique, dyspnée, fatigue ou diminution de la tolérance à l’effort.",
    examens: "ECG, bilan lipidique et métabolique, épreuve fonctionnelle ou imagerie selon indication, et angiographie coronaire lorsque nécessaire.",
    traitement: "Réduction des facteurs de risque, traitement hypolipémiant et autres médicaments selon indication ; revascularisation par intervention coronaire percutanée ou chirurgie dans certaines situations.",
    soins: "Évaluer douleur, respiration, signes vitaux et perfusion ; favoriser l’adhésion aux traitements ; surveiller après les procédures et renforcer la prévention secondaire.",
    complications: "Angine, syndrome coronarien aigu, infarctus, arythmies, insuffisance cardiaque et mort subite.",
    education: "Arrêt du tabac, alimentation cardioprotectrice, activité physique adaptée, contrôle de la pression, du diabète et des lipides, prise correcte des médicaments et reconnaissance des symptômes d’alarme.",
    points: "La maladie coronarienne peut être chronique mais la rupture d’une plaque peut transformer rapidement une maladie stable en urgence thrombotique."
  },
  {
    nom: "Angine de poitrine",
    definition: "Syndrome douloureux ou inconfort thoracique lié à une ischémie myocardique transitoire sans nécrose myocardique démontrée.",
    physiopathologie: "Les besoins en oxygène du myocarde dépassent momentanément l’apport coronaire. L’angine stable survient typiquement lors d’un effort ou stress prévisible ; une modification récente du profil peut évoquer un syndrome coronarien aigu.",
    risques: "Les principaux facteurs sont ceux de la maladie coronarienne : tabac, HTA, dyslipidémie, diabète, âge et antécédents familiaux.",
    manifestations: "Pression, serrement ou lourdeur rétrosternale pouvant irradier vers bras, mâchoire, dos ou épigastre, parfois avec dyspnée, sueurs ou nausées. Les présentations peuvent être atypiques.",
    examens: "Évaluation clinique, ECG et, lorsqu’un syndrome aigu est suspecté, biomarqueurs cardiaques. Des examens d’ischémie ou une angiographie peuvent être indiqués.",
    traitement: "Repos lors de l’épisode et médicaments anti-ischémiques ou antithrombotiques selon prescription et contexte. Le traitement de fond vise aussi les facteurs de risque et la maladie coronaire sous-jacente.",
    soins: "Arrêter l’effort, évaluer rapidement la douleur et les signes vitaux, appliquer les protocoles prescrits, surveiller l’ECG si indiqué et reconnaître une douleur nouvelle, prolongée ou différente comme potentiellement urgente.",
    complications: "Progression vers syndrome coronarien aigu ou infarctus, arythmies et insuffisance cardiaque selon l’étendue de la maladie coronarienne.",
    education: "Connaître les facteurs déclenchants, suivre le traitement prescrit et demander une aide urgente si la douleur est nouvelle, sévère, persistante ou ne répond pas comme habituellement au plan établi.",
    points: "Une douleur thoracique ne doit jamais être banalisée. Un changement du caractère habituel d’une angine nécessite une réévaluation rapide."
  },
  {
    nom: "Infarctus aigu du myocarde",
    definition: "Nécrose d’une partie du muscle cardiaque causée par une ischémie aiguë prolongée, le plus souvent liée à l’occlusion thrombotique d’une artère coronaire.",
    physiopathologie: "La rupture ou l’érosion d’une plaque peut entraîner agrégation plaquettaire et thrombus. L’interruption du flux provoque une ischémie puis une lésion irréversible du myocarde si la perfusion n’est pas restaurée rapidement.",
    risques: "Maladie coronarienne, tabagisme, HTA, dyslipidémie, diabète, âge, antécédents familiaux, obésité et sédentarité.",
    manifestations: "Douleur ou pression thoracique persistante, irradiation possible, dyspnée, sueurs, nausées, faiblesse ou malaise. Certaines personnes peuvent présenter peu ou pas de douleur typique.",
    examens: "ECG rapide et répété selon la situation, troponines cardiaques et autres évaluations nécessaires. L’angiographie coronaire permet de définir l’anatomie et d’effectuer une reperfusion interventionnelle lorsque indiquée.",
    traitement: "Prise en charge urgente visant notamment la reperfusion lorsqu’elle est indiquée, traitement antithrombotique et autres médicaments guidés par le type d’infarctus, l’état hémodynamique et les protocoles locaux.",
    soins: "Reconnaître immédiatement le syndrome, alerter, surveiller ABC, douleur, rythme, pression, perfusion et saturation selon indication ; obtenir l’ECG, préparer les traitements/procédures prescrits et surveiller les complications.",
    complications: "Arythmies graves, insuffisance cardiaque, œdème pulmonaire, choc cardiogénique, complications mécaniques, péricardite et décès.",
    education: "Adhésion stricte à la prévention secondaire, médicaments, réadaptation cardiaque, contrôle des facteurs de risque et appel immédiat aux services d’urgence en cas de symptômes compatibles avec une récidive.",
    points: "Le temps jusqu’à la reperfusion influence la quantité de myocarde sauvée. L’ECG, les troponines et l’état clinique guident l’évaluation urgente."
  },
  {
    nom: "Insuffisance cardiaque",
    definition: "Syndrome dans lequel le cœur ne parvient pas à assurer un débit adéquat ou ne peut le faire qu’au prix de pressions de remplissage élevées.",
    physiopathologie: "Une dysfonction systolique, diastolique ou les deux entraîne activation neurohormonale, rétention hydrosodée et remodelage. La congestion pulmonaire ou systémique apparaît lorsque les pressions augmentent.",
    risques: "HTA, maladie coronarienne et infarctus, valvulopathies, cardiomyopathies, arythmies, diabète et autres maladies cardiaques.",
    manifestations: "Dyspnée, orthopnée, fatigue, diminution de la tolérance à l’effort, crépitants ou congestion pulmonaire, prise de poids et œdèmes. La congestion systémique peut s’accompagner de turgescence jugulaire.",
    examens: "Échocardiographie, ECG, radiographie thoracique selon contexte, peptides natriurétiques et bilans de fonction rénale, électrolytes et autres causes ou facteurs déclenchants.",
    traitement: "Traitement de la cause et médicaments adaptés au type d’insuffisance cardiaque ; les diurétiques sont souvent utilisés pour la congestion. Certaines personnes nécessitent dispositifs, procédures ou prise en charge avancée.",
    soins: "Surveiller respiration, signes vitaux, perfusion, poids quotidien, bilan hydrique, œdèmes, fonction rénale et électrolytes ; administrer les traitements prescrits et repérer toute aggravation.",
    complications: "Œdème aigu pulmonaire, arythmies, insuffisance rénale, choc cardiogénique, thromboembolie et décompensations répétées.",
    education: "Poids régulier selon le plan de soins, reconnaissance d’une prise de poids rapide ou aggravation de la dyspnée/œdèmes, observance médicamenteuse, recommandations sur sodium et liquides lorsqu’elles sont prescrites.",
    points: "Le poids, la dyspnée, les œdèmes et le bilan hydrique permettent de suivre la congestion. Une détérioration respiratoire ou hémodynamique nécessite une réaction rapide."
  },
  {
    nom: "Arythmies cardiaques",
    definition: "Anomalies de la fréquence, de la régularité, de l’origine ou de la conduction de l’activité électrique cardiaque.",
    physiopathologie: "Un trouble de l’automatisme, de la conduction ou un circuit de réentrée peut produire tachycardie, bradycardie ou rythme irrégulier. L’importance clinique dépend surtout de l’effet sur le débit cardiaque et la perfusion.",
    risques: "Cardiopathie structurelle, ischémie/infarctus, désordres électrolytiques, médicaments, hypoxie, troubles thyroïdiens, âge et autres facteurs selon l’arythmie.",
    manifestations: "Palpitations, fatigue, étourdissements, syncope, dyspnée, douleur thoracique ou absence de symptômes. Une hypotension ou altération de l’état mental indique une mauvaise tolérance.",
    examens: "Pouls et ECG 12 dérivations, monitorage continu ou ambulatoire selon le cas, électrolytes et recherche d’une cause sous-jacente.",
    traitement: "Dépend du rythme et de la stabilité : correction des causes, médicaments, cardioversion, défibrillation, stimulation cardiaque ou ablation selon indication et protocoles.",
    soins: "Évaluer d’abord la stabilité hémodynamique, vérifier pouls et pression, surveiller ECG, symptômes et perfusion, corriger les facteurs réversibles prescrits et préparer les interventions urgentes si nécessaire.",
    complications: "Syncope et traumatismes, insuffisance cardiaque, ischémie, AVC thromboembolique pour certaines arythmies comme la fibrillation auriculaire, arrêt cardiaque pour certains rythmes ventriculaires.",
    education: "Prendre les médicaments correctement, connaître les signes d’alarme, respecter le suivi et les recommandations spécifiques concernant anticoagulation, stimulateur ou autres traitements lorsque concernés.",
    points: "Traiter le patient et sa perfusion, pas seulement le tracé. Toute arythmie accompagnée d’instabilité hémodynamique est une situation urgente."
  },
  {
    nom: "Valvulopathies",
    definition: "Maladies des valves cardiaques provoquant principalement une sténose, qui gêne l’ouverture, ou une régurgitation, qui permet un reflux sanguin.",
    physiopathologie: "L’obstacle ou la fuite impose une surcharge de pression ou de volume aux cavités cardiaques. Avec le temps peuvent apparaître hypertrophie, dilatation, congestion et insuffisance cardiaque.",
    risques: "Malformations congénitales, dégénérescence liée à l’âge, maladie rhumatismale, infection, calcification et autres maladies structurelles.",
    manifestations: "Souffle, dyspnée, fatigue, palpitations, douleur thoracique, syncope ou signes d’insuffisance cardiaque selon la valve et la gravité.",
    examens: "Auscultation et surtout échocardiographie ; ECG, radiographie, cathétérisme ou autres examens peuvent compléter l’évaluation.",
    traitement: "Surveillance ou traitement symptomatique dans certains cas ; réparation ou remplacement valvulaire lorsque la sévérité, les symptômes et la fonction cardiaque le justifient.",
    soins: "Surveiller symptômes, perfusion, signes de congestion et rythme ; préparer le patient aux examens/interventions et assurer la surveillance postopératoire ou après procédure.",
    complications: "Insuffisance cardiaque, arythmies, thromboembolie, hypertension pulmonaire et endocardite selon le type de valvulopathie.",
    education: "Suivi cardiologique régulier, adhésion thérapeutique, santé bucco-dentaire et connaissance des recommandations spécifiques après réparation ou remplacement valvulaire.",
    points: "Une valvulopathie peut être longtemps compensée. L’apparition de dyspnée, syncope ou signes d’insuffisance cardiaque peut traduire une progression importante."
  },
  {
    nom: "Endocardite infectieuse",
    definition: "Infection de l’endocarde, touchant le plus souvent une valve cardiaque, avec formation possible de végétations infectées.",
    physiopathologie: "Une bactériémie ou plus rarement un autre agent infectieux peut coloniser un endocarde ou une valve vulnérable. Les végétations peuvent détruire la valve ou emboliser.",
    risques: "Certaines valvulopathies ou cardiopathies, valves prothétiques, antécédent d’endocardite, dispositifs intracardiaques et exposition à une bactériémie selon le contexte.",
    manifestations: "Fièvre, frissons, fatigue, nouveau souffle ou modification d’un souffle, signes d’insuffisance cardiaque ou manifestations emboliques. Le tableau peut être subaigu.",
    examens: "Hémocultures avant antibiothérapie lorsque possible et sans retarder une prise en charge urgente, échocardiographie et bilans biologiques ; l’évaluation suit des critères diagnostiques cliniques et microbiologiques.",
    traitement: "Antibiothérapie antimicrobienne prolongée guidée par les cultures ; chirurgie dans certaines infections compliquées ou lésions valvulaires sévères.",
    soins: "Prélever les cultures selon prescription, administrer les antimicrobiens aux horaires prévus, surveiller température, signes d’insuffisance cardiaque, embolies, fonction rénale et complications des traitements.",
    complications: "Destruction valvulaire, insuffisance cardiaque, embolies systémiques ou pulmonaires selon le côté atteint, abcès et complications neurologiques.",
    education: "Importance de terminer le traitement, du suivi, de l’hygiène bucco-dentaire et des recommandations individualisées de prophylaxie pour les patients qui répondent aux critères spécifiques.",
    points: "Fièvre persistante associée à un contexte cardiaque à risque doit faire envisager l’endocardite. Les hémocultures et l’échocardiographie sont essentielles au diagnostic."
  },
  {
    nom: "Péricardite",
    definition: "Inflammation du péricarde, l’enveloppe qui entoure le cœur.",
    physiopathologie: "L’inflammation des feuillets péricardiques provoque douleur et parfois accumulation de liquide. Un épanchement important ou rapide peut comprimer le cœur et empêcher son remplissage normal.",
    risques: "Infections virales ou autres, maladies auto-immunes, insuffisance rénale, infarctus, chirurgie ou traumatisme cardiaque et certaines causes médicamenteuses ou néoplasiques.",
    manifestations: "Douleur thoracique souvent vive et influencée par la respiration ou la position, parfois soulagée en position assise penchée en avant ; fièvre ou frottement péricardique peuvent être présents.",
    examens: "ECG, échocardiographie pour rechercher un épanchement et bilans inflammatoires ou étiologiques selon le contexte.",
    traitement: "Traitement anti-inflammatoire et prise en charge de la cause selon prescription. Une tamponnade nécessite un traitement urgent visant à soulager la compression cardiaque.",
    soins: "Évaluer douleur, signes vitaux et tolérance hémodynamique, surveiller l’apparition de dyspnée, hypotension ou signes de tamponnade et administrer le traitement prescrit.",
    complications: "Épanchement péricardique, tamponnade cardiaque, récidive et péricardite constrictive.",
    education: "Respecter le traitement et le suivi, limiter l’activité selon les recommandations et consulter rapidement en cas d’aggravation de la douleur, dyspnée, malaise ou syncope.",
    points: "La complication à ne pas manquer est la tamponnade : une dégradation hémodynamique chez un patient avec épanchement péricardique est une urgence."
  },
  {
    nom: "Cardiomyopathies",
    definition: "Groupe de maladies du muscle cardiaque qui altèrent sa structure ou sa fonction, notamment formes dilatée, hypertrophique et restrictive.",
    physiopathologie: "Selon le type, le ventricule peut se dilater et perdre sa force contractile, s’hypertrophier et gêner le remplissage ou devenir rigide. Ces changements perturbent le débit et favorisent arythmies et insuffisance cardiaque.",
    risques: "Causes génétiques, myocardite, toxiques, maladies métaboliques ou systémiques et autres causes selon le type ; certaines formes restent idiopathiques.",
    manifestations: "Dyspnée, fatigue, douleur thoracique, palpitations, syncope, œdèmes ou signes d’insuffisance cardiaque ; certaines formes peuvent être découvertes chez une personne asymptomatique.",
    examens: "ECG, échocardiographie, imagerie cardiaque avancée et examens étiologiques ; l’histoire familiale peut être importante.",
    traitement: "Traitement adapté au type : médicaments de l’insuffisance cardiaque ou du rythme, réduction du risque thromboembolique lorsqu’indiquée, dispositifs, procédures ou transplantation dans les formes avancées.",
    soins: "Surveiller symptômes d’insuffisance cardiaque, rythme, perfusion, tolérance à l’activité et réponse thérapeutique ; renforcer l’éducation et le suivi spécialisé.",
    complications: "Insuffisance cardiaque, arythmies, thromboembolie et mort subite dans certaines formes à risque.",
    education: "Adhésion au traitement, suivi cardiologique, activité selon recommandations, reconnaissance des symptômes d’aggravation et dépistage familial lorsque recommandé.",
    points: "Les cardiomyopathies ne sont pas une maladie unique. Le type détermine la physiopathologie, le risque rythmique et la prise en charge."
  },
  {
    nom: "Artériopathie périphérique",
    definition: "Réduction du débit artériel vers les membres, le plus souvent causée par l’athérosclérose.",
    physiopathologie: "Le rétrécissement artériel limite l’apport d’oxygène aux tissus. À l’effort, la demande augmente et peut provoquer une claudication ; une maladie avancée peut entraîner ischémie au repos et lésions tissulaires.",
    risques: "Tabagisme, diabète, âge, HTA, dyslipidémie et maladie athéroscléreuse dans d’autres territoires.",
    manifestations: "Claudication, extrémité froide, pouls diminués, peau fine ou brillante, retard de cicatrisation ; douleur au repos, pâleur ou lésions ischémiques indiquent une maladie plus sévère.",
    examens: "Examen vasculaire, indice cheville-bras et imagerie vasculaire selon indication.",
    traitement: "Arrêt du tabac, exercice supervisé ou structuré lorsque approprié, contrôle des facteurs de risque, médicaments et revascularisation dans certaines formes sévères.",
    soins: "Évaluer pouls, couleur, température, douleur, peau et plaies ; protéger les extrémités, favoriser les mesures prescrites et signaler toute aggravation aiguë de la perfusion.",
    complications: "Ulcères ischémiques, infection secondaire, ischémie critique ou aiguë et perte de membre.",
    education: "Soins attentifs des pieds, surtout en cas de diabète, arrêt du tabac, activité prescrite, contrôle des facteurs de risque et consultation urgente en cas de douleur brutale, pâleur, froideur ou perte de sensibilité.",
    points: "Une modification aiguë des signes neurovasculaires d’un membre peut représenter une ischémie aiguë et nécessite une évaluation urgente."
  },
  {
    nom: "Thrombose veineuse profonde (TVP)",
    definition: "Formation d’un thrombus dans une veine profonde, le plus souvent au niveau des membres inférieurs.",
    physiopathologie: "La stase veineuse, l’atteinte endothéliale et l’hypercoagulabilité favorisent la thrombose. Une partie du thrombus peut se détacher et migrer vers les artères pulmonaires.",
    risques: "Immobilisation, chirurgie ou traumatisme, cancer, antécédent thromboembolique, grossesse/postpartum, œstrogènes et thrombophilies, entre autres.",
    manifestations: "Douleur, gonflement, chaleur ou sensibilité unilatérale peuvent être présents, mais une TVP peut aussi être peu symptomatique.",
    examens: "Évaluation de la probabilité clinique, échographie veineuse et D-dimères dans certaines stratégies diagnostiques.",
    traitement: "Anticoagulation dans la majorité des cas, avec autres interventions réservées à certaines situations selon le risque et la localisation.",
    soins: "Surveiller le membre et les signes d’embolie pulmonaire, administrer l’anticoagulation prescrite, surveiller les saignements et appliquer les mesures de mobilisation/prévention prescrites.",
    complications: "Embolie pulmonaire et syndrome post-thrombotique ; les anticoagulants exposent aussi à un risque de saignement.",
    education: "Adhésion à l’anticoagulant, prévention des traumatismes selon le traitement, mobilisation et mesures préventives recommandées, et recours urgent en cas de dyspnée soudaine, douleur thoracique ou syncope.",
    points: "La complication vitale majeure d’une TVP est l’embolie pulmonaire. Une dyspnée brutale chez un patient à risque nécessite une évaluation urgente."
  },
  {
    nom: "Anévrisme de l’aorte",
    definition: "Dilatation anormale et permanente d’un segment de l’aorte pouvant être thoracique ou abdominale.",
    physiopathologie: "L’affaiblissement progressif de la paroi aortique permet sa dilatation. Le risque de rupture augmente notamment avec la taille, la croissance et certains facteurs individuels.",
    risques: "Âge, tabagisme, HTA, athérosclérose, antécédents familiaux et certaines maladies génétiques du tissu conjonctif selon la localisation.",
    manifestations: "Souvent asymptomatique. Une douleur abdominale, dorsale ou thoracique peut survenir. Une rupture peut provoquer douleur brutale, hypotension, syncope et état de choc.",
    examens: "Échographie pour certains anévrismes abdominaux et tomodensitométrie ou autre imagerie pour mesurer précisément l’aorte et planifier la prise en charge.",
    traitement: "Surveillance des petits anévrismes sélectionnés, contrôle des facteurs de risque et réparation endovasculaire ou chirurgicale lorsque les critères de taille, croissance ou symptômes le justifient.",
    soins: "Surveiller douleur, pression artérielle, perfusion et signes de rupture ; après réparation, surveiller hémodynamique, perfusion des membres, fonction rénale et complications de la procédure.",
    complications: "Rupture avec hémorragie massive et choc, thrombose ou embolisation et complications liées aux structures voisines selon la localisation.",
    education: "Arrêt du tabac, contrôle de la pression, respect de la surveillance d’imagerie et recours immédiat en cas de douleur brutale sévère, malaise ou syncope.",
    points: "Un anévrisme peut être silencieux. Douleur soudaine intense associée à une instabilité hémodynamique fait craindre une rupture et constitue une urgence absolue."
  },
  {
    nom: "Choc cardiogénique",
    definition: "État de choc provoqué par une défaillance sévère de la fonction de pompe du cœur entraînant une perfusion tissulaire inadéquate.",
    physiopathologie: "La chute du débit cardiaque entraîne hypotension et hypoperfusion. La vasoconstriction compensatrice augmente la postcharge et peut aggraver la charge du myocarde, tandis que la congestion pulmonaire peut compromettre l’oxygénation.",
    risques: "Infarctus étendu, insuffisance cardiaque avancée, myocardite sévère, complications mécaniques, arythmies graves et autres causes de défaillance cardiaque aiguë.",
    manifestations: "Hypotension, extrémités froides et moites, tachycardie ou parfois bradycardie, altération de l’état mental, oligurie, faiblesse des pouls et détresse respiratoire/congestion pulmonaire.",
    examens: "ECG, échocardiographie, biomarqueurs et bilans de perfusion/organes, monitorage hémodynamique selon la gravité et recherche rapide de la cause.",
    traitement: "Urgence de soins critiques : traitement de la cause, support respiratoire et circulatoire, médicaments vasoactifs/inotropes et parfois assistance circulatoire mécanique selon indication.",
    soins: "Priorité ABC, monitorage continu, évaluation répétée de la perfusion, état mental, diurèse, rythme et pression ; administrer les traitements prescrits, préparer les interventions urgentes et surveiller étroitement leur réponse.",
    complications: "Défaillance multiviscérale, arythmies, arrêt cardiaque, insuffisance rénale, hypoxémie sévère et décès.",
    education: "L’éducation intervient surtout après stabilisation : compréhension de la cause, traitement de la cardiopathie sous-jacente, adhésion thérapeutique et reconnaissance précoce des symptômes de récidive ou décompensation.",
    points: "Le choc cardiogénique est une urgence vitale. Les signes de mauvaise perfusion associés à une défaillance cardiaque nécessitent une prise en charge immédiate et une surveillance intensive."
  }
];
