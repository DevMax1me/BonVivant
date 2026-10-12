# Spectre

Questionnaire en français pour explorer ses traits autistiques (48 questions, 8 domaines),
avec profil détaillé (score global, radar, détail par domaine, camouflage, enfance).

Site statique sans dépendance : ouvrir `index.html` dans un navigateur.
Les réponses restent dans le navigateur (localStorage), rien n'est envoyé à un serveur.

**Ce n'est pas un outil de diagnostic.** Les items sont originaux, inspirés du DSM-5-TR, de l'AQ
(Baron-Cohen et al., 2001), du CAT-Q (Hull et al., 2019) et du RAADS-R ; ils ne sont pas validés
psychométriquement et les seuils (30/50/70 %) sont indicatifs.

- `data.js` : domaines, questions (items inversés : `rev: true`), sources
- `app.js` : navigation, calcul des scores, résultats
- `style.css` : mise en page (thème clair/sombre, impression)
