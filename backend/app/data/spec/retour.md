Le point qui bloque probablement ton dev, c'est de savoir **d'où vient le rang** — est-ce un champ qu'on met à jour à la main, ou quelque chose qui se déduit ? La réponse : ça se déduit toujours des katas résolus, jamais l'inverse. Voici comment structurer ça clairement.**Trois tables, une seule source de vérité :**

- **`KataCompletion`** — le journal brut : `user_id`, `kata_id`, `discipline` (null si tronc commun), `completed_at`. C'est la seule table où on *écrit* un événement ; tout le reste s'en déduit.
- **`Progression`** — une ligne par utilisateur, `core_dan` mis en cache pour éviter de recalculer à chaque lecture.
- **`DisciplineProgression`** — une ligne par utilisateur × discipline, `highest_dan_practiced` mis en cache, toujours plafonné au `core_dan`.

**Le point qui débloque tout, à donner tel quel au dev :** les niveaux (`kyu_10`, ..., `shodan`, `nidan`...) ne sont pas comparables par ordre alphabétique — il faut une table d'ordre explicite, définie une seule fois :

```python
RANK_ORDER = {
    "kyu_10": 0, "kyu_9": 1, "kyu_8": 2, # ...
    "kyu_1": 9,
    "shodan": 10, "nidan": 11, "sandan": 12,
    # ...
}
```


**La logique de mise à jour, à chaque insertion dans `KataCompletion` :**

```python
def on_kata_completed(user_id, kata, discipline):
    insert_completion(user_id, kata.id, discipline, now())

    if discipline is None:
        # recalcule le rang core : le plus haut niveau jamais résolu en tronc commun
        core_dan = max(
            c.kata.niveau for c in completions(user_id, discipline=None)
        )
        update_progression(user_id, core_dan=core_dan)
    else:
        # recalcule le niveau pratiqué dans cette discipline, plafonné au core
        core_dan = get_progression(user_id).core_dan
        practiced = max(
            c.kata.niveau for c in completions(user_id, discipline=discipline)
        )
        capped = min(practiced, core_dan, key=lambda n: RANK_ORDER[n])
        update_discipline_progression(user_id, discipline, highest_dan_practiced=capped)
```

Pour le MVP, la règle est volontairement simple : **`core_dan` = le niveau le plus élevé parmi tous les katas résolus** — pas de seuil de "X katas à ce niveau avant de monter". C'est cohérent avec le fait que ce tier reste auto-déclaré et sans enjeu de confiance externe (voir la distinction rōnin/menkyo) ; si un dev de l'équipe trouve cette règle trop permissive plus tard, c'est un paramètre à durcir dans `on_kata_completed`, pas une refonte de schéma.

**Un détail à glisser dès maintenant pour éviter une migration plus tard** : ajoute une colonne `verified: bool = False` sur `KataCompletion`. Le jour où le juge serveur existe, une soumission vérifiée insère simplement une ligne avec `verified=True` — aucun changement de schéma nécessaire, juste une nouvelle valeur possible sur une colonne déjà là.


D'où ça sort, pour que les devs comprennent que ce n'est pas arbitraire : les kyu suivent grosso modo le découpage officiel PCEP (certification d'entrée Python Institute), shodan/nidan/sandan couvrent l'essentiel de PCAP, et les dans au-delà (yondan, godan) sortent de ces référentiels — c'est le territoire où le lead a le plus de latitude, et où votre produit se différencie vraiment d'une simple certification existante.

Le lien direct avec ce qu'on a déjà posé : chaque ligne de cette table correspond exactement à un level_spec — les colonnes concepts_requis/concepts_interdits qu'on a définies pour la génération LLM sont la traduction technique précise de cette table. Si un dev veut savoir "un kata kyu_6 a-t-il le droit d'utiliser une compréhension de liste ?", la réponse est dans le level spec YAML de kyu_6, pas dans cette table — celle-ci sert à comprendre l'intention, le YAML fait foi pour l'implémentation.

Un point à trancher avec le lead avant de figer ça définitivement : le contenu exact des dans au-delà de sandan reste à valider — j'ai proposé asynchrone/métaprogrammation comme pistes cohérentes avec un profil senior, mais c'est lui qui doit arbitrer selon l'étude concurrentielle qu'il mène.