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
    definition: "L’athérosclérose est une maladie chronique de la paroi artérielle caractérisée par l’accumulation de lipides, de cellules inflammatoires et de tissu fibreux formant des plaques d’athérome. Lorsqu’elle atteint les artères coronaires, elle peut réduire progressivement l’apport en oxygène au myocarde et provoquer une maladie coronarienne. La maladie peut rester silencieuse pendant des années avant de se manifester par une ischémie, une angine ou un syndrome coronarien aigu.",
    physiopathologie: "Le processus débute par une dysfonction de l’endothélium vasculaire favorisée notamment par le tabagisme, l’HTA, le diabète et les anomalies lipidiques. Les lipoprotéines athérogènes pénètrent dans la paroi artérielle, où elles participent à une réaction inflammatoire. Des macrophages chargés de lipides forment des cellules spumeuses, puis une plaque constituée d’un noyau lipidique et d’une chape fibreuse se développe. Une plaque stable peut rétrécir progressivement la lumière coronaire et limiter l’augmentation du débit lors d’un effort. Une plaque vulnérable peut se fissurer ou se rompre brutalement, exposant un matériel thrombogène et déclenchant activation plaquettaire, formation d’un thrombus et obstruction partielle ou complète de l’artère. Ce mécanisme est à l’origine de nombreux syndromes coronariens aigus.",
    risques: "Les facteurs modifiables majeurs comprennent le tabagisme, l’HTA, une concentration élevée de cholestérol athérogène, le diabète, le surpoids ou l’obésité, la sédentarité et certaines habitudes alimentaires défavorables. La maladie rénale chronique augmente également le risque cardiovasculaire. Les facteurs non modifiables comprennent l’âge, les antécédents familiaux de maladie cardiovasculaire précoce et certaines prédispositions individuelles. Plusieurs facteurs présents simultanément augmentent fortement le risque global ; la prévention doit donc viser l’ensemble du profil cardiovasculaire plutôt qu’un seul facteur isolé.",
    manifestations: "L’athérosclérose coronaire peut être asymptomatique. Lorsque le débit coronaire devient insuffisant par rapport aux besoins du myocarde, le patient peut présenter une pression, un serrement ou une douleur thoracique, une dyspnée, une fatigue inhabituelle ou une diminution de la tolérance à l’effort. L’inconfort peut irradier vers un bras, les épaules, la mâchoire, le dos ou l’épigastre. Certaines personnes, notamment des patients âgés ou diabétiques, peuvent avoir des manifestations moins typiques. Une douleur nouvelle, prolongée, survenant au repos ou associée à sueurs, nausées, malaise ou dyspnée importante doit faire suspecter un syndrome coronarien aigu.",
    examens: "L’évaluation commence par l’histoire clinique, les facteurs de risque, l’examen cardiovasculaire et un ECG lorsqu’une ischémie est suspectée. Le bilan biologique comprend généralement le profil lipidique et l’évaluation du diabète et d’autres facteurs de risque. En présence de symptômes aigus, les troponines cardiaques sont utilisées pour rechercher une lésion myocardique. Selon la probabilité clinique et la situation, une épreuve d’effort, une imagerie de stress, une angiographie coronaire par tomodensitométrie ou une coronarographie invasive peuvent être utilisées pour rechercher et caractériser la maladie coronaire. Le choix de l’examen dépend de la stabilité du patient et de la question clinique.",
    traitement: "La prise en charge vise à ralentir la progression de l’athérosclérose, prévenir la thrombose et réduire les événements cardiovasculaires. Elle associe arrêt du tabac, activité physique adaptée, alimentation cardioprotectrice, contrôle du poids, de la pression artérielle et du diabète. Les statines constituent une base importante du traitement hypolipémiant chez de nombreux patients à risque ; d’autres traitements lipidiques peuvent être ajoutés selon les objectifs et le profil du patient. Les traitements antiplaquettaires et anti-ischémiques sont utilisés lorsqu’ils sont indiqués par la situation clinique. Une revascularisation par intervention coronaire percutanée avec angioplastie/stent ou par pontage aorto-coronarien peut être nécessaire lorsque l’anatomie, les symptômes ou le contexte aigu le justifient.",
    soins: "Évaluer systématiquement toute douleur ou gêne thoracique : début, localisation, caractère, intensité, irradiation, durée, facteurs déclenchants ou soulageants et symptômes associés. Surveiller pression artérielle, fréquence et rythme cardiaques, respiration, saturation selon indication, perfusion périphérique et état général. Devant une suspicion de syndrome coronarien aigu, interrompre l’effort, obtenir rapidement l’évaluation et l’ECG selon le protocole, maintenir une surveillance rapprochée et préparer les traitements ou procédures prescrits. Après une coronarographie ou une intervention percutanée, surveiller le site d’accès, le saignement ou l’hématome, les pouls et la perfusion distale ainsi que les signes vitaux. Participer activement à la prévention secondaire, à l’adhésion médicamenteuse et à l’identification des obstacles au suivi.",
    complications: "La progression de la maladie peut provoquer angine stable, ischémie myocardique chronique et diminution de la fonction cardiaque. La rupture d’une plaque peut entraîner un syndrome coronarien aigu, notamment angine instable ou infarctus du myocarde. Les conséquences possibles comprennent arythmies ventriculaires graves, insuffisance cardiaque, choc cardiogénique et mort subite. L’athérosclérose étant souvent diffuse, un patient atteint de maladie coronarienne peut également présenter une maladie cérébrovasculaire ou artérielle périphérique.",
    education: "Expliquer au patient que le traitement reste important même en l’absence de douleur, car l’athérosclérose peut progresser silencieusement. Renforcer l’arrêt du tabac, une alimentation cardioprotectrice, l’activité physique adaptée au plan de soins, le contrôle du poids, de la pression artérielle, du diabète et des lipides. Encourager la prise régulière des médicaments prescrits et déconseiller leur interruption sans avis professionnel, notamment après la pose d’un stent lorsque des antiplaquettaires sont prescrits. Enseigner à reconnaître les signes d’alarme : douleur ou pression thoracique nouvelle ou persistante, dyspnée importante, sueurs froides, malaise ou syncope. Ces symptômes nécessitent une évaluation urgente plutôt qu’un déplacement autonome prolongé vers un établissement de soins.",
    points: "L’athérosclérose évolue souvent silencieusement pendant des années. Une plaque qui rétrécit progressivement une coronaire peut provoquer une ischémie d’effort, tandis que la rupture aiguë d’une plaque peut déclencher une thrombose et un infarctus. La réduction globale des facteurs de risque et l’adhésion au traitement sont essentielles. Pour l’infirmier, une modification récente de la douleur thoracique ou l’apparition de signes d’instabilité doit être considérée comme potentiellement urgente."
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
    physiopathologie: "Une automaticité anormale, une réentrée ou un trouble de conduction peut produire un rythme trop rapide, trop lent ou inefficace et réduire le débit cardiaque.",
    risques: "Cardiopathie, ischémie, troubles électrolytiques, médicaments, hypoxie, maladies thyroïdiennes, âge et autres facteurs selon le type d’arythmie.",
    manifestations: "Palpitations, faiblesse, étourdissements, syncope, douleur thoracique, dyspnée ou hypotension ; certaines arythmies restent asymptomatiques.",
    examens: "ECG 12 dérivations, monitorage, Holter ou enregistreur prolongé, électrolytes et autres bilans orientés par le contexte.",
    traitement: "Dépend du rythme et de la stabilité : correction de la cause, médicaments, cardioversion, défibrillation, stimulation cardiaque ou ablation selon indication.",
    soins: "Évaluer d’abord la stabilité hémodynamique, surveiller rythme et signes vitaux, rechercher douleur, dyspnée, altération mentale ou choc, préparer l’intervention urgente si nécessaire.",
    complications: "Syncope, chute du débit cardiaque, insuffisance cardiaque, thromboembolie pour certaines arythmies, arrêt cardiaque et mort subite.",
    education: "Adhésion aux médicaments, suivi du pouls si enseigné, contrôle des facteurs déclenchants et reconnaissance des symptômes nécessitant une évaluation urgente.",
    points: "Traiter le patient, pas seulement le tracé : une arythmie associée à hypotension, douleur ischémique, choc, altération mentale ou détresse respiratoire est particulièrement préoccupante."
  },
  {
    nom: "Valvulopathies",
    definition: "Atteintes d’une ou plusieurs valves cardiaques entraînant une obstruction du flux (sténose) ou un reflux (insuffisance/régurgitation).",
    physiopathologie: "La surcharge de pression ou de volume impose un travail supplémentaire aux cavités cardiaques et peut conduire à hypertrophie, dilatation, congestion et insuffisance cardiaque.",
    risques: "Dégénérescence liée à l’âge, cardiopathie rhumatismale, anomalies congénitales, endocardite, atteinte ischémique ou autres maladies cardiaques.",
    manifestations: "Souffle, dyspnée, fatigue, baisse de tolérance à l’effort, douleur thoracique, syncope, palpitations ou signes d’insuffisance cardiaque selon la valve et la sévérité.",
    examens: "Échocardiographie avec Doppler, ECG et autres imageries ou cathétérisme dans des situations sélectionnées.",
    traitement: "Surveillance, traitement des conséquences hémodynamiques et réparation ou remplacement valvulaire lorsque indiqué.",
    soins: "Surveiller dyspnée, congestion, perfusion, rythme et tolérance à l’activité ; préparer et surveiller le patient autour des procédures ; assurer l’éducation liée aux traitements.",
    complications: "Insuffisance cardiaque, arythmies, embolies, hypertension pulmonaire, endocardite et décompensation aiguë.",
    education: "Suivi cardiologique, observance thérapeutique, santé buccodentaire et signalement rapide d’une aggravation de la dyspnée, syncope, fièvre inexpliquée ou œdèmes.",
    points: "Une valvulopathie sévère peut longtemps être compensée puis se décompenser. L’évolution des symptômes et de l’échocardiographie guide la prise en charge."
  },
  {
    nom: "Endocardite infectieuse",
    definition: "Infection de l’endocarde, le plus souvent des valves cardiaques, associée à des végétations infectées.",
    physiopathologie: "Une bactériémie ou plus rarement une autre infection sanguine peut coloniser un endocarde ou une valve vulnérable, créant des végétations susceptibles de détruire la valve ou d’emboliser.",
    risques: "Certaines valvulopathies ou cardiopathies, prothèses valvulaires, antécédent d’endocardite, dispositifs intracardiaques et exposition sanguine à risque selon le contexte.",
    manifestations: "Fièvre, frissons, fatigue, nouveau souffle ou modification d’un souffle, signes d’insuffisance cardiaque et manifestations emboliques ou systémiques.",
    examens: "Plusieurs séries d’hémocultures avant antibiothérapie lorsque possible sans retarder une urgence, échocardiographie et bilans inflammatoires ou organiques.",
    traitement: "Antibiothérapie antimicrobienne prolongée guidée par le germe et la sensibilité ; chirurgie dans certaines infections compliquées ou atteintes valvulaires sévères.",
    soins: "Obtenir les prélèvements prescrits correctement, administrer les antimicrobiens à l’heure, surveiller température, fonction cardiaque et signes d’embolie ou d’insuffisance cardiaque.",
    complications: "Destruction valvulaire, insuffisance cardiaque, abcès, embolies cérébrales ou systémiques, atteinte rénale, sepsis et décès.",
    education: "Terminer le traitement, maintenir une bonne santé buccodentaire, informer les soignants des antécédents cardiaques et connaître les situations où une prophylaxie est réellement recommandée.",
    points: "Hémocultures et échocardiographie sont centrales. Fièvre persistante avec facteurs de risque cardiaques ou phénomènes emboliques doit faire évoquer le diagnostic."
  },
  {
    nom: "Péricardite",
    definition: "Inflammation du péricarde, l’enveloppe qui entoure le cœur.",
    physiopathologie: "L’inflammation des feuillets péricardiques provoque douleur et parfois épanchement. Une accumulation rapide ou importante de liquide peut comprimer le cœur et limiter son remplissage.",
    risques: "Infections virales ou autres, maladies inflammatoires ou auto-immunes, insuffisance rénale, infarctus, chirurgie cardiaque, cancer et certains traitements.",
    manifestations: "Douleur thoracique souvent aiguë et pleurétique, parfois améliorée en position assise penchée vers l’avant, avec possible frottement péricardique. Dyspnée ou signes hémodynamiques peuvent apparaître si épanchement important.",
    examens: "ECG, échocardiographie, marqueurs inflammatoires et examens orientés vers la cause ; imagerie supplémentaire selon le contexte.",
    traitement: "Traitement anti-inflammatoire et de la cause selon prescription ; drainage urgent lorsqu’une tamponnade compromet l’hémodynamique.",
    soins: "Évaluer douleur et respiration, surveiller pression, fréquence, perfusion et signes de tamponnade, administrer les traitements prescrits et limiter l’effort selon indication.",
    complications: "Épanchement péricardique, tamponnade cardiaque, récidive et péricardite constrictive.",
    education: "Respect du traitement et du repos recommandé, suivi médical et consultation urgente si aggravation de la dyspnée, malaise, syncope ou signes de mauvaise perfusion.",
    points: "Une douleur positionnelle peut orienter vers une péricardite, mais toute douleur thoracique nécessite d’abord d’exclure les urgences majeures."
  },
  {
    nom: "Cardiomyopathies",
    definition: "Maladies du muscle cardiaque pouvant altérer sa contraction, son remplissage ou son organisation structurelle.",
    physiopathologie: "Les formes dilatée, hypertrophique et restrictive ont des mécanismes différents mais peuvent toutes compromettre le débit, augmenter les pressions intracardiaques ou favoriser des arythmies.",
    risques: "Causes génétiques, infections, toxiques, alcool, grossesse/péripartum, maladies métaboliques ou infiltratives ; la cause varie selon la forme.",
    manifestations: "Dyspnée, fatigue, œdèmes, douleur thoracique, palpitations, présyncope ou syncope ; certaines formes peuvent être découvertes lors d’un dépistage familial.",
    examens: "ECG, échocardiographie, IRM cardiaque et bilans étiologiques ; tests génétiques ou dépistage familial dans certaines formes.",
    traitement: "Dépend du type et de la cause : traitement de l’insuffisance cardiaque, contrôle du rythme, prévention thromboembolique ou dispositifs/procédures spécialisés selon indication.",
    soins: "Surveiller signes d’insuffisance cardiaque, rythme, perfusion et tolérance à l’activité ; renforcer l’observance et les restrictions individualisées ; repérer syncope ou aggravation aiguë.",
    complications: "Insuffisance cardiaque, arythmies, thromboembolie, mort subite et progression vers une maladie avancée.",
    education: "Suivi régulier, adhésion au traitement, conseils d’activité individualisés et importance du dépistage familial lorsque la cardiomyopathie est héréditaire.",
    points: "Les cardiomyopathies ne forment pas une maladie unique. Identifier le type et la cause est essentiel pour estimer le risque et choisir la prise en charge."
  },
  {
    nom: "Artériopathie périphérique",
    definition: "Maladie artérielle, généralement athéroscléreuse, qui réduit la perfusion des membres, surtout des membres inférieurs.",
    physiopathologie: "Le rétrécissement ou l’occlusion artérielle limite l’apport sanguin. L’effort augmente les besoins musculaires et peut révéler une ischémie sous forme de claudication ; une maladie avancée peut provoquer une ischémie au repos.",
    risques: "Tabagisme, diabète, âge, HTA, dyslipidémie, maladie rénale et athérosclérose dans d’autres territoires.",
    manifestations: "Claudication intermittente, pouls diminués, peau froide ou changements trophiques ; douleur au repos, plaie non cicatrisante ou gangrène indiquent une atteinte plus sévère.",
    examens: "Indice cheville-bras, examen vasculaire, Doppler et imagerie artérielle lorsqu’une intervention est envisagée ou que le diagnostic l’exige.",
    traitement: "Arrêt du tabac, exercice structuré adapté, contrôle des facteurs de risque, médicaments préventifs et revascularisation pour certaines ischémies sévères ou symptômes persistants.",
    soins: "Évaluer douleur, couleur, température, remplissage capillaire, pouls et intégrité cutanée ; protéger les pieds, surtout chez le patient diabétique, et reconnaître une ischémie aiguë.",
    complications: "Ulcères, infection, ischémie critique ou menaçant le membre, gangrène, amputation et risque cardiovasculaire systémique accru.",
    education: "Arrêt absolu du tabac, marche/exercice selon programme, soins quotidiens des pieds, chaussures adaptées et signalement immédiat d’une douleur soudaine ou d’un membre froid/pâle.",
    points: "L’artériopathie périphérique est aussi un marqueur d’athérosclérose systémique : le risque d’infarctus et d’AVC est augmenté."
  },
  {
    nom: "Thrombose veineuse profonde (TVP)",
    definition: "Formation d’un thrombus dans une veine profonde, le plus souvent d’un membre inférieur.",
    physiopathologie: "La stase veineuse, la lésion endothéliale et l’hypercoagulabilité constituent la triade de Virchow et favorisent la thrombose.",
    risques: "Immobilisation, chirurgie ou traumatisme, cancer, grossesse/post-partum, œstrogènes, antécédent de thrombose et thrombophilies, entre autres.",
    manifestations: "Œdème unilatéral, douleur ou sensibilité, chaleur ou changement de couleur ; l’absence de signes n’exclut pas une TVP.",
    examens: "Évaluation de probabilité clinique, D-dimères dans des contextes appropriés et échographie veineuse de compression.",
    traitement: "Anticoagulation lorsque indiquée ; stratégies supplémentaires dans des cas sélectionnés selon le risque, l’étendue et les contre-indications.",
    soins: "Surveiller membre et signes d’embolie pulmonaire, administrer et surveiller l’anticoagulation, prévenir les saignements et éviter le massage d’un membre suspect de TVP.",
    complications: "Embolie pulmonaire, syndrome post-thrombotique et récidive thromboembolique.",
    education: "Adhésion à l’anticoagulant, prévention des saignements, mobilité adaptée et consultation urgente pour dyspnée soudaine, douleur thoracique, syncope ou hémoptysie.",
    points: "La complication la plus redoutée est l’embolie pulmonaire. Une TVP ne doit pas être diagnostiquée ou exclue sur les seuls signes physiques."
  },
  {
    nom: "Anévrisme de l’aorte",
    definition: "Dilatation pathologique d’un segment de l’aorte pouvant toucher l’aorte thoracique ou abdominale.",
    physiopathologie: "L’affaiblissement progressif de la paroi entraîne une dilatation ; l’augmentation du diamètre accroît la tension pariétale et le risque de complications, notamment rupture.",
    risques: "Âge, tabagisme, HTA, athérosclérose, antécédents familiaux et certaines maladies génétiques ou du tissu conjonctif selon la localisation.",
    manifestations: "Souvent asymptomatique. Une douleur thoracique, dorsale ou abdominale peut survenir. Une douleur brutale avec hypotension ou syncope peut annoncer une rupture ou autre catastrophe aortique.",
    examens: "Échographie pour de nombreux anévrismes abdominaux ; tomodensitométrie, IRM ou échocardiographie selon la localisation et l’urgence.",
    traitement: "Surveillance du diamètre et des facteurs de risque pour certains anévrismes ; réparation endovasculaire ou chirurgicale lorsque le risque le justifie. Une rupture est une urgence vitale.",
    soins: "Surveiller douleur, pression, perfusion et signes de choc ; éviter les efforts inutiles en situation aiguë, obtenir rapidement l’aide spécialisée et préparer une intervention urgente si rupture suspectée.",
    complications: "Rupture avec hémorragie massive, compression de structures, embolisation ou autres complications aortiques selon la localisation.",
    education: "Contrôle de la pression, arrêt du tabac, respect des contrôles d’imagerie et consultation urgente pour douleur soudaine sévère, syncope ou signes de choc.",
    points: "Un anévrisme peut être silencieux jusqu’à une complication. Une douleur brutale associée à instabilité hémodynamique est une urgence absolue."
  },
  {
    nom: "Choc cardiogénique",
    definition: "État de choc dû à une défaillance sévère de la fonction de pompe du cœur entraînant un débit cardiaque insuffisant et une hypoperfusion des organes.",
    physiopathologie: "La baisse du débit provoque hypotension et hypoperfusion. Les réponses compensatoires augmentent les résistances vasculaires et la charge du cœur, tandis que la congestion pulmonaire peut aggraver l’hypoxémie.",
    risques: "Infarctus étendu, insuffisance cardiaque sévère, complications mécaniques de l’infarctus, myocardite, arythmies graves ou autres défaillances cardiaques aiguës.",
    manifestations: "Hypotension, peau froide et moite, altération de l’état mental, oligurie, pouls faible, signes de mauvaise perfusion et souvent dyspnée ou congestion pulmonaire.",
    examens: "ECG, échocardiographie, marqueurs cardiaques, gaz/lactate et bilans d’organes ; évaluation hémodynamique et coronarographie selon la cause suspectée.",
    traitement: "Urgence de réanimation : soutien respiratoire et circulatoire, traitement de la cause, médicaments vasoactifs/inotropes et revascularisation urgente lorsqu’un infarctus en est responsable ; assistance mécanique dans des cas sélectionnés.",
    soins: "Alerter immédiatement, assurer ABC, monitorage continu, accès veineux et surveillance rapprochée de la perfusion, conscience, diurèse et réponse au traitement ; préparer les interventions urgentes.",
    complications: "Défaillance multiviscérale, arythmies, arrêt cardiaque, lésions rénales, neurologiques ou hépatiques et décès.",
    education: "L’éducation intervient surtout après stabilisation : adhésion à la prévention secondaire, reconnaissance précoce des symptômes cardiaques et suivi de la maladie responsable.",
    points: "Le choc cardiogénique est une urgence vitale. Hypotension et signes d’hypoperfusion chez un patient cardiaque imposent une reconnaissance et une escalade immédiates."
  }
];
