from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.dependencies import get_current_user, get_session
from app.model import KataCompletion, User
from app.schemas import KataCompletionCreate, KataCompletionPublic, ProgressionPublic
from app.services.katas import get_kata
from app.services.recalculate import recalculate_progression

router = APIRouter()


@router.get("/progression", response_model=ProgressionPublic)
def get_user_progress(user: Annotated[User, Depends(get_current_user)]):
    progression_public = ProgressionPublic(
        core_dan=user.progression.core_dan, disciplines=user.discipline_progressions
    )
    return progression_public


@router.post("/completions", response_model=KataCompletionPublic)
def add_completions(
    completion: KataCompletionCreate,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    kata = get_kata(completion.kata_id, session)
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

    kata_completion = KataCompletion(
        kata_id=completion.kata_id,
        user_id=user.id,
    )

    session.add(kata_completion)

    recalculate_progression(user.id, session)

    session.commit()
    session.refresh(kata_completion)

    return kata_completion
