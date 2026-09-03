# Fiches de lecture — 3 septembre 2026

Les lecteurs vidéo et leur catalogue ont été retirés à la demande du propriétaire. Les fichiers historiques `study-video-*` documentent uniquement l'ancien catalogue et ne représentent plus les ressources affichées.

Le catalogue `lib/study-texts-data.json` contient 793 fiches pour les 793 sous-thématiques : les 120 fiches initiales sont conservées et 673 fiches originales ont été ajoutées. Chaque sous-thématique donne accès à son texte. Aucune association avec les questions n’est ajoutée.

Chaque fiche présente huit rubriques courtes et repliables, dont la première est ouverte à l’arrivée. Les intitulés sont adaptés aux maladies, médicaments, procédures, notions, actions communautaires et calculs. La huitième rubrique comprend trois points à retenir ; les références restent accessibles en pied de fiche. Le temps de lecture est calculé sur les huit rubriques. Les textes sont des introductions originales, pas des protocoles cliniques ni une validation médicale indépendante. La date affichée indique la mise à jour éditoriale. Les références en anglais sont identifiées.

Les fiches sont prégénérées et ne font aucun appel à OpenAI. Le contrôle mensuel des anciens liens vidéo a été désactivé.

Les références « Pour approfondir » comprennent des chapitres et manuels généraux de la discipline ; elles ne constituent pas une validation clinique individuelle de chaque fiche.

Validation : couverture des 793 sous-thématiques, conservation des 120 fiches initiales, unicité des 793 identifiants, huit rubriques non vides, trois points à retenir et références par fiche, génération des pages, liens depuis les catégories et absence de lecteurs vidéo. Compilation locale réalisée avec des variables Supabase factices pour permettre la génération ; elle ne teste pas l'authentification ou la base de données de production.

## Organisation éditoriale des huit rubriques

Les 793 introductions et paragraphes de soins sont conservés. `lib/study-text-details-data.json` apporte six compléments à partir de 250 profils éditoriaux explicitement associés aux identifiants des fiches. Les repères transversaux sont partagés entre sujets apparentés ; ils ne sont pas des protocoles individualisés. Aucun remplissage implicite par mots-clés ou texte de secours n’est utilisé. Une correspondance manquante ou dupliquée bloque le chargement.

Les rubriques utilisent les éléments natifs `details` et `summary`, ouverts au toucher, à la souris ou au clavier. Les liens existants vers les fiches sont conservés.

Contrôle de cette évolution : compilation réussie, 793 pages contenant chacune huit éléments `details`/`summary`, une seule rubrique initialement ouverte, trois points à retenir et conservation des liens de catégories. Le navigateur de vérification a refusé l’ouverture de l’URL locale (`ERR_BLOCKED_BY_CLIENT`) ; aucune validation visuelle mobile ou interaction réelle n’est revendiquée.
