# Corrigés par choix

Audit du 3 septembre 2026 : 6 425 questions, toutes avec une explication générale non vide. Aucun champ A–D dédié dans le schéma actuel. Aucun texte clinique n'a été généré ou remplacé en masse.

## Stockage compatible

Le champ texte `questions.explication` accepte encore les anciens corrigés. Lorsque l'administrateur saisit au moins une justification par option ou un point à retenir, le formulaire enregistre une enveloppe JSON versionnée `answer-explanation-v1` avec `general`, `options` (A–D) et `takeaway`. Les permissions administratives existantes restent appliquées dans chaque action serveur ; aucune migration ou modification des droits SQL.

Tous les affichages de ce champ utilisent désormais le lecteur commun. Un import CSV peut conserver l'ancien texte ou fournir l'enveloppe dans une cellule CSV correctement échappée. Un import qui remplace ce champ remplace aussi ses justifications : préserver l'enveloppe lors d'une réimportation. Les consommateurs externes éventuels doivent adopter le même lecteur.

## Comportement

- Pratique : corrigé après validation seulement.
- Examen : composant de correction uniquement sur les résultats d'une session terminée appartenant à l'utilisateur. Aucun corrigé ajouté à l'écran de passation. Les réponses correctes restent présentes dans les données client du moteur existant ; cette modification n'est pas une protection anti-triche.
- Mauvais choix : choix et libellé, justification spécifique si saisie, sinon mention explicite du manque et corrigé général conservé.
- Absence de réponse : identifiée comme telle, sans inventer de raisonnement de l'étudiant.
- Révision des erreurs et favoris : même lecteur, pas de JSON affiché brut pour le format reconnu.
- Administration : champs général, A–D et À retenir. Les auteurs doivent vérifier le contenu, sa source et sa cohérence avec les options avant enregistrement. Aucun workflow d'approbation clinique n'est prétendu.

## Vérification et limites

`node scripts/check-answer-explanations.cjs` (Node 24) vérifie le format historique, le round-trip A–D, les contenus vides/invalides et les points d'intégration. `npm run build` vérifie les composants et types. Les tests ne constituent pas un parcours navigateur authentifié complet ni une validation clinique des 6 425 corrigés.

Travail restant : enrichissement éditorial des justifications A–D et des points à retenir. Le moteur ne fabrique jamais une explication spécifique à partir du seul fait qu'un choix est faux. La soumission chronométrée et la persistance atomique des examens existantes n'ont pas été refondues dans cette livraison.
