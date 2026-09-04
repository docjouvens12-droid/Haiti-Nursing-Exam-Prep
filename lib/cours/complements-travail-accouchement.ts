import type { SujetMaternite } from "@/lib/cours/maternite";

const edu = "Expliquer les soins et les signes d’alarme avec des mots simples, respecter les préférences de la femme, vérifier la compréhension et préciser quand une intervention urgente est nécessaire.";

export const complementsTravailAccouchement: SujetMaternite[] = [
  {
    nom: "Rupture des membranes pendant le travail",
    definition: "Rupture spontanée ou artificielle des membranes amniotiques au cours du travail, nécessitant une réévaluation maternelle et fœtale et une surveillance du risque infectieux.",
    physiopathologie: "La rupture libère le liquide amniotique et supprime une barrière contre l’ascension microbienne. Si la présentation est haute ou mal engagée, le cordon peut descendre et être comprimé.",
    risques: "Présentation non engagée ou anormale, hydramnios, prématurité, rupture prolongée, examens vaginaux répétés et infection génitale.",
    manifestations: "Écoulement de liquide vaginal; la couleur, l’odeur et la quantité doivent être observées. Fièvre, douleur utérine, liquide malodorant ou anomalies fœtales sont préoccupants.",
    examens: "Noter l’heure de rupture, évaluer immédiatement le rythme cardiaque fœtal, la présentation, les constantes maternelles et les signes d’infection; confirmer la rupture selon protocole si nécessaire.",
    traitement: "Conduite selon terme, progression du travail, état materno-fœtal et signes infectieux; limiter les examens vaginaux digitaux non nécessaires après rupture.",
    soins: "Observer le liquide, contrôler température et rythme fœtal, appliquer l’asepsie, surveiller contractions et progression et signaler rapidement toute anomalie.",
    complications: "Procidence du cordon, infection intra-amniotique, détresse fœtale et complications liées à un travail prolongé.",
    education: edu + " Expliquer pourquoi toute modification de la couleur ou de l’odeur du liquide, fièvre ou diminution des mouvements doit être signalée.",
    points: "Après rupture des membranes, une modification brutale du rythme fœtal impose de rechercher immédiatement une compression ou une procidence du cordon.",
    priorite: "Évaluer le rythme cardiaque fœtal immédiatement après la rupture des membranes et déclencher une prise en charge urgente en cas de bradycardie persistante, décélérations sévères ou cordon visible/palpable."
  },
  {
    nom: "Anomalies du rythme cardiaque fœtal et réponse intrapartum",
    definition: "Altérations persistantes ou préoccupantes du rythme cardiaque fœtal pouvant traduire une diminution de l’oxygénation et nécessitant une évaluation rapide du contexte clinique.",
    physiopathologie: "Une diminution des échanges utéroplacentaires, une compression du cordon, une hypotension maternelle ou une activité utérine excessive peuvent réduire l’oxygénation fœtale.",
    risques: "Hyperstimulation utérine, hypotension, décollement placentaire, procidence/compression du cordon, infection, retard de croissance et pathologie maternelle ou placentaire.",
    manifestations: "Bradycardie persistante, décélérations répétées ou prolongées, variabilité anormale ou autres modifications préoccupantes selon la méthode de surveillance utilisée.",
    examens: "Réévaluer rythme fœtal, contractions, signes vitaux maternels, position, médicaments/perfusion d’ocytocine et rechercher une cause réversible ou une urgence obstétricale.",
    traitement: "Corriger rapidement les causes réversibles selon protocole: repositionnement maternel, traitement de l’hypotension, réduction/arrêt des agents utérotoniques si tachysystolie et préparation à une naissance urgente si anomalie persistante.",
    soins: "Rester auprès de la patiente, appeler l’équipe, documenter chronologie et interventions, surveiller réponse fœtale et maternelle et préparer le matériel nécessaire à une intervention urgente.",
    complications: "Hypoxie, acidose, encéphalopathie hypoxo-ischémique, naissance opératoire urgente et décès fœtal.",
    education: edu,
    points: "Le tracé fœtal doit toujours être interprété avec les contractions et l’état maternel; une anomalie persistante ne doit pas être simplement observée sans réévaluation.",
    priorite: "Devant une anomalie fœtale persistante, évaluer simultanément mère, contractions et causes réversibles, arrêter l’ocytocine si elle contribue à une tachysystolie selon protocole et alerter immédiatement l’équipe obstétricale."
  },
  {
    nom: "Induction, augmentation du travail et sécurité de l’ocytocine",
    definition: "Utilisation de méthodes mécaniques ou médicamenteuses pour déclencher ou renforcer le travail lorsqu’une indication maternelle ou fœtale justifie la naissance.",
    physiopathologie: "L’ocytocine augmente la fréquence et l’intensité des contractions. Une stimulation excessive peut diminuer le temps de perfusion placentaire entre les contractions et compromettre l’oxygénation fœtale.",
    risques: "Dose excessive ou augmentation trop rapide, utérus cicatriciel selon contexte, disproportion ou obstruction, anomalies fœtales et surveillance insuffisante.",
    manifestations: "Contractions trop fréquentes ou prolongées, douleur anormale, anomalies du rythme fœtal ou absence de progression malgré une activité utérine importante.",
    examens: "Avant et pendant l’administration: indication, état cervical, présentation, rythme fœtal, contractions, signes vitaux et progression du travail selon protocole.",
    traitement: "Titrer l’ocytocine selon protocole et réponse. En cas de tachysystolie avec anomalie fœtale, réduire ou interrompre l’ocytocine et mettre en œuvre les mesures correctrices prescrites; rechercher une complication si douleur ou détérioration brutale.",
    soins: "Utiliser une pompe contrôlée selon protocole, vérifier solution/débit, surveiller contractions et rythme fœtal, documenter les modifications et ne jamais augmenter automatiquement une perfusion en présence d’un tracé préoccupant.",
    complications: "Tachysystolie, hypoxie fœtale, rupture utérine dans certaines situations, hémorragie postpartum et naissance urgente.",
    education: edu + " Expliquer l’objectif de l’induction et la raison de la surveillance rapprochée.",
    points: "L’ocytocine est un médicament à haut risque en obstétrique et exige une surveillance materno-fœtale et un protocole de titration rigoureux.",
    priorite: "Si tachysystolie ou anomalie fœtale apparaît sous ocytocine, interrompre ou réduire immédiatement la stimulation selon protocole, repositionner et évaluer la mère, puis alerter l’équipe si l’anomalie persiste."
  },
  {
    nom: "Travail prolongé, dystocie et arrêt de progression",
    definition: "Progression anormalement lente ou arrêtée du travail, à interpréter selon le stade du travail et l’ensemble de la situation maternelle et fœtale.",
    physiopathologie: "Des contractions inefficaces, une malposition, une disproportion fœto-pelvienne, une obstruction ou d’autres facteurs peuvent empêcher dilatation ou descente malgré le temps écoulé.",
    risques: "Malposition ou macrosomie, anomalies pelviennes, travail induit, épuisement maternel, analgésie selon contexte et antécédents obstétricaux.",
    manifestations: "Progression cervicale ou descente insuffisante, travail très prolongé, fatigue, déshydratation ou anomalies materno-fœtales associées.",
    examens: "Réévaluer contractions, dilatation/descente, position et présentation fœtales, vessie, hydratation, douleur, signes vitaux et bien-être fœtal; rechercher obstruction avant d’intensifier les contractions.",
    traitement: "Soutien et correction des facteurs réversibles; augmentation du travail ou naissance opératoire uniquement lorsqu’indiquée après évaluation obstétricale.",
    soins: "Soutenir mobilité/positions appropriées, hydratation, vidange vésicale et analgésie; surveiller épuisement, infection et état fœtal et documenter la progression.",
    complications: "Infection, hémorragie postpartum, traumatisme, rupture utérine en cas d’obstruction non reconnue et détresse fœtale.",
    education: edu + " Expliquer que la durée seule ne suffit pas à décider d’une intervention et que mère et fœtus sont réévalués ensemble.",
    points: "Avant d’augmenter les contractions, il faut exclure une obstruction ou une autre cause pour laquelle davantage de stimulation serait dangereuse.",
    priorite: "Si absence de progression s’accompagne de détérioration maternelle, douleur anormale, saignement ou anomalie fœtale, arrêter toute escalade routinière et obtenir une réévaluation obstétricale urgente."
  },
  {
    nom: "Naissance instrumentale et césarienne urgente",
    definition: "Interventions obstétricales utilisées lorsque la naissance vaginale spontanée n’est pas sûre ou ne progresse pas et qu’une naissance accélérée est indiquée.",
    physiopathologie: "Une menace maternelle ou fœtale, une dystocie ou un arrêt de progression peut rendre nécessaire une extraction instrumentale ou une césarienne afin de réduire le délai jusqu’à la naissance.",
    risques: "Anomalies persistantes du rythme fœtal, arrêt de progression, malprésentation, complications placentaires, prolapsus du cordon et certaines urgences maternelles.",
    manifestations: "La nécessité est déterminée par l’évaluation obstétricale; une détérioration fœtale ou maternelle peut imposer une préparation très rapide.",
    examens: "Confirmer indication, présentation/position et état materno-fœtal; vérifier identité, allergies, accès IV, bilans disponibles et préparation opératoire selon urgence.",
    traitement: "Extraction par ventouse/forceps ou césarienne selon indication, conditions cliniques et compétences disponibles.",
    soins: "Préparer patiente, équipe et nouveau-né, maintenir surveillance fœtale jusqu’à l’intervention lorsque possible, assurer communication/consentement adapté à l’urgence et anticiper hémorragie et réanimation néonatale.",
    complications: "Traumatismes maternels ou néonataux, hémorragie, infection, complications anesthésiques et difficultés respiratoires néonatales selon contexte.",
    education: edu + " Après stabilisation, expliquer clairement la raison de l’intervention et les surveillances postpartum et néonatales nécessaires.",
    points: "Une naissance urgente exige coordination, communication et préparation simultanées de la mère et du nouveau-né.",
    priorite: "En urgence maternelle ou fœtale, activer sans délai la chaîne obstétricale, poursuivre la stabilisation maternelle et préparer simultanément naissance, anesthésie et réanimation néonatale."
  }
];
