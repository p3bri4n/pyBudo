from sqlmodel import Session, select

from app.model import DisciplineProgression, KataCompletion, Progression
from app.rank import RANK_ORDER
from app.routes.katas import load_katas


def recalculate_progression(user_id: int, session: Session, discipline: str ):
    
    katas = load_katas()
    all_completions = session.exec(
        select(KataCompletion).where(
            KataCompletion.user_id == user_id
        )
    ).all()

    core_ranks =[]

    for completion in all_completions:
        kata = next(
        kata for kata in katas
        if kata["id"] == completion.kata_id
        )

        rank = kata["rank"]

        if completion.discipline == "core":
            core_ranks.append(rank)

    core_dan = (
        max(core_ranks, key=lambda rank: RANK_ORDER[rank]) 
        if core_ranks 
        else None
    )

    if discipline == "core":
    
        progression = session.exec(
            select(Progression).where(Progression.user_id == user_id)
        ).one()
        progression.core_dan = core_dan
    
        session.add(progression)

    else:
        completions = session.exec(
            select(KataCompletion).where(
                KataCompletion.user_id == user_id, 
                KataCompletion.discipline == discipline
            )
        ).all()

        discipline_progression = session.exec(
            select(DisciplineProgression).where(
                DisciplineProgression.user_id == user_id, 
                DisciplineProgression.discipline == discipline
            )
        ).first()

        discipline_ranks = []

        for completion in completions:
            kata = next(
                kata for kata in katas
                if kata["id"] == completion.kata_id
            )

            discipline_ranks.append(kata["rank"])

        practiced = max(
            discipline_ranks,
            key=lambda rank: RANK_ORDER[rank]
        )

        if core_dan is None:
            return

        highest_dan_practiced = min(
            practiced, 
            core_dan, 
            key=lambda rank: RANK_ORDER[rank]
        )

        if discipline_progression:
            discipline_progression.highest_dan_practiced = highest_dan_practiced
        else:
            discipline_progression = DisciplineProgression(
                user_id=user_id, discipline=discipline, 
                highest_dan_practiced=highest_dan_practiced
            )

        session.add(discipline_progression)