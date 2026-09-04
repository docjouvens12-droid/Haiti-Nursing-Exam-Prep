import type { SujetMaternite } from "@/lib/cours/maternite";

const edu = "Expliquer les soins au nouveau-né avec des mots simples, vérifier la compréhension des parents et enseigner les signes nécessitant une consultation urgente.";

export const complementsNouveauNe: SujetMaternite[] = [
  {
    nom: "Adaptation néonatale et soins essentiels à la naissance",
    definition: "Transition physiologique immédiate de la vie intra-utérine à la respiration aérienne, accompagnée des soins essentiels visant respiration, chaleur, alimentation et prévention des complications.",
    physiopathologie: "Les premières respirations expandent les poumons, diminuent la résistance vasculaire pulmonaire et modifient progressivement la circulation fœtale. Le nouveau-né perd rapidement de la chaleur et dépend de réserves métaboliques limitées.",
    risques: "Prématurité, petit poids, infection maternelle, souffrance fœtale, césarienne, anomalies congénitales et complications du travail.",
    manifestations: "Respiration spontanée régulière, coloration et tonus satisfaisants et adaptation progressive sont rassurants; apnée, gasping, cyanose centrale persistante, hypotonie ou mauvaise perfusion sont préoccupants.",
    examens: "Évaluation immédiate de respiration, fréquence cardiaque, tonus, coloration/perfusion et température; score d'Apgar selon pratique, sans retarder une réanimation nécessaire.",
    traitement: "Sécher et maintenir au chaud, contact peau à peau si stable, soutien respiratoire si nécessaire, soins du cordon et initiation précoce de l’allaitement lorsque mère et enfant sont stables.",
    soins: "Préparer matériel avant la naissance, prévenir hypothermie, observer respiration et température, favoriser peau à peau et allaitement, identifier correctement le nouveau-né et appliquer prévention de l’infection.",
    complications: "Détresse respiratoire, hypothermie, hypoglycémie, infection, mauvaise transition cardiovasculaire et décès néonatal.",
    education: edu + " Montrer le maintien au chaud, l’allaitement et les soins hygiéniques du cordon.",
    points: "L’Apgar décrit l’état du nouveau-né à des temps définis mais ne remplace jamais l’évaluation ABC ni ne doit retarder une réanimation.",
    priorite: "À la naissance, déterminer immédiatement si le nouveau-né respire efficacement et maintient une fréquence cardiaque adéquate; si non, commencer sans délai les étapes de réanimation appropriées tout en prévenant l’hypothermie."
  },
  {
    nom: "Détresse respiratoire et réanimation néonatale initiale",
    definition: "Insuffisance de l’adaptation respiratoire à la naissance ou détérioration respiratoire précoce nécessitant une intervention rapide et structurée.",
    physiopathologie: "Une ventilation pulmonaire insuffisante empêche l’oxygénation et la chute normale de la résistance pulmonaire, entraînant bradycardie, hypoxie et atteinte multiviscérale si elle persiste.",
    risques: "Prématurité, liquide méconial avec dépression, infection, asphyxie, césarienne, anomalies pulmonaires ou cardiaques et médicaments maternels dépresseurs.",
    manifestations: "Apnée ou gasping, tirage, geignement, battement des ailes du nez, cyanose centrale, mauvaise saturation selon âge postnatal et bradycardie.",
    examens: "Évaluer respiration et fréquence cardiaque immédiatement; utiliser oxymétrie et autres examens selon évolution sans retarder ventilation lorsqu’elle est indiquée.",
    traitement: "Assurer chaleur, positionner voies aériennes et stimuler lorsque approprié; la ventilation à pression positive est l’intervention clé si apnée/gasping ou fréquence cardiaque insuffisante selon algorithme de réanimation; escalader si réponse inadéquate.",
    soins: "Anticiper les naissances à risque, vérifier masque/dispositif de ventilation, surveiller efficacité par mouvement thoracique et fréquence cardiaque, coordonner l’équipe et documenter les étapes.",
    complications: "Hypoxie, acidose, encéphalopathie hypoxo-ischémique, pneumothorax, défaillance d’organes et décès.",
    education: edu + " Après stabilisation, expliquer aux parents les interventions réalisées et la surveillance nécessaire.",
    points: "Chez un nouveau-né apnéique ou en gasping, une ventilation efficace est prioritaire; la fréquence cardiaque guide la réponse à la réanimation.",
    priorite: "Apnée, gasping ou bradycardie: assurer rapidement une ventilation efficace selon protocole de réanimation néonatale et réévaluer la fréquence cardiaque plutôt que perdre du temps avec des stimulations répétées."
  },
  {
    nom: "Thermorégulation et prévention de l’hypothermie",
    definition: "Maintien de la température corporelle dans une plage sûre malgré la grande surface corporelle et les capacités limitées de thermogenèse du nouveau-né.",
    physiopathologie: "Le nouveau-né perd de la chaleur par évaporation, conduction, convection et radiation; l’hypothermie augmente la consommation d’oxygène et de glucose et peut aggraver détresse respiratoire et hypoglycémie.",
    risques: "Prématurité, faible poids, environnement froid, peau humide, séparation mère-enfant, maladie et réanimation prolongée.",
    manifestations: "Température basse, peau froide, léthargie, mauvaise alimentation, hypoglycémie, tachypnée ou détresse respiratoire.",
    examens: "Mesurer régulièrement la température avec une méthode appropriée et rechercher simultanément hypoglycémie, infection ou détresse chez un nouveau-né symptomatique.",
    traitement: "Séchage immédiat, peau à peau et couverture/bonnet selon contexte, environnement thermique adapté ou dispositif chauffant pour enfant malade/prématuré; réchauffement surveillé.",
    soins: "Maintenir une chaîne du chaud depuis la naissance, limiter exposition inutile, surveiller température pendant transport et soins et soutenir peau à peau/kangourou lorsque cliniquement approprié.",
    complications: "Hypoglycémie, hypoxie, acidose, détresse respiratoire, troubles de coagulation et augmentation de la morbidité/mortalité.",
    education: edu + " Enseigner peau à peau, vêtements adaptés et signes de froid ou de maladie.",
    points: "Prévenir l’hypothermie est plus sûr que devoir corriger une hypothermie installée.",
    priorite: "Un nouveau-né froid et symptomatique doit être réchauffé de façon contrôlée tout en recherchant immédiatement hypoglycémie, infection et détresse respiratoire."
  },
  {
    nom: "Hypoglycémie néonatale",
    definition: "Concentration de glucose insuffisante pour les besoins du nouveau-né, particulièrement importante chez les enfants à risque ou symptomatiques.",
    physiopathologie: "Après interruption de l’apport placentaire, le nouveau-né dépend de ses réserves, de la glycogénolyse et de l’alimentation. Prématurité, hyperinsulinisme ou maladie peuvent déséquilibrer cette adaptation.",
    risques: "Enfant de mère diabétique, prématurité, petit ou grand poids pour l’âge gestationnel, hypothermie, infection, détresse respiratoire et alimentation insuffisante.",
    manifestations: "Tremblements, irritabilité, léthargie, hypotonie, mauvaise succion, apnée, cyanose, hypothermie ou convulsions; certains nouveau-nés sont asymptomatiques.",
    examens: "Dépistage glycémique ciblé des nouveau-nés à risque et mesure immédiate chez tout enfant symptomatique, avec confirmation selon protocole lorsque nécessaire.",
    traitement: "Alimentation précoce et fréquente lorsque l’enfant est stable; gel de glucose ou glucose IV selon valeur, symptômes et protocole; traiter la cause associée.",
    soins: "Maintenir chaleur, favoriser alimentation, surveiller glycémies et signes neurologiques, vérifier réponse au traitement et éviter les interruptions prolongées d’apport nutritionnel.",
    complications: "Convulsions, atteinte neurologique et complications de la maladie sous-jacente en cas d’hypoglycémie sévère ou prolongée.",
    education: edu + " Expliquer l’importance des tétées régulières et les signes de mauvaise alimentation ou de léthargie.",
    points: "Un nouveau-né symptomatique à risque doit avoir sa glycémie vérifiée rapidement; le traitement ne doit pas être retardé si l’état est sévère.",
    priorite: "Convulsion, apnée, altération neurologique ou glycémie très basse: stabiliser ABC, corriger rapidement le glucose selon protocole et rechercher une cause associée."
  },
  {
    nom: "Ictère néonatal et hyperbilirubinémie",
    definition: "Coloration jaune liée à l’élévation de bilirubine; elle est souvent physiologique mais certaines formes précoces, rapides ou importantes exposent à une neurotoxicité.",
    physiopathologie: "Le renouvellement élevé des globules rouges et l’immaturité hépatique augmentent la bilirubine non conjuguée. Une hémolyse, infection ou mauvaise alimentation peut majorer l’accumulation.",
    risques: "Prématurité, incompatibilité sanguine/allo-immunisation, hémolyse, ecchymoses importantes, déficit enzymatique selon population, infection et apport lacté insuffisant.",
    manifestations: "Ictère cutanéo-muqueux; léthargie, mauvaise succion, hypotonie puis hypertonie, cri aigu ou convulsions suggèrent une atteinte neurologique sévère.",
    examens: "Mesure de bilirubine transcutanée ou sérique interprétée selon âge en heures, terme et facteurs de risque; bilan d’hémolyse ou infection si indiqué.",
    traitement: "Optimiser alimentation; photothérapie selon seuils adaptés à l’âge/risque; prise en charge intensive et échange transfusionnel dans certaines hyperbilirubinémies sévères selon protocole spécialisé.",
    soins: "Surveiller progression, alimentation, hydratation et élimination; sous photothérapie assurer exposition et protection appropriées selon dispositif et contrôler bilirubine/température selon protocole.",
    complications: "Encéphalopathie bilirubinique aiguë et kernictère avec séquelles neurologiques permanentes.",
    education: edu + " Un ictère dans les premières 24 heures, qui s’intensifie rapidement, ou associé à mauvaise alimentation/léthargie nécessite une évaluation rapide.",
    points: "La décision thérapeutique dépend du taux de bilirubine, de l’âge postnatal en heures, du terme et des facteurs de risque, pas de la couleur seule.",
    priorite: "Ictère très précoce, progression rapide ou signes neurologiques: mesurer rapidement la bilirubine, rechercher hémolyse/infection et escalader sans attendre l’apparition d’un ictère plus marqué."
  },
  {
    nom: "Infection néonatale et sepsis",
    definition: "Infection systémique du nouveau-né pouvant progresser rapidement avec des signes initiaux peu spécifiques.",
    physiopathologie: "L’immaturité immunitaire permet une dissémination rapide des agents infectieux acquis avant, pendant ou après la naissance, pouvant provoquer choc et défaillance multiviscérale.",
    risques: "Prématurité, rupture prolongée des membranes, infection/fièvre maternelle, procédures invasives, faible poids et exposition nosocomiale.",
    manifestations: "Instabilité thermique, mauvaise alimentation, léthargie ou irritabilité, apnée, tachypnée, détresse respiratoire, mauvaise perfusion, distension abdominale ou convulsions.",
    examens: "Évaluation clinique urgente, cultures et bilans biologiques selon protocole; ponction lombaire lorsque indiquée et état compatible, sans retarder les antibiotiques chez un enfant gravement malade.",
    traitement: "Antibiothérapie empirique rapide adaptée à l’âge et au contexte après prélèvements si cela ne retarde pas le traitement, puis adaptation aux résultats; soutien respiratoire/circulatoire et glycémique.",
    soins: "Surveiller respiration, perfusion, température, glycémie, diurèse et alimentation; maintenir asepsie stricte, administrer traitements à l’heure et reconnaître précocement le choc.",
    complications: "Choc septique, méningite, insuffisance respiratoire, atteinte neurologique, défaillance multiviscérale et décès.",
    education: edu + " Enseigner fièvre ou température basse, refus de téter, somnolence inhabituelle, respiration difficile et convulsions comme signes d’alarme.",
    points: "Chez le nouveau-né, une infection grave peut se manifester par une température basse plutôt que par de la fièvre.",
    priorite: "Apnée, mauvaise perfusion, léthargie marquée, instabilité thermique ou détresse respiratoire: suspecter sepsis, stabiliser ABC, obtenir les prélèvements sans retard injustifié et administrer rapidement les antimicrobiens prescrits."
  },
  {
    nom: "Prématurité, faible poids et soins kangourou",
    definition: "La prématurité et le faible poids augmentent la vulnérabilité respiratoire, thermique, métabolique, nutritionnelle et infectieuse et nécessitent des soins adaptés au niveau de stabilité.",
    physiopathologie: "L’immaturité pulmonaire, neurologique, digestive, immunitaire et de la thermorégulation réduit les réserves et la capacité d’adaptation extra-utérine.",
    risques: "Travail prématuré, grossesse multiple, infection, hypertension/pré-éclampsie, retard de croissance et complications placentaires.",
    manifestations: "Petit poids, faible tissu adipeux, hypotonie relative, difficultés de succion-déglutition, instabilité thermique, apnées ou détresse respiratoire selon terme.",
    examens: "Âge gestationnel, poids et croissance, température, respiration/saturation selon indication, glycémie et capacité d’alimentation; surveillance des complications spécifiques au terme.",
    traitement: "Soutien respiratoire, thermique et nutritionnel selon besoins; prévention/traitement de l’infection et autres complications. Les soins kangourou/peau à peau sont favorisés lorsqu’ils sont appropriés, avec surveillance adaptée.",
    soins: "Réduire pertes thermiques, soutenir lait maternel, surveiller apnées et alimentation, appliquer prévention de l’infection, impliquer les parents et organiser suivi après sortie.",
    complications: "Détresse respiratoire, apnée, hypothermie, hypoglycémie, infection, troubles nutritionnels et complications du développement.",
    education: edu + " Enseigner soins kangourou lorsqu’indiqués, alimentation, chaleur, hygiène et rendez-vous de suivi.",
    points: "Le prématuré peut se détériorer rapidement avec des signes discrets; température, respiration, alimentation et glycémie méritent une vigilance particulière.",
    priorite: "Chez un prématuré instable, prioriser respiration, température et glucose; chez l’enfant stabilisé, soutenir continuité du peau à peau/kangourou et alimentation avec surveillance appropriée."
  }
];
