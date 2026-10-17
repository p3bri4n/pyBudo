from datetime import datetime, timedelta, timezone

from app.model import Kata, KataCompletion
from app.schemas import AdminCompletionStats
from sqlalchemy import distinct
from sqlmodel import Session, func, select


def build_completion_stats(
    session: Session,
    user_id: int | None = None,
) -> AdminCompletionStats:
    since = datetime.now(timezone.utc) - timedelta(days=7)

    completion_query = select(func.count()).select_from(KataCompletion)
    recent_query = select(func.count()).select_from(KataCompletion)

    if user_id is not None:
        completion_query = completion_query.where(KataCompletion.user_id == user_id)
        recent_query = recent_query.where(KataCompletion.user_id == user_id)

    recent_query = recent_query.where(KataCompletion.completed_at >= since)

    total = session.exec(completion_query).one()
    recent = session.exec(recent_query).one()

    users_count = session.exec(
        select(func.count(distinct(KataCompletion.user_id)))
    ).one()

    katas_count = session.exec(
        select(func.count(distinct(KataCompletion.kata_id)))
    ).one()

    discipline_query = (
        select(func.count(distinct(Kata.discipline)))
        .select_from(KataCompletion)
        .join(Kata, KataCompletion.kata_id == Kata.id)
    )
    rank_query = (
        select(func.count(distinct(Kata.rank)))
        .select_from(KataCompletion)
        .join(Kata, KataCompletion.kata_id == Kata.id)
    )

    if user_id is not None:
        discipline_query = discipline_query.where(KataCompletion.user_id == user_id)
        rank_query = rank_query.where(KataCompletion.user_id == user_id)

    disciplines = session.exec(discipline_query).one()
    ranks = session.exec(rank_query).one()

    if user_id is not None:
        users_count = int(total > 0)
        katas_count = session.exec(
            select(func.count(distinct(KataCompletion.kata_id))).where(
                KataCompletion.user_id == user_id
            )
        ).one()

    return AdminCompletionStats(
        total_completions=total,
        completions_last_7_days=recent,
        users_with_completions=users_count,
        distinct_katas_completed=katas_count,
        disciplines_count=disciplines,
        ranks_count=ranks,
    )
