export type StudyTopic = {
  title: string;
  subtopics: readonly string[];
};

export type StudyCategory = {
  title: string;
  icon: string;
  topics: readonly StudyTopic[];
};

export const studyCategories: readonly StudyCategory[] = [
  {
    "title": "Médecine–Chirurgie",
    "icon": "🩺",
    "topics": [
      {
        "title": "Cardiovasculaire",
        "subtopics": [
          "Anatomie et physiologie cardiovasculaire",
          "Évaluation cardiovasculaire",
          "Hypertension artérielle",
          "Athérosclérose",
          "Maladie coronarienne",
          "Angine de poitrine",
          "Infarctus du myocarde / syndrome coronarien aigu",
          "Insuffisance cardiaque",
          "Œdème pulmonaire cardiogénique",
          "Troubles du rythme / arythmies",
          "ECG et surveillance cardiaque",
          "Valvulopathies",
          "Endocardite",
          "Péricardite",
          "Cardiomyopathies",
          "Maladies artérielles périphériques",
          "Maladies veineuses / thrombose veineuse profonde",
          "Embolie pulmonaire",
          "Anévrisme aortique",
          "Choc cardiogénique",
          "Médicaments cardiovasculaires",
          "Examens diagnostiques cardiovasculaires",
          "Cathétérisme cardiaque",
          "Pacemaker et défibrillateur",
          "Chirurgie cardiaque et soins pré/postopératoires",
          "Éducation du patient et prévention cardiovasculaire",
          "Urgences cardiovasculaires"
        ]
      },
      {
        "title": "Respiratoire",
        "subtopics": [
          "Anatomie et physiologie respiratoire",
          "Évaluation respiratoire",
          "Asthme",
          "Bronchopneumopathie chronique obstructive",
          "Pneumonie",
          "Tuberculose pulmonaire",
          "Bronchectasies",
          "Pleurésie et épanchement pleural",
          "Pneumothorax et hémothorax",
          "Insuffisance respiratoire",
          "Syndrome de détresse respiratoire aiguë",
          "Cancer bronchopulmonaire",
          "Gaz du sang et équilibre acidobasique",
          "Oxygénothérapie",
          "Aérosolthérapie",
          "Drainage thoracique",
          "Trachéotomie et soins associés",
          "Ventilation non invasive et invasive",
          "Examens diagnostiques respiratoires",
          "Chirurgie thoracique et soins périopératoires",
          "Prévention et réadaptation respiratoire"
        ]
      },
      {
        "title": "Neurologie",
        "subtopics": [
          "Anatomie et physiologie du système nerveux",
          "Évaluation neurologique",
          "État de conscience et score de Glasgow",
          "Accident vasculaire cérébral",
          "Accident ischémique transitoire",
          "Épilepsie et crises convulsives",
          "Méningite et encéphalite",
          "Hypertension intracrânienne",
          "Traumatisme crânien",
          "Lésions médullaires",
          "Maladie de Parkinson",
          "Maladie d’Alzheimer et autres démences",
          "Sclérose en plaques",
          "Syndrome de Guillain-Barré",
          "Myasthénie",
          "Neuropathies périphériques",
          "Céphalées et migraines",
          "Tumeurs cérébrales",
          "Examens diagnostiques neurologiques",
          "Neurochirurgie et soins périopératoires",
          "Rééducation et prévention des complications"
        ]
      },
      {
        "title": "Gastro-intestinal",
        "subtopics": [
          "Anatomie et physiologie digestives",
          "Évaluation digestive",
          "Reflux gastro-œsophagien",
          "Gastrite et ulcère gastroduodénal",
          "Hémorragie digestive",
          "Gastro-entérite",
          "Diarrhée et constipation",
          "Appendicite",
          "Occlusion intestinale",
          "Péritonite",
          "Maladie de Crohn et rectocolite hémorragique",
          "Diverticulite",
          "Hépatites",
          "Cirrhose et hypertension portale",
          "Pancréatite",
          "Lithiase biliaire et cholécystite",
          "Cancers digestifs",
          "Nutrition entérale et parentérale",
          "Sondes digestives",
          "Stomies et soins associés",
          "Endoscopie et examens digestifs",
          "Chirurgie digestive et soins périopératoires"
        ]
      },
      {
        "title": "Endocrinologie",
        "subtopics": [
          "Anatomie et physiologie endocriniennes",
          "Évaluation endocrinienne",
          "Diabète de type 1",
          "Diabète de type 2",
          "Hypoglycémie",
          "Acidocétose diabétique",
          "État hyperglycémique hyperosmolaire",
          "Complications chroniques du diabète",
          "Pied diabétique",
          "Autosurveillance glycémique",
          "Hypothyroïdie",
          "Hyperthyroïdie",
          "Nodules et cancers thyroïdiens",
          "Troubles parathyroïdiens et calcémie",
          "Insuffisance surrénalienne",
          "Syndrome de Cushing",
          "Diabète insipide",
          "Sécrétion inappropriée d’hormone antidiurétique",
          "Examens diagnostiques endocriniens",
          "Chirurgie endocrinienne et soins périopératoires",
          "Éducation thérapeutique et nutrition"
        ]
      },
      {
        "title": "Rénal",
        "subtopics": [
          "Anatomie et physiologie rénales",
          "Évaluation rénale et urinaire",
          "Insuffisance rénale aiguë",
          "Maladie rénale chronique",
          "Syndrome néphrotique",
          "Glomérulonéphrite",
          "Infections urinaires",
          "Pyélonéphrite",
          "Lithiase urinaire",
          "Rétention et incontinence urinaires",
          "Troubles hydroélectrolytiques",
          "Équilibre acidobasique",
          "Bilan hydrique et diurèse",
          "Hémodialyse",
          "Dialyse péritonéale",
          "Fistule artérioveineuse et accès de dialyse",
          "Transplantation rénale",
          "Sondage urinaire et soins associés",
          "Examens diagnostiques rénaux",
          "Chirurgie urologique et soins périopératoires",
          "Nutrition et éducation du patient rénal"
        ]
      },
      {
        "title": "Hématologie",
        "subtopics": [
          "Physiologie du sang et hématopoïèse",
          "Évaluation hématologique",
          "Numération formule sanguine",
          "Anémie ferriprive",
          "Anémies mégaloblastiques",
          "Anémies hémolytiques",
          "Drépanocytose",
          "Thalassémies",
          "Leucémies",
          "Lymphomes",
          "Myélome multiple",
          "Thrombopénie",
          "Hémophilie et troubles de la coagulation",
          "Coagulation intravasculaire disséminée",
          "Neutropénie et prévention des infections",
          "Transfusion sanguine",
          "Réactions transfusionnelles",
          "Prélèvements et examens hématologiques",
          "Chimiothérapie et soins de support",
          "Greffe de cellules souches hématopoïétiques"
        ]
      },
      {
        "title": "Infectiologie",
        "subtopics": [
          "Micro-organismes et transmission",
          "Évaluation du patient infecté",
          "Précautions standard et complémentaires",
          "Hygiène des mains",
          "Prélèvements microbiologiques",
          "Infections associées aux soins",
          "Sepsis",
          "VIH et infections opportunistes",
          "Tuberculose",
          "Paludisme",
          "Dengue et chikungunya",
          "Choléra",
          "Fièvre typhoïde",
          "Hépatites virales",
          "Infections sexuellement transmissibles",
          "Infections cutanées et des tissus mous",
          "Tétanos",
          "Parasitoses intestinales",
          "Résistance aux antimicrobiens",
          "Prévention des expositions au sang",
          "Éducation du patient et prévention de la transmission"
        ]
      }
    ]
  },
  {
    "title": "Pédiatrie",
    "icon": "👶",
    "topics": [
      {
        "title": "Nouveau-né",
        "subtopics": [
          "Adaptation à la vie extra-utérine",
          "Évaluation initiale et score d’Apgar",
          "Examen du nouveau-né",
          "Thermorégulation",
          "Soins du cordon ombilical",
          "Allaitement maternel",
          "Alimentation au lait infantile",
          "Ictère néonatal",
          "Hypoglycémie néonatale",
          "Prématurité",
          "Faible poids de naissance",
          "Infections néonatales",
          "Détresse respiratoire néonatale",
          "Dépistages néonatals",
          "Lien parents-enfant",
          "Éducation des parents et retour à domicile"
        ]
      },
      {
        "title": "Croissance et développement",
        "subtopics": [
          "Courbes de croissance",
          "Développement du nourrisson",
          "Développement de la petite enfance",
          "Développement de l’enfant d’âge préscolaire",
          "Développement de l’enfant d’âge scolaire",
          "Développement de l’adolescent",
          "Développement moteur",
          "Langage et communication",
          "Développement cognitif et psychosocial",
          "Alimentation et diversification",
          "Sommeil et routines",
          "Jeu et stimulation",
          "Puberté",
          "Repérage des retards de développement",
          "Accompagnement de l’enfant en situation de handicap",
          "Prévention des accidents selon l’âge"
        ]
      },
      {
        "title": "Maladies pédiatriques",
        "subtopics": [
          "Bronchiolite",
          "Asthme de l’enfant",
          "Pneumonie pédiatrique",
          "Otite et infections ORL",
          "Gastro-entérite et déshydratation",
          "Malnutrition",
          "Anémie de l’enfant",
          "Drépanocytose pédiatrique",
          "Cardiopathies congénitales",
          "Diabète de l’enfant",
          "Infections urinaires pédiatriques",
          "Syndrome néphrotique de l’enfant",
          "Méningite pédiatrique",
          "Maladies éruptives",
          "Infections et affections cutanées",
          "Parasitoses",
          "Douleur chez l’enfant",
          "Maladies chroniques et soutien familial"
        ]
      },
      {
        "title": "Vaccination",
        "subtopics": [
          "Principes de l’immunisation pédiatrique",
          "Calendrier vaccinal de l’enfant",
          "Vaccination du nouveau-né",
          "Rattrapage vaccinal pédiatrique",
          "Contre-indications et précautions",
          "Préparation de l’enfant et des parents",
          "Sites et techniques d’injection selon l’âge",
          "Prévention de la douleur lors de la vaccination",
          "Conservation et chaîne du froid",
          "Effets indésirables postvaccinaux",
          "Carnet et traçabilité des vaccinations",
          "Communication avec les parents"
        ]
      },
      {
        "title": "Urgences pédiatriques",
        "subtopics": [
          "Évaluation initiale de l’enfant",
          "Détresse respiratoire pédiatrique",
          "Obstruction des voies aériennes",
          "Déshydratation sévère",
          "Choc pédiatrique",
          "Sepsis pédiatrique",
          "Convulsions fébriles",
          "État de mal épileptique",
          "Anaphylaxie",
          "Intoxications accidentelles",
          "Brûlures de l’enfant",
          "Traumatismes pédiatriques",
          "Noyade",
          "Urgences diabétiques pédiatriques",
          "Réanimation pédiatrique",
          "Protection de l’enfant et suspicion de maltraitance"
        ]
      }
    ]
  },
  {
    "title": "Maternité–Obstétrique / Gynécologie",
    "icon": "🤰",
    "topics": [
      {
        "title": "Grossesse",
        "subtopics": [
          "Physiologie de la grossesse",
          "Diagnostic et datation de la grossesse",
          "Consultation prénatale",
          "Évaluation maternelle",
          "Croissance et bien-être fœtal",
          "Examens prénatals",
          "Nutrition et suppléments pendant la grossesse",
          "Inconforts courants de la grossesse",
          "Médicaments et grossesse",
          "Prévention des infections maternofœtales",
          "Groupes sanguins et incompatibilité Rhésus",
          "Grossesse à l’adolescence",
          "Santé mentale périnatale",
          "Signes d’alerte pendant la grossesse",
          "Préparation à la naissance",
          "Accompagnement familial"
        ]
      },
      {
        "title": "Travail et accouchement",
        "subtopics": [
          "Physiologie et phases du travail",
          "Admission de la parturiente",
          "Surveillance du travail et partogramme",
          "Surveillance du rythme cardiaque fœtal",
          "Contractions et progression cervicale",
          "Rupture des membranes",
          "Accompagnement et positions pendant le travail",
          "Soulagement de la douleur",
          "Analgésie péridurale et surveillance",
          "Déclenchement et stimulation du travail",
          "Accouchement par voie vaginale",
          "Accouchement instrumental",
          "Césarienne et soins périopératoires",
          "Délivrance",
          "Soins immédiats à la mère et au nouveau-né",
          "Accouchement respectueux et consentement"
        ]
      },
      {
        "title": "Postpartum",
        "subtopics": [
          "Évaluation de la mère après l’accouchement",
          "Involution utérine et lochies",
          "Surveillance des saignements",
          "Soins périnéaux",
          "Soins après césarienne",
          "Douleur du postpartum",
          "Allaitement et lactation",
          "Engorgement et mastite",
          "Élimination urinaire et intestinale",
          "Mobilisation et prévention thromboembolique",
          "Fatigue et sommeil",
          "Baby blues et dépression du postpartum",
          "Relation mère-enfant",
          "Contraception du postpartum",
          "Signes d’alerte après la naissance",
          "Suivi postnatal et retour à domicile"
        ]
      },
      {
        "title": "Complications obstétricales",
        "subtopics": [
          "Grossesse extra-utérine",
          "Fausse couche",
          "Grossesse molaire",
          "Hyperémèse gravidique",
          "Hypertension gestationnelle",
          "Prééclampsie et éclampsie",
          "Syndrome HELLP",
          "Diabète gestationnel",
          "Placenta prævia",
          "Décollement placentaire",
          "Rupture prématurée des membranes",
          "Menace d’accouchement prématuré",
          "Infection intra-amniotique",
          "Procidence du cordon",
          "Dystocie des épaules",
          "Rupture utérine",
          "Hémorragie du postpartum",
          "Infections du postpartum",
          "Maladie thromboembolique pendant la grossesse",
          "Retard de croissance fœtale",
          "Grossesse multiple",
          "Deuil périnatal"
        ]
      },
      {
        "title": "Santé reproductive",
        "subtopics": [
          "Anatomie et physiologie reproductives",
          "Cycle menstruel",
          "Consultation et examen gynécologiques",
          "Contraception",
          "Infections sexuellement transmissibles",
          "Infections vaginales",
          "Douleurs pelviennes",
          "Endométriose",
          "Fibromes utérins",
          "Troubles menstruels",
          "Infertilité",
          "Ménopause",
          "Dépistage du cancer du col de l’utérus",
          "Santé mammaire",
          "Prolapsus et troubles du plancher pelvien",
          "Chirurgie gynécologique et soins associés",
          "Violences sexuelles et accompagnement"
        ]
      }
    ]
  },
  {
    "title": "Pharmacologie",
    "icon": "💊",
    "topics": [
      {
        "title": "Principes pharmacologiques",
        "subtopics": [
          "Pharmacocinétique",
          "Pharmacodynamie",
          "Voies d’administration",
          "Formes pharmaceutiques",
          "Indications et contre-indications",
          "Effets indésirables",
          "Interactions médicamenteuses",
          "Allergies médicamenteuses",
          "Marge thérapeutique et surveillance",
          "Médicaments à haut risque",
          "Adaptation à l’âge et aux fonctions rénale et hépatique",
          "Médicaments pendant la grossesse et l’allaitement",
          "Observance et éducation thérapeutique",
          "Pharmacovigilance",
          "Stockage et conservation"
        ]
      },
      {
        "title": "Antibiotiques",
        "subtopics": [
          "Principes de l’antibiothérapie",
          "Pénicillines",
          "Céphalosporines",
          "Carbapénèmes",
          "Macrolides",
          "Aminosides",
          "Fluoroquinolones",
          "Tétracyclines",
          "Glycopeptides",
          "Sulfamides et triméthoprime",
          "Nitro-imidazolés",
          "Antituberculeux",
          "Antibiogramme",
          "Allergies et réactions indésirables",
          "Surveillance rénale et auditive",
          "Administration et compatibilités",
          "Résistance bactérienne et bon usage",
          "Éducation du patient sous antibiotiques"
        ]
      },
      {
        "title": "Médicaments cardiovasculaires",
        "subtopics": [
          "Antihypertenseurs",
          "Diurétiques",
          "Inhibiteurs de l’enzyme de conversion",
          "Antagonistes des récepteurs de l’angiotensine II",
          "Bêtabloquants",
          "Inhibiteurs calciques",
          "Dérivés nitrés",
          "Antiarythmiques",
          "Digoxine",
          "Anticoagulants",
          "Antiagrégants plaquettaires",
          "Thrombolytiques",
          "Hypolipémiants",
          "Vasopresseurs et inotropes",
          "Surveillance tensionnelle et cardiaque",
          "Surveillance biologique",
          "Interactions et éducation du patient"
        ]
      },
      {
        "title": "Analgésiques",
        "subtopics": [
          "Évaluation de la douleur",
          "Paracétamol",
          "Anti-inflammatoires non stéroïdiens",
          "Opioïdes",
          "Coanalgésiques",
          "Anesthésiques locaux",
          "Voies d’administration des antalgiques",
          "Analgésie contrôlée par le patient",
          "Surveillance de la sédation et de la respiration",
          "Prévention des effets indésirables",
          "Antagonistes des opioïdes",
          "Douleur aiguë et douleur chronique",
          "Antalgie chez l’enfant et la personne âgée",
          "Approches non médicamenteuses complémentaires"
        ]
      },
      {
        "title": "Insulines",
        "subtopics": [
          "Physiologie de l’insuline",
          "Insulines rapides et ultrarapides",
          "Insulines à action intermédiaire",
          "Insulines lentes et ultralentes",
          "Insulines prémélangées",
          "Schémas d’insulinothérapie",
          "Stylos et seringues à insuline",
          "Sites d’injection et rotation",
          "Pompes à insuline",
          "Conservation des insulines",
          "Surveillance glycémique",
          "Hypoglycémie et sécurité",
          "Insuline intraveineuse et surveillance",
          "Éducation à l’injection",
          "Insulinothérapie et alimentation"
        ]
      },
      {
        "title": "Calculs de doses",
        "subtopics": [
          "Unités et conversions",
          "Proportions et règle de trois",
          "Calcul de dose à partir d’une concentration",
          "Doses selon le poids",
          "Doses selon la surface corporelle",
          "Reconstitution des médicaments",
          "Dilution des solutions",
          "Débit de perfusion en mL/h",
          "Débit de perfusion en gouttes/min",
          "Durée d’une perfusion",
          "Pousse-seringue électrique",
          "Calculs d’insuline",
          "Calculs d’héparine",
          "Perfusions de médicaments vasoactifs",
          "Vérification des doses et prévention des erreurs"
        ]
      }
    ]
  },
  {
    "title": "Santé mentale / Psychiatrie",
    "icon": "🧠",
    "topics": [
      {
        "title": "Dépression",
        "subtopics": [
          "Repérage des symptômes dépressifs",
          "Évaluation de l’humeur",
          "Épisode dépressif caractérisé",
          "Dépression persistante",
          "Dépression dans le trouble bipolaire",
          "Dépression périnatale",
          "Dépression chez l’adolescent",
          "Dépression chez la personne âgée",
          "Évaluation du risque suicidaire",
          "Antidépresseurs et surveillance",
          "Psychothérapies et accompagnement",
          "Sommeil et activités quotidiennes",
          "Soutien familial",
          "Prévention des rechutes"
        ]
      },
      {
        "title": "Anxiété",
        "subtopics": [
          "Évaluation de l’anxiété",
          "Trouble anxieux généralisé",
          "Crise de panique",
          "Trouble panique",
          "Phobies",
          "Anxiété sociale",
          "Trouble obsessionnel-compulsif",
          "État de stress post-traumatique",
          "Manifestations somatiques de l’anxiété",
          "Techniques de respiration et de relaxation",
          "Communication et soutien",
          "Anxiolytiques et surveillance",
          "Approches psychothérapeutiques",
          "Gestion du stress et prévention des rechutes"
        ]
      },
      {
        "title": "Schizophrénie",
        "subtopics": [
          "Symptômes positifs",
          "Symptômes négatifs",
          "Troubles cognitifs",
          "Évaluation de l’état mental",
          "Hallucinations",
          "Idées délirantes",
          "Désorganisation de la pensée et du comportement",
          "Alliance thérapeutique",
          "Antipsychotiques et surveillance",
          "Effets extrapyramidaux",
          "Surveillance métabolique",
          "Autonomie et soins personnels",
          "Réhabilitation psychosociale",
          "Accompagnement des proches",
          "Observance et prévention des rechutes"
        ]
      },
      {
        "title": "Troubles de la personnalité",
        "subtopics": [
          "Évaluation et principes d’accompagnement",
          "Personnalité paranoïaque",
          "Personnalité schizoïde",
          "Personnalité schizotypique",
          "Personnalité antisociale",
          "Personnalité borderline",
          "Personnalité histrionique",
          "Personnalité narcissique",
          "Personnalité évitante",
          "Personnalité dépendante",
          "Personnalité obsessionnelle-compulsive",
          "Limites et cadre thérapeutique",
          "Régulation émotionnelle",
          "Gestion des conflits",
          "Prévention des comportements autoagressifs"
        ]
      },
      {
        "title": "Dépendances",
        "subtopics": [
          "Évaluation des consommations",
          "Usage nocif et dépendance",
          "Trouble de l’usage de l’alcool",
          "Sevrage alcoolique",
          "Trouble de l’usage des opioïdes",
          "Surdose d’opioïdes",
          "Usage de stimulants",
          "Usage du cannabis",
          "Dépendance aux benzodiazépines",
          "Dépendance au tabac",
          "Jeu pathologique",
          "Entretien motivationnel",
          "Réduction des risques",
          "Traitements et surveillance",
          "Prévention des rechutes",
          "Soutien familial et réinsertion"
        ]
      },
      {
        "title": "Urgences psychiatriques",
        "subtopics": [
          "Évaluation de crise",
          "Risque suicidaire",
          "Automutilation",
          "Agitation psychomotrice",
          "Violence et risque hétéroagressif",
          "Désescalade verbale",
          "Crise psychotique aiguë",
          "Épisode maniaque aigu",
          "Attaque de panique aiguë",
          "Confusion aiguë et causes somatiques",
          "Intoxication et sevrage sévère",
          "Syndrome malin des neuroleptiques",
          "Syndrome sérotoninergique",
          "Sécurité et surveillance rapprochée",
          "Droits du patient et mesures restrictives",
          "Orientation et continuité des soins"
        ]
      }
    ]
  },
  {
    "title": "Santé communautaire",
    "icon": "🏥",
    "topics": [
      {
        "title": "Prévention",
        "subtopics": [
          "Prévention primaire",
          "Prévention secondaire",
          "Prévention tertiaire",
          "Promotion de la santé",
          "Dépistage et facteurs de risque",
          "Prévention des maladies transmissibles",
          "Prévention des maladies chroniques",
          "Hygiène et assainissement",
          "Eau potable et sécurité alimentaire",
          "Prévention des accidents",
          "Santé au travail",
          "Santé scolaire",
          "Prévention des violences",
          "Participation communautaire"
        ]
      },
      {
        "title": "Épidémiologie",
        "subtopics": [
          "Notions de population et de risque",
          "Incidence et prévalence",
          "Morbidité et mortalité",
          "Modes de transmission",
          "Chaîne épidémiologique",
          "Surveillance épidémiologique",
          "Investigation d’une épidémie",
          "Études descriptives",
          "Études analytiques",
          "Biais et facteurs de confusion",
          "Indicateurs de santé",
          "Collecte et qualité des données",
          "Lecture des résultats épidémiologiques",
          "Communication des risques"
        ]
      },
      {
        "title": "Vaccination",
        "subtopics": [
          "Immunité individuelle et collective",
          "Programmes de vaccination",
          "Vaccination au cours de la vie",
          "Organisation d’une séance vaccinale",
          "Campagnes de vaccination",
          "Chaîne du froid",
          "Gestion des stocks de vaccins",
          "Sécurité des injections",
          "Gestion des déchets de vaccination",
          "Suivi de la couverture vaccinale",
          "Rattrapage et populations insuffisamment vaccinées",
          "Surveillance des événements postvaccinaux",
          "Hésitation vaccinale et communication",
          "Traçabilité et registres"
        ]
      },
      {
        "title": "Éducation sanitaire",
        "subtopics": [
          "Évaluation des besoins éducatifs",
          "Littératie en santé",
          "Objectifs d’apprentissage",
          "Planification d’une séance éducative",
          "Communication adaptée à la langue et à la culture",
          "Supports visuels et démonstrations",
          "Vérification de la compréhension",
          "Animation de groupes",
          "Éducation nutritionnelle",
          "Éducation à l’hygiène",
          "Éducation en santé sexuelle",
          "Éducation aux maladies chroniques",
          "Participation des familles",
          "Évaluation des actions éducatives"
        ]
      },
      {
        "title": "Santé familiale",
        "subtopics": [
          "Évaluation des besoins de la famille",
          "Visite à domicile",
          "Santé maternelle et infantile",
          "Planification familiale",
          "Nutrition familiale",
          "Santé des adolescents",
          "Santé des personnes âgées",
          "Accompagnement du handicap",
          "Soutien aux proches aidants",
          "Maladies chroniques au domicile",
          "Violences intrafamiliales",
          "Protection de l’enfance",
          "Précarité et accès aux soins",
          "Orientation vers les ressources communautaires"
        ]
      },
      {
        "title": "Santé publique",
        "subtopics": [
          "Organisation du système de santé",
          "Soins de santé primaires",
          "Déterminants sociaux de la santé",
          "Équité et accès aux soins",
          "Diagnostic communautaire",
          "Planification des programmes de santé",
          "Évaluation des programmes",
          "Surveillance des maladies transmissibles",
          "Santé environnementale",
          "Gestion des déchets de soins",
          "Préparation aux catastrophes",
          "Gestion des épidémies",
          "Santé des populations déplacées",
          "Partenariats et mobilisation communautaire",
          "Éthique et confidentialité en santé publique"
        ]
      }
    ]
  },
  {
    "title": "Fondements des soins infirmiers",
    "icon": "📋",
    "topics": [
      {
        "title": "Signes vitaux",
        "subtopics": [
          "Température corporelle",
          "Pouls et fréquence cardiaque",
          "Fréquence respiratoire",
          "Pression artérielle",
          "Saturation en oxygène",
          "Évaluation de la douleur",
          "Techniques et sites de mesure",
          "Choix et utilisation du matériel",
          "Valeurs selon l’âge et le contexte",
          "Facteurs influençant les mesures",
          "Surveillance des tendances",
          "Repérage d’une détérioration clinique",
          "Transmission des anomalies",
          "Traçabilité des paramètres"
        ]
      },
      {
        "title": "Hygiène et confort",
        "subtopics": [
          "Toilette au lit et soins corporels",
          "Soins buccodentaires",
          "Soins des yeux et des oreilles",
          "Soins périnéaux",
          "Réfection du lit",
          "Installation et positionnement",
          "Mobilisation et transfert",
          "Prévention des lésions de pression",
          "Évaluation de la peau",
          "Confort thermique",
          "Sommeil et repos",
          "Aide à l’alimentation",
          "Aide à l’élimination",
          "Respect de l’intimité et de l’autonomie",
          "Soins de confort en fin de vie"
        ]
      },
      {
        "title": "Sécurité du patient",
        "subtopics": [
          "Identification du patient",
          "Prévention des chutes",
          "Hygiène des mains",
          "Précautions standard",
          "Prévention des infections associées aux soins",
          "Sécurité des médicaments",
          "Sécurité transfusionnelle",
          "Prévention des erreurs de soins",
          "Matériovigilance",
          "Prévention des blessures par objets piquants",
          "Gestion des déchets",
          "Sécurité des transferts",
          "Signalement des événements indésirables",
          "Consentement et respect des droits",
          "Prévention des lésions de pression"
        ]
      },
      {
        "title": "Administration des médicaments",
        "subtopics": [
          "Vérification de la prescription",
          "Identité et allergies",
          "Contrôles avant administration",
          "Administration orale",
          "Administration sublinguale et buccale",
          "Administration cutanée et transdermique",
          "Administration ophtalmique et auriculaire",
          "Administration inhalée",
          "Administration rectale et vaginale",
          "Injection intradermique",
          "Injection sous-cutanée",
          "Injection intramusculaire",
          "Administration intraveineuse",
          "Médicaments par sonde entérale",
          "Compatibilités et préparation",
          "Surveillance des effets",
          "Éducation et traçabilité"
        ]
      },
      {
        "title": "Documentation",
        "subtopics": [
          "Dossier de soins infirmiers",
          "Recueil de données",
          "Évaluation initiale",
          "Diagnostics infirmiers",
          "Plan de soins",
          "Objectifs et évaluation des résultats",
          "Transmissions ciblées",
          "Notes chronologiques",
          "Documentation des médicaments",
          "Bilan des entrées et sorties",
          "Documentation des plaies",
          "Transmission lors des changements d’équipe",
          "Confidentialité et accès au dossier",
          "Correction des erreurs de documentation",
          "Dossier informatisé"
        ]
      },
      {
        "title": "Communication thérapeutique",
        "subtopics": [
          "Écoute active",
          "Questions ouvertes et reformulation",
          "Empathie et relation d’aide",
          "Communication non verbale",
          "Entretien infirmier",
          "Annonce et explication des soins",
          "Communication avec l’enfant",
          "Communication avec la personne âgée",
          "Communication avec un patient désorienté",
          "Communication en situation de handicap",
          "Interprétariat et différences linguistiques",
          "Gestion des émotions",
          "Gestion des conflits",
          "Communication avec les proches",
          "Transmission structurée entre professionnels",
          "Accompagnement du deuil"
        ]
      },
      {
        "title": "Organisation des soins",
        "subtopics": [
          "Priorités des soins",
          "Travail d’équipe",
          "Délégation et supervision"
        ]
      }
    ]
  },
  {
    "title": "Urgences et soins critiques",
    "icon": "🚑",
    "topics": [
      {
        "title": "État de choc",
        "subtopics": [
          "Physiopathologie du choc",
          "Reconnaissance de l’hypoperfusion",
          "Choc hypovolémique",
          "Choc hémorragique",
          "Choc septique",
          "Choc cardiogénique",
          "Choc anaphylactique",
          "Choc neurogénique",
          "Choc obstructif",
          "Évaluation hémodynamique",
          "Accès vasculaires",
          "Remplissage vasculaire et surveillance",
          "Vasopresseurs et inotropes",
          "Surveillance de la diurèse et du lactate",
          "Prévention des défaillances d’organes"
        ]
      },
      {
        "title": "Détresse respiratoire",
        "subtopics": [
          "Reconnaissance des signes de gravité",
          "Évaluation des voies aériennes",
          "Obstruction des voies aériennes",
          "Crise d’asthme sévère",
          "Exacerbation sévère de BPCO",
          "Œdème aigu pulmonaire",
          "Pneumothorax compressif",
          "Embolie pulmonaire grave",
          "Oxygénothérapie d’urgence",
          "Ventilation au ballon-masque",
          "Aspiration des sécrétions",
          "Préparation à l’intubation",
          "Ventilation non invasive",
          "Ventilation mécanique",
          "Gaz du sang et capnographie",
          "Surveillance du patient ventilé"
        ]
      },
      {
        "title": "Réanimation",
        "subtopics": [
          "Reconnaissance de l’arrêt cardiorespiratoire",
          "Alerte et organisation de l’équipe",
          "Réanimation cardiopulmonaire de base",
          "Compressions thoraciques",
          "Ventilation pendant la réanimation",
          "Défibrillateur automatisé externe",
          "Rythmes de l’arrêt cardiaque",
          "Défibrillation manuelle et sécurité",
          "Accès intraveineux et intraosseux",
          "Médicaments de réanimation",
          "Causes réversibles de l’arrêt cardiaque",
          "Réanimation pédiatrique",
          "Réanimation néonatale",
          "Soins après retour à une circulation spontanée",
          "Communication et traçabilité de la réanimation"
        ]
      },
      {
        "title": "Traumatismes",
        "subtopics": [
          "Évaluation initiale du traumatisé",
          "Hémorragie externe",
          "Traumatisme crânien",
          "Traumatisme rachidien",
          "Traumatisme thoracique",
          "Traumatisme abdominal",
          "Traumatisme du bassin",
          "Fractures et luxations",
          "Surveillance neurovasculaire d’un membre",
          "Syndrome des loges",
          "Plaies et lésions des tissus mous",
          "Brûlures",
          "Traumatismes oculaires",
          "Écrasement et rhabdomyolyse",
          "Immobilisation et transfert",
          "Prise en charge de la douleur"
        ]
      },
      {
        "title": "Triage",
        "subtopics": [
          "Objectifs et principes du triage",
          "Évaluation rapide initiale",
          "Priorités selon la gravité",
          "Signes d’alerte immédiats",
          "Douleur thoracique au triage",
          "Dyspnée au triage",
          "Déficit neurologique aigu au triage",
          "Fièvre et suspicion de sepsis",
          "Urgences obstétricales au triage",
          "Urgences pédiatriques au triage",
          "Urgences psychiatriques au triage",
          "Réévaluation des patients en attente",
          "Triage en situation de catastrophe",
          "Orientation et transmission des informations"
        ]
      },
      {
        "title": "Surveillance du patient critique",
        "subtopics": [
          "Surveillance neurologique",
          "Surveillance hémodynamique",
          "Surveillance respiratoire",
          "Monitorage ECG",
          "Surveillance de la perfusion tissulaire",
          "Bilan hydrique et fonction rénale",
          "Surveillance hydroélectrolytique",
          "Surveillance glycémique",
          "Douleur, sédation et agitation",
          "Prévention du delirium",
          "Prévention des infections liées aux dispositifs",
          "Nutrition du patient critique",
          "Prévention des lésions de pression",
          "Mobilisation précoce",
          "Surveillance des cathéters et drains",
          "Accompagnement des proches",
          "Transmission et continuité des soins"
        ]
      }
    ]
  }
];
