import type { SujetMaternite } from "@/lib/cours/maternite";

const edu = "Expliquer les signes d’alarme avant la sortie, vérifier la compréhension de la mère et de la famille et préciser où consulter rapidement en cas d’aggravation.";

export const complementsPostpartum: SujetMaternite[] = [
  {
    nom: "Hypertension et pré-éclampsie du postpartum",
    definition: "Persistance, aggravation ou apparition d’un trouble hypertensif après l’accouchement, pouvant évoluer vers une pré-éclampsie sévère ou une éclampsie même après une grossesse sans diagnostic antérieur.",
    physiopathologie: "La dysfonction endothéliale et les mécanismes de la pré-éclampsie ne disparaissent pas immédiatement après la délivrance; des complications neurologiques, hépatiques, rénales ou pulmonaires peuvent apparaître dans le postpartum.",
    risques: "Pré-éclampsie ou hypertension pendant la grossesse, maladie rénale, diabète, obésité, grossesse multiple et antécédents hypertensifs; une forme postpartum peut aussi survenir sans antécédent connu.",
    manifestations: "Hypertension, céphalée persistante ou intense, troubles visuels, douleur épigastrique ou de l'hypochondre droit, nausées, dyspnée, œdème pulmonaire, hyperréflexie ou convulsions.",
    examens: "Mesures répétées de la pression artérielle, évaluation neurologique et respiratoire, plaquettes, créatinine, enzymes hépatiques et autres bilans selon la présentation clinique.",
    traitement: "Antihypertenseurs pour hypertension sévère et sulfate de magnésium lorsqu’indiqué pour prévention ou traitement des convulsions, avec prise en charge urgente des complications selon protocole.",
    soins: "Mesurer correctement la pression, rechercher symptômes neurologiques et respiratoires, surveiller diurèse et toxicité du magnésium si administré et assurer une escalade rapide des signes sévères.",
    complications: "Éclampsie, AVC, HELLP, œdème pulmonaire, insuffisance rénale, atteinte hépatique et décès maternel.",
    education: edu + " Insister sur céphalée intense, vision trouble, douleur épigastrique, dyspnée ou convulsion, qui nécessitent une évaluation urgente même après le retour à domicile.",
    points: "L’accouchement ne met pas immédiatement fin au risque de pré-éclampsie; une hypertension sévère postpartum est une urgence.",
    priorite: "Devant hypertension sévère, symptômes neurologiques, dyspnée ou convulsion: ABC, protection contre les traumatismes, alerte obstétricale immédiate et traitements prescrits sans banaliser les symptômes comme fatigue postpartum."
  },
  {
    nom: "Thromboembolie veineuse du postpartum",
    definition: "Thrombose veineuse profonde ou embolie pulmonaire survenant dans une période où le risque thrombotique est augmenté par les changements de la grossesse, l’accouchement et l’immobilité.",
    physiopathologie: "Hypercoagulabilité, stase veineuse et lésion vasculaire favorisent la formation d’un thrombus; sa migration vers les artères pulmonaires peut provoquer une obstruction aiguë et une défaillance cardiopulmonaire.",
    risques: "Antécédent de TEV ou thrombophilie, césarienne, immobilité, obésité, hémorragie/infection, âge maternel élevé et autres facteurs cliniques cumulés.",
    manifestations: "TVP: douleur et gonflement unilatéral d’un membre, chaleur ou sensibilité. Embolie pulmonaire: dyspnée brutale, douleur thoracique, tachycardie, hypoxémie, syncope ou collapsus.",
    examens: "Évaluation clinique urgente, imagerie veineuse ou pulmonaire et bilans selon protocole; ne pas retarder la stabilisation d’une patiente instable.",
    traitement: "Anticoagulation selon diagnostic et protocole; une embolie pulmonaire avec instabilité nécessite une prise en charge urgente spécialisée.",
    soins: "Évaluer respiration, saturation, circulation et douleur; ne pas masser un membre suspect de TVP; favoriser mobilisation précoce lorsqu’elle est sûre et appliquer la prophylaxie prescrite.",
    complications: "Embolie pulmonaire massive, choc obstructif, hypoxie, récidive et décès.",
    education: edu + " Enseigner que dyspnée soudaine, douleur thoracique, syncope ou gonflement unilatéral d’une jambe exigent une consultation urgente.",
    points: "Une dyspnée aiguë postpartum ne doit jamais être automatiquement attribuée à l’anxiété ou à la fatigue.",
    priorite: "Dyspnée brutale, douleur thoracique, hypoxémie ou syncope: traiter comme une embolie pulmonaire potentielle, stabiliser ABC et activer immédiatement l’évaluation urgente."
  },
  {
    nom: "Infection de plaie, périnée et complications de césarienne",
    definition: "Infection postpartum touchant une incision de césarienne, une épisiotomie, une déchirure périnéale ou d’autres tissus lésés pendant l’accouchement.",
    physiopathologie: "La rupture de la barrière cutanéo-muqueuse permet une inoculation microbienne; une infection locale peut progresser vers les tissus profonds ou un sepsis.",
    risques: "Césarienne, travail prolongé, rupture prolongée des membranes, obésité, diabète, anémie, hématome, contamination et soins de plaie inadéquats.",
    manifestations: "Douleur croissante, rougeur, chaleur, œdème, écoulement purulent, désunion, odeur anormale ou fièvre; une douleur disproportionnée ou une détérioration rapide est préoccupante.",
    examens: "Inspection de la plaie/périnée, température et signes vitaux, évaluation de la douleur; prélèvements et bilans selon sévérité et suspicion de propagation systémique.",
    traitement: "Soins locaux et antibiothérapie selon infection et protocole; drainage ou intervention chirurgicale lorsque nécessaire; prise en charge urgente si sepsis ou infection profonde.",
    soins: "Observer et documenter la plaie, maintenir hygiène et technique appropriée, surveiller fièvre et perfusion, administrer traitements prescrits et favoriser nutrition/hydratation adaptées.",
    complications: "Abcès, désunion, infection profonde, fasciite nécrosante, sepsis et retard de cicatrisation.",
    education: edu + " Montrer les soins d’hygiène et demander de signaler rougeur qui s’étend, écoulement, fièvre ou douleur qui augmente.",
    points: "L’augmentation progressive de la douleur ou une détérioration générale doit faire rechercher une infection même si la plaie paraît peu impressionnante.",
    priorite: "Fièvre avec hypotension, tachypnée, confusion, mauvaise perfusion ou douleur disproportionnée: suspecter infection sévère/sepsis, évaluer immédiatement et activer la prise en charge urgente."
  },
  {
    nom: "Troubles de l’humeur postpartum et risque suicidaire",
    definition: "Spectre allant du baby blues transitoire à la dépression postpartum et aux urgences psychiatriques sévères, notamment psychose postpartum et risque suicidaire ou infanticide.",
    physiopathologie: "Les changements hormonaux, le manque de sommeil, les facteurs psychosociaux et les vulnérabilités psychiatriques peuvent contribuer à des troubles de l’humeur; la psychose postpartum est une urgence psychiatrique distincte.",
    risques: "Antécédent de dépression, trouble bipolaire ou psychose postpartum, faible soutien, violence, complications obstétricales, stress majeur, privation de sommeil et difficultés sociales.",
    manifestations: "Tristesse persistante, anhédonie, anxiété sévère, culpabilité, retrait, troubles du sommeil au-delà des soins du bébé, difficultés de lien; hallucinations, idées délirantes, agitation, confusion ou idées suicidaires/homicides sont des signes d’urgence.",
    examens: "Dépistage validé selon protocole, entretien clinique direct sur idées suicidaires, sécurité de la mère et du nourrisson, antécédents psychiatriques et facteurs de soutien.",
    traitement: "Soutien psychosocial, psychothérapie et/ou traitement pharmacologique selon diagnostic et compatibilité avec l’allaitement; psychose, risque suicidaire ou danger pour le nourrisson nécessitent une évaluation psychiatrique urgente et un environnement sécurisé.",
    soins: "Écouter sans jugement, poser directement les questions de sécurité, ne pas laisser seule une personne à risque imminent, mobiliser famille/équipe selon sécurité et organiser continuité du suivi.",
    complications: "Suicide, automutilation, atteinte du nourrisson, altération du lien et du fonctionnement familial et chronicisation du trouble.",
    education: edu + " Expliquer que demander de l’aide pour des symptômes psychiques postpartum est un soin médical et préciser les ressources d’urgence disponibles.",
    points: "Le baby blues est fréquent et bref; symptômes persistants, incapacité fonctionnelle, psychose ou idées de mort nécessitent une évaluation clinique.",
    priorite: "Toute idée suicidaire, hallucination, délire, confusion sévère ou menace envers le nourrisson impose sécurisation immédiate de la mère et du bébé et évaluation psychiatrique urgente."
  },
  {
    nom: "Allaitement, engorgement et mastite",
    definition: "L’allaitement nécessite une prise efficace du sein et un drainage régulier; l’engorgement et la mastite sont des problèmes fréquents pouvant provoquer douleur, inflammation et parfois infection.",
    physiopathologie: "Une accumulation de lait et une inflammation peuvent provoquer tension et douleur. Une mastite peut évoluer avec inflammation locale et symptômes systémiques et parfois former un abcès.",
    risques: "Mauvaise prise du sein, drainage insuffisant, tétées espacées, pression sur le sein, lésions mamelonnaires et antécédent de mastite.",
    manifestations: "Engorgement: seins tendus et douloureux. Mastite: zone rouge/douloureuse, chaleur, malaise, fièvre ou symptômes pseudo-grippaux; masse persistante ou fluctuation évoque un abcès.",
    examens: "Évaluation de l’allaitement, du sein et de l’état général; examens complémentaires ou culture selon sévérité, récidive ou absence d’amélioration.",
    traitement: "Optimiser le drainage et la technique d’allaitement, mesures de confort et analgésie compatibles; antibiothérapie lorsqu’une infection bactérienne est suspectée selon protocole; drainage si abcès.",
    soins: "Observer une tétée si possible, corriger position/prise, soutenir hydratation et repos, surveiller fièvre et extension de l’inflammation et orienter si aggravation.",
    complications: "Abcès mammaire, interruption non souhaitée de l’allaitement, déshydratation ou infection systémique rare.",
    education: edu + " Encourager une aide précoce pour douleur, mauvaise prise ou fièvre et éviter un sevrage brutal non nécessaire sans évaluation.",
    points: "Une bonne technique et un drainage physiologique du sein sont essentiels; une fièvre persistante ou une détérioration nécessite une réévaluation.",
    priorite: "Devant fièvre élevée persistante, hypotension, tachypnée, confusion ou extension rapide de l’inflammation, rechercher une infection sévère et escalader rapidement plutôt que de traiter uniquement comme un problème d’allaitement."
  }
];
