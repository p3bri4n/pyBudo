from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import func, Session, select
from datetime import datetime, timedelta, timezone

from app.dependencies import get_current_user, get_session
from app.model import Kata, KataCompletion, User
from app.schemas import KataCompletionCreate, KataCompletionPublic, ProgressionPublic, KataCompletionStats
from app.services.katas import can_access_kata, get_published_kata
from app.services.recalculate import recalculate_progression


router = APIRouter()


@router.get("/progression", response_model=ProgressionPublic)
def get_user_progress(user: Annotated[User, Depends(get_current_user)]):
    progression_public = ProgressionPublic(
        core_dan=user.progression.core_dan, disciplines=user.discipline_progressions
    )
    return progression_public


@router.get("/completions", response_model=list[KataCompletionPublic])
def get_completions(
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    # Katas réussis par l'utilisateur connecté uniquement
    return session.exec(
        select(KataCompletion).where(KataCompletion.user_id == user.id)
    ).all()


@router.get("/completions/stats", response_model=KataCompletionStats)
def get_completions_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> KataCompletionStats:

    total_completions = session.exec(
        select(func.count())
        .select_from(KataCompletion)
        .where(KataCompletion.user_id == current_user.id)
    ).one()

    since = datetime.now(timezone.utc) - timedelta(days=7)

    completions_last_7_days = session.exec(
        select(func.count())
        .select_from(KataCompletion)
        .where(
            KataCompletion.user_id == current_user.id,
            KataCompletion.completed_at >= since,
        )
    ).one()

    disciplines_count = session.exec(
        select(func.count(func.distinct(Kata.discipline)))
        .select_from(KataCompletion)
        .join(Kata, KataCompletion.kata_id == Kata.id)
        .where(KataCompletion.user_id == current_user.id)
    ).one()

    ranks_count = session.exec(
        select(func.count(func.distinct(Kata.rank)))
        .select_from(KataCompletion)
        .join(Kata, KataCompletion.kata_id == Kata.id)
        .where(KataCompletion.user_id == current_user.id)
    ).one()

    return KataCompletionStats(
        total_completions=total_completions,
        completions_last_7_days=completions_last_7_days,
        disciplines_count=disciplines_count,
        ranks_count=ranks_count,
    )


@router.get("/completions/history")
def get_completions_history(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = (
        select(KataCompletion, Kata)
        .join(Kata, Kata.id == KataCompletion.kata_id)
        .where(KataCompletion.user_id == current_user.id)
        .order_by(KataCompletion.completed_at.desc())
    )

    rows = session.exec(statement).all()

    return [
        {
            "kata_id": completion.kata_id,
            "code": completion.code,
            "user_id": completion.user_id,
            "completed_at": completion.completed_at,
            "verified": completion.verified,
            "kata": {
                "id": kata.id,
                "title": kata.title,
                "discipline": kata.discipline,
                "rank": kata.rank,
            },
        }
        for completion, kata in rows
    ]

@router.post("/completions", response_model=KataCompletionPublic)
def add_completions(
    completion: KataCompletionCreate,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    kata = get_published_kata(completion.kata_id, session)
    if kata is None:
        raise HTTPException(status_code=404, detail="kata not found")

    completion_exist = session.exec(
        select(KataCompletion).where(
            KataCompletion.kata_id == kata.id, KataCompletion.user_id == user.id
        )
    ).first()

    if completion_exist:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Completion already exist",
        )

    user_rank = user.progression.core_dan if user.progression else None
    if not can_access_kata(user_rank, kata.rank):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this kata.",
        )

    kata_completion = KataCompletion(
        kata_id=completion.kata_id, user_id=user.id, code=completion.code
    )

    session.add(kata_completion)

    recalculate_progression(user.id, session)

    session.commit()
    session.refresh(kata_completion)

    return kata_completion
