from sqlmodel import Session, select

from app.model import DisciplineProgression, KataCompletion, Progression
from app.rank import RANK_ORDER
from app.routes.katas import get_kata


# Trouve le rank le plus elevé parmi la liste donnée
def highest_rank(ranks: list[str]) -> str | None:
    return max(ranks, key=lambda rank: RANK_ORDER[rank]) if ranks else None

# Fonction de recalcul de la progression de l'utilisateur lorsque sa liste de Katas complétés change
def recalculate_progression(user_id: int, session: Session):
    # Prends la liste de tous les katas complété de l'utilisateur
    completions: list[KataCompletion] = session.exec(select(KataCompletion).where(
            KataCompletion.user_id == user_id
        )
    ).all()

    # Regroupe les ranks de tous les katas complétés, par discipline
    # Groups aura un tableau de rank pour chaque discipline
    groups = {}
    for completion in completions:
        # Trouve le kata depuis le fichier json pour cette itération
        kata = get_kata(completion.kata_id)
        # Recupère son rank et le range dans le group de sa discipline
        groups.setdefault(completion.discipline, []).append(kata["rank"])


    # Prends le rank le plus elevé de la discipline "core" (le tronc commun) 
    # et retire le group "core" de groups.
    # Pour ne garder que les ranks des disciplines spécialisés.
    core_dan = highest_rank(groups.pop("core", []))

    # Au cas où l'utilisateur n'a pas de kata "core" complété.
    # Auquel cas il n'y a plus rien à calculer
    # Puisqu'il plafonne toutes les autres disciplines
    if not core_dan:
        return

    # Récupère la progression de l'utilisateur
    progression: Progression = session.exec(select(Progression).where(
        Progression.user_id == user_id
    )).one()
    # Actualise son core_dan (rank sur le tronc commun)
    progression.core_dan = core_dan

    # Récupère la progression de l'utilisateur sur toutes ses disciplines
    dps: list[DisciplineProgression] = session.exec(
        select(DisciplineProgression).where(
            DisciplineProgression.user_id == user_id
        )
    ).all()

    # Un utilisateur a qu'une progression par discipline
    # Ici on indexe chaque progression par sa discipline
    existing = {dp.discipline: dp for dp in dps }

    # Pour chaque ranks par discipline dans groups
    # Met à jour le rank de chaque discipline, plafonné au core_dan
    for discipline, ranks in groups.items():
        # Prend le plus petit entre core_dan
        # et le plus élevé des ranks dans la discipline
        capped = min(highest_rank(ranks), core_dan, key=RANK_ORDER.__getitem__)
        # Récupère la progression de cette discipline, None si n'existe pas
        dp = existing.get(discipline)
        # Si l'utilisateur a déjà un rank dans cette discipline il le met à jour
        if dp:
            dp.highest_dan_practiced = capped
        # Sinon crée une nouvelle progression dans cette discipline
        else:
            session.add(DisciplineProgression(
                user_id=user_id,
                discipline=discipline,
                highest_dan_practiced=capped,
            ))
    # Les routes et fonctions appelant celle ci se chargeront du commit
    # Pour tout valider en une seule transaction


    

