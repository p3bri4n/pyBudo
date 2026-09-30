from typing import get_args

from sqlmodel import Session, select

from app.model import DisciplineProgression, Kata, KataCompletion, Progression
from app.rank import RANK_ORDER, Rank
from app.services.katas import get_kata


# Trouve le rank le plus elevé parmi la liste donnée
def highest_rank(ranks: list[str]) -> str | None:
    return max(ranks, key=lambda rank: RANK_ORDER[rank]) if ranks else None


# Parcourt les rangs dans l'ordre croissant et renvoie :
# - core_dan : le plus haut rang dont tous les katas "core" (et ceux des rangs inférieurs) sont réussis
# - current_rank : le premier rang qui a encore des katas "core" à réussir, None si tout est réussi
# Les rangs sans kata sont ignorés.
# obtained_dan : rang déjà obtenu par l'utilisateur. Un rang obtenu n'est jamais retiré :
# ce rang et ceux en dessous comptent comme terminés, même si un kata y a été ajouté depuis.
def core_rank_status(
    core_katas: list[Kata], completed_ids: set[str], obtained_dan: str | None = None
) -> tuple[str | None, str | None]:
    core_dan = obtained_dan
    for rank in get_args(Rank):
        if obtained_dan and RANK_ORDER[rank] <= RANK_ORDER[obtained_dan]:
            continue
        rank_katas = [k for k in core_katas if k.rank == rank]
        if not rank_katas:
            continue
        if not all(k.id in completed_ids for k in rank_katas):
            return core_dan, rank
        core_dan = rank
    return core_dan, None


def get_core_katas(session: Session) -> list[Kata]:
    return session.exec(select(Kata).where(Kata.discipline == "core")).all()


# Fonction de recalcul de la progression de l'utilisateur lorsque sa liste de Katas complétés change
def recalculate_progression(user_id: int, session: Session):
    # Prends la liste de tous les katas complété de l'utilisateur
    completions: list[KataCompletion] = session.exec(
        select(KataCompletion).where(KataCompletion.user_id == user_id)
    ).all()

    # Prends tous les katas depuis la liste des completions en utilisant kata_id
    # Juste avant, retire les completions dont on ne trouve pas le kata
    katas: list[Kata] = [k for c in completions if (k := get_kata(c.kata_id, session))]

    # Récupère la progression de l'utilisateur
    progression: Progression = session.exec(
        select(Progression).where(Progression.user_id == user_id)
    ).one()

    # Le rang du tronc commun n'est obtenu que lorsque tous ses katas sont réussis,
    # et un rang déjà obtenu est conservé
    completed_ids = {k.id for k in katas}
    core_dan, _ = core_rank_status(
        get_core_katas(session), completed_ids, progression.core_dan
    )

    # Regroupe les ranks de tous les katas complétés, par discipline
    # Groups aura un tableau de rank pour chaque discipline sauf "core"
    groups = {}

    # Au cas où l'utilisateur n'a pas de kata "core" complété.
    # Auquel cas groups restera vide
    # On ne calcule les disciplines que s'il y'a un tronc commun
    # puisque c'est lui qui les plafonne
    if core_dan:
        for kata in katas:
            if kata.discipline == "core":
                continue
            # Trouve le kata, recupère son rank
            # et le range dans le group de sa discipline
            groups.setdefault(kata.discipline, []).append(kata.rank)

    # Actualise son core_dan (rank sur le tronc commun)
    progression.core_dan = core_dan

    # Récupère la progression de l'utilisateur sur toutes ses disciplines
    dps: list[DisciplineProgression] = session.exec(
        select(DisciplineProgression).where(DisciplineProgression.user_id == user_id)
    ).all()

    # Un utilisateur a qu'une progression par discipline
    # Ici on indexe chaque progression par sa discipline
    existing = {dp.discipline: dp for dp in dps}

    # Pour les suppression d'un kata complété
    # Vérifier qu'une discipline ne se retrouve sans kata complété
    # Si tel est le cas il faut le supprimer
    for discipline, dp in existing.items():
        if discipline not in groups:
            session.delete(dp)

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
            session.add(
                DisciplineProgression(
                    user_id=user_id,
                    discipline=discipline,
                    highest_dan_practiced=capped,
                )
            )
    # Les routes et fonctions appelant celle ci se chargeront du commit
    # Pour tout valider en une seule transaction
