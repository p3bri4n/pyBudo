# Règles de développement collaboratif — pyBudo

## 1. Organisation des branches

La branche `main` doit toujours rester stable et déployable.
La branche `dev` permet les tests d'integration.

Chaque évolution doit être développée sur une branche dédiée, puis mergée sur `dev` et ensuite `dev` peut être mergée dans `main`:

```text
feature/ajout-exercice-python
fix/validation-code
refactor/execution-runner
docs/architecture
test/exercise-service
```

### Convention de nommage

```text
<issue>/<type>/<description-courte>
```

Types recommandés :

* `feature/` → nouvelle fonctionnalité
* `fix/` → correction de bug
* `refactor/` → modification interne sans changement fonctionnel
* `test/` → ajout ou modification de tests
* `docs/` → documentation
* `chore/` → maintenance technique, configuration, dépendances
* `build/` → système de build ou packaging
* `ci/` → configuration CI/CD

Exemple :

```text
1/feature/exercise-validation
```

---

## 2. Pull Requests

Aucun développement ne doit être directement poussé sur `dev`.

Toute modification passe par une Pull Request.

Une PR doit :

* avoir un objectif clair ;
* rester relativement petite ;
* être liée à une issue ou une tâche lorsque c'est pertinent ;
* contenir les tests nécessaires ;
* passer la CI ;
* être relue par au moins un autre développeur.

Éviter les PR du type :

> "Ajout de tout le système d'exercices"

Préférer plusieurs PR :

```text
PR #1 — Création du modèle Exercise
PR #2 — Ajout de l'API Exercise
PR #3 — Ajout de la validation des réponses
PR #4 — Ajout de l'exécution du code
```

L'objectif est de faciliter les reviews et de réduire les risques.

---

## 3. Règles de review

Lors d'une review, on ne cherche pas uniquement à vérifier que le code fonctionne.

On vérifie notamment :

* la lisibilité ;
* la simplicité ;
* la cohérence avec l'architecture ;
* les tests ;
* les cas limites ;
* les éventuels problèmes de sécurité ;
* les performances lorsque cela est pertinent ;
* la maintenabilité.

Privilégier :

> "Est-ce qu'on pourrait extraire cette logique dans un service pour éviter que l'API connaisse les détails de l'exécution ?"

plutôt que :

> "Ton code est mal organisé."

En cas de désaccord technique important, la décision doit être documentée dans un ADR (Architecture Decision Record) plutôt que laissée dans une discussion de PR.

---

# 4. Nommage des commits

Les commits doivent être **courts, explicites, orientés action** et **réferencer l'issue**.

Nous utilisons une convention inspirée de **Conventional Commits** :

```text
<Refs #issue-number><type>(<scope>): <description>
```

Exemples :

```text
Refs #1 feat(exercises): add exercise creation endpoint
Refs #2 fix(execution): handle infinite loops
Refs #3 test(exercises): add validation tests
Refs #4 refactor(execution): isolate python runner
Refs #5 docs(architecture): add execution flow
Refs #6 chore(deps): update fastapi
Refs #7 ci(github): add test workflow
```

### Types autorisés

| Type       | Utilisation                                 |
| ---------- | ------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                     |
| `fix`      | Correction de bug                           |
| `refactor` | Refactorisation sans changement fonctionnel |
| `test`     | Ajout ou modification de tests              |
| `docs`     | Documentation                               |
| `chore`    | Maintenance                                 |
| `ci`       | CI/CD                                       |
| `build`    | Build / packaging                           |

### Règles

La description doit :

* commencer par un verbe ;
* être concise ;
* décrire ce que fait le commit ;
* éviter les formulations vagues.

À éviter :

```text
update
fix
changes
WIP
code
modifs
final
correction
```

Préférer :

```text
feat(exercises): add exercise difficulty field
fix(api): return 404 when exercise does not exist
test(execution): cover timeout handling
```

---

# 5. Un commit = une intention

Un commit doit idéalement représenter une modification cohérente.

À éviter :

```text
feat(exercises): add exercises and redesign authentication and update CI
```

Ce commit mélange plusieurs sujets.

Préférer :

```text
feat(exercises): add exercise repository
feat(auth): add user authentication
ci(github): add pull request checks
```

Cela permet notamment de comprendre plus facilement l'historique du projet et de revenir sur une modification si nécessaire.

---

# 6. Commits et Pull Requests

Les commits doivent rester propres avant la fusion dans `dev`.

Si nécessaire, les développeurs peuvent faire plusieurs petits commits pendant leur développement :

```text
wip
fix
fix again
test
oops
```

mais ils doivent être nettoyés avant la PR finale.

L'historique final doit rester compréhensible :

```text
feat(exercises): add exercise validation
test(exercises): cover invalid submissions
```

---

# 7. Tests

Toute nouvelle fonctionnalité doit être accompagnée des tests appropriés.

Exemple :

```text
feat(exercises): add exercise validation
test(exercises): cover invalid submissions
```

Une correction de bug doit idéalement être accompagnée d'un test qui reproduit le bug.

```text
fix(execution): prevent timeout bypass
test(execution): add timeout regression test
```

L'objectif est d'éviter qu'un bug corrigé réapparaisse ultérieurement.

---

# 8. Qualité du code

Avant de créer une PR, chaque développeur doit vérifier :

```text
✓ Code formaté
✓ Linter OK
✓ Type checking OK
✓ Tests OK
✓ Pas de secrets dans le repository
✓ Documentation mise à jour si nécessaire
✓ PR compréhensible
```

Ces vérifications doivent également être automatisées autant que possible dans la CI.

---

# 9. Principe général

Les règles doivent permettre à n'importe quel développeur arrivant sur pyBudo de comprendre rapidement :

1. comment travailler ;
2. comment nommer ses branches ;
3. comment écrire ses commits ;
4. comment proposer une modification ;
5. comment faire relire son code ;
6. comment garantir que le code reste stable.

Le but n'est pas d'imposer de la bureaucratie, mais de construire dès le départ un historique et une base de code **lisibles, prévisibles et maintenables**.
