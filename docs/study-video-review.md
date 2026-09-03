# Sélection initiale de vidéos — 3 septembre 2026

22 vidéos uniques, 16 sous-thématiques. Source : Hôpitaux universitaires de Genève (HUG), série francophone d’information sur le diabète de type 1, https://www.hug.ch/videos-dinformation-sur-diabete.

## Vérifications effectuées

- Chaque identifiant YouTube est issu d’un lecteur intégré à une page officielle HUG. Les descriptions françaises de ces pages ont été lues pour choisir les correspondances.
- Chaque page YouTube fournit un titre correspondant, la chaîne HUG `UCfRZKrhLs6HbL5jEc3OL82w`, une durée exacte inférieure à 900 secondes, `playabilityStatus.status = OK` et `playableInEmbed = true`.
- Les durées viennent des métadonnées individuelles, et non de la fourchette approximative de 2–4 minutes annoncée sur la page de la collection.
- Les lecteurs officiels sont chargés uniquement sur demande. Aucun média n’est copié ou réhébergé. Une page source et un lien YouTube restent accessibles si le lecteur ne fonctionne pas.

## Portée

Ces capsules d’éducation thérapeutique introduisent des notions ; elles ne constituent pas des cours infirmiers complets ni des protocoles de soins haïtiens. Le visionnage intégral et la validation clinique indépendante n’ont pas été effectués. Ne pas afficher « validé médicalement ». Les accès et autorisations peuvent changer après la date du contrôle.

La première sélection couvre Endocrinologie et Insulines. Aucune ressource approximative n’est affectée à une autre sous-thématique pour augmenter artificiellement la couverture. Les capsules de conduite à tenir devant une hypoglycémie et la page de contrôle glycémique contenant une plage de référence à clarifier sont exclues de cette sélection initiale.

## Ajouts futurs

Vérifier la page de l’éditeur, la langue, le contenu décrit, l’identité de la chaîne, la durée individuelle strictement inférieure à 15 minutes et l’autorisation d’intégration. Documenter une revue clinique avant de qualifier le contenu de validé médicalement. Ajouter une correspondance exacte catégorie/thématique/sous-thématique dans `lib/study-videos.ts`.

## Extension du 3 septembre 2026

Ajout de 43 vidéos : le catalogue contient désormais 65 vidéos uniques pour 60 sous-thématiques. Les huit catégories possèdent au moins une sous-thématique accompagnée d’une vidéo, sans couverture exhaustive des 793 sous-thématiques. Le compteur visible sur l’accueil et la page Catégories est calculé à partir du catalogue.

L’extension comprend des contenus HUG en cardiologie, neurologie, traitements inhalés, urologie, pédiatrie, allaitement, prévention des chutes et anesthésie ; des contenus Psycom, Centre Pierre Janet et CHU Montpellier référencés par Psycom ; une animation Santé Canada sur le mécanisme vaccinal ; et la version sous-titrée en français du film NEJM sur l’hygiène des mains, diffusée sur le site VigiGerme des HUG. Les capsules de moins d’une minute sont explicitement marquées « capsule courte ». Les sujets combinés peuvent être illustrés sur un aspect seulement : par exemple les traitements inhalés pour la BPCO, ou la rééducation après AVC. Le titre précise la portée de la vidéo.

Les identifiants proviennent de lecteurs ou de liens présents sur les sites sources officiels, contrôlés par récupération HTTP. Pour chaque ajout, les métadonnées YouTube ont confirmé une durée strictement inférieure à 900 secondes, un statut public OK et l’autorisation d’intégration. Les titres et descriptions ont servi à la sélection des correspondances. Les preuves documentaires minimales sont conservées dans `study-video-review-extension.json`. L’auteur et la date de contrôle s’affichent désormais par vidéo, y compris quand une même rubrique contient plusieurs éditeurs.

Exclusions : les films HUG sur l’insuffisance cardiaque (903 s), l’insuffisance rénale (1059 s), Alzheimer (1025 s), et le développement de l’enfant prématuré (981 s) dépassent la limite. Le film Psycom sur les troubles anxieux de 2933 s est également exclu. D’autres liens, dont la péridurale, n’ont pas pu être validés sans connexion par l’outil ; cela ne démontre pas leur indisponibilité pour tous les utilisateurs. Aucune ressource bloquée ou de durée inconnue n’a été intégrée.

Cette vérification reste documentaire et technique : elle ne constitue ni un visionnage intégral, ni une validation clinique indépendante, ni une validation de protocoles applicables en Haïti. Aucun lien vidéo n’est présenté comme un cours couvrant toute la sous-thématique.

## Deuxième extension du 3 septembre 2026

Ajout de 48 vidéos et de 53 sous-thématiques jusqu’ici sans vidéo. La rubrique déjà équipée sur les crises convulsives reçoit aussi un complément. Total publié : **113 vidéos uniques, 113 sous-thématiques sur 793 ; 680 restent sans vidéo**. La couverture par thématique est enregistrée dans `study-video-coverage.json` ; les compteurs de l’interface restent calculés depuis le catalogue.

### Sources et correspondances

- Ressources de formation référencées dans le [répertoire CEFIEC des supports pour étudiants infirmiers](https://www.cefiec.fr/Document/Communication/COVID-19/temoignages/listeSitesGratuitsdeE-learningpourlesetudiantssoinsinfirmiersV4-31mars2020.pdf) : HUG, IFSI Foch, IFPS Croix Saint-Simon, CPias, CNRD, CHU Rouen et Limoges, AP-HP, QualiREL, HEPH Condorcet et CH Métropole Savoie, entre autres. Les titres, descriptions et chaînes individuelles ont été contrôlés. Cette liste de 2020 est un outil de découverte, pas une certification de l’actualité des protocoles. Les démonstrations restent rattachées à leur établissement auteur.
- Capsules françaises Sikana : gestes de secours chez l’adulte, prévention des accidents, hygiène alimentaire et préparation familiale aux catastrophes. Les transcriptions françaises des vidéos retenues ont été lues ; seules des correspondances décrivant un aspect réellement traité sont ajoutées. Une capsule sur les fractures ne prétend pas enseigner les luxations ; une capsule de premiers secours ne remplace pas un cours de soins critiques.
- Institut de Psychiatrie/PsyCARE, Fondation FondaMental, Centre ressource réhabilitation psychosociale et AP-HM via Psycom : hallucinations, symptômes négatifs, accompagnement des proches et réhabilitation.
- MAAD Digital et dossier Inserm : système de récompense, neurobiologie des addictions, alcoolisation et effets hépatiques. Le film sur le foie contient explicitement un chapitre sur la cirrhose ; il est proposé pour cet aspect de la rubrique « Cirrhose et hypertension portale ».

Chaque ajout possède une source, un titre, une chaîne identifiable, une durée YouTube strictement inférieure à 900 secondes, un statut public OK et une intégration autorisée au moment du contrôle. Les durées viennent de YouTube : elles diffèrent parfois de quelques secondes de l’index Sikana. Les preuves individuelles sont dans `study-video-review-completion.json`. Aucun média n’est téléchargé ni réhébergé.

### Exclusions et limites

- Vidéos de plus de 15 minutes : notamment plusieurs ECG, calculs de doses, cathéter du nouveau-né, PCA et réanimation pédiatrique. Les identifiants exigeant une connexion, refusant l’intégration, supprimés ou sans métadonnées confirmées sont exclus. Un échec d’accès par l’outil n’est pas une preuve d’indisponibilité universelle.
- Les contenus Sikana sur la déshydratation de l’enfant ne sont pas retenus : leur transcription contient des consignes d’eau pour le nouveau-né incompatibles avec les [conseils de l’OMS sur l’allaitement](https://www.who.int/news-room/questions-and-answers/item/breastfeeding).
- Réanimation et désobstruction du nourrisson Sikana : non retenues, notamment en raison de la technique de compression à deux doigts et de la nécessité d’une revue au regard des [recommandations pédiatriques AHA/AAP de 2025](https://newsroom.heart.org/news/updated-cpr-guidelines-released-for-pediatric-and-neonatal-emergency-care-and-resuscitation). Les vidéos sur l’engorgement mammaire, le sommeil, les brûlures et la noyade sont également laissées de côté en attendant une revue clinique spécifique. Les résultats de recherches expérimentales ne sont pas ajoutés comme traitements infirmiers usuels.
- Pas de visionnage intégral de chaque vidéo ni de validation clinique indépendante. Les mots « validé médicalement », « cours complet » ou « toutes les sous-thématiques complétées » ne doivent pas être utilisés. La recherche et la vérification documentaire ne permettent pas de remplir honnêtement les 680 rubriques restantes avec cette sélection.

La tâche mensuelle existante lit le catalogue courant ; elle inclut donc ces ajouts sans nouvelle programmation.

Validation de l’intégration : vérification TypeScript du projet, compilation et prérendu de l’accueil et de `/categories`, contrôle des correspondances exactes et de la conservation des 65 anciennes vidéos. Les deux pages présentent les compteurs 113/793, 160 liens vidéo avec leurs sources, et aucun lecteur tiers avant interaction. Le parcours visuel en navigateur de production n’a pas été rejoué.
