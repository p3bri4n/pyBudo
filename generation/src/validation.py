import json


REQUIRED_KEYS_BY_TYPE = {
    "function": {"kata_type", "title", "statement", "signature", "solution_reference", "tests", "concepts_used"},
    "class": {"kata_type", "title", "statement", "class_name", "signature", "solution_reference", "tests", "concepts_used"},
}


def validate_kata(raw_kata: str, level_params: dict) -> list[str]:
    """
    A. Conformité structurelle (avant tout le reste)
        Le JSON parse sans erreur
        Toutes les clés attendues du schéma sont présentes, aucune clé en trop (additionalProperties: false)
        kata_type correspond bien à ce qui a été demandé (pas de dérive vers l'autre forme)
        Le nom de fonction/classe dans signature correspond exactement au nom réellement défini dans le code
        Le nombre de paramètres dans signature correspond au nombre réel défini dans le code

    B. Correction technique (jamais de confiance sur une valeur déclarée)
        Chaque output/expected_return/expected_state est recalculé par exécution réelle de solution_reference, jamais accepté tel quel
        Comparaison normalisée par aller-retour JSON (le coup des clés de dict entières → string) + tolérance flottante
        Exécution sous timeout (protection contre une boucle infinie générée par erreur, pertinent dès que les boucles sont autorisées)
        Toute exception levée pendant l'exécution fait échouer la validation proprement, sans planter le pipeline

    C. Respect du périmètre pédagogique du niveau
        Scope AST : aucun concept interdit du niveau présent dans solution_reference
        Complexité cyclomatique dans la fourchette du niveau (ex. exactement 1 pour kyu_10, où aucun branchement n'est autorisé)
        Longueur de la solution dans la fourchette attendue
        Nombre de return conforme à la contrainte du niveau (1 seul, dans ton cas)

    D. Qualité et pertinence du jeu de tests
        Au moins N tests (seuil défini par niveau)
        Pas de tests dupliqués (même input répété)
        Diversité réelle des sorties (pas tous identiques)
        Couverture des paramètres optionnels/branches : un paramètre avec valeur par défaut doit être testé avec sa valeur par défaut et explicitement remplacé — pas juste "en passant" sur un seul test parmi plusieurs (cf. ajouter_palier où 3 tests sur 4 n'exerçaient jamais ajustement)
        Pas de solution "hardcodée" détectable (comparaison littérale dans l'AST entre une constante et une valeur d'input de test)
        Les cas limites choisis ont un sens métier réel dans le contexte de l'énoncé, pas juste "une valeur négative parce qu'il en faut une" (cf. l'âge -1 sans pertinence)

    E. Cohérence sémantique titre / énoncé / code
        Le title et le statement décrivent effectivement ce que fait le code (pas de titre déconnecté comme "Conversion en indice de taille" pour une fonction de salutation)
        Pas d'artefacts de formatage parasites (sauts de ligne ou espaces superflus dans les champs texte)
        concepts_used déclarés correspondent à ce qui apparaît réellement dans le code (pas de liste générique recopiée sans rapport avec la solution)
        L'énoncé ne contredit pas silencieusement le comportement réel du code sur un cas ambigu (ex. arrondi bancaire de Python vs arrondi "scolaire" implicite dans l'énoncé — le bug round(0.5) qu'on a trouvé)

    F. Cohérence à l'échelle du dataset (pas juste kata par kata)
        id unique
        rank/discipline appartiennent aux valeurs autorisées
        variant_of, si renseigné, référence un id existant
        metadata.status cohérent avec metadata.violations_detected (jamais "publie" avec des violations non vides)

    G. Cohérence globale du kata avec Laya (indice de confiance)
    """

    errors = []
    # A

    # json parsing
    try:
        kata = json.loads(raw_kata)
    except json.JSONDecodeError:
        errors.append("json_format")
        return errors

    # check keys
    expected_type = level_params["kata_type"]
    expected_keys = REQUIRED_KEYS_BY_TYPE[expected_type]
    actual_keys = set(kata.keys())
    if actual_keys != expected_keys:
        missing = expected_keys - actual_keys
        extra = actual_keys - expected_keys
        errors.append(f"schema_keys (manquantes={missing}, en_trop={extra})")
        return errors

    # kata type
    if kata["kata_type"] != expected_type:
        errors.append("kata_type")

    # to be continued

    return errors
