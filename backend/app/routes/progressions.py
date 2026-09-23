from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.dependencies import get_current_user, get_session
from app.model import KataCompletion, User
from app.schemas import KataCompletionCreate, ProgressionPublic
from app.services.katas import get_kata
from app.services.recalculate import recalculate_progression

router = APIRouter()


@router.get("/progression", response_model=ProgressionPublic)
def get_user_progress(user: Annotated[User, Depends(get_current_user)]):
    progression_public = ProgressionPublic(
        core_dan=user.progression.core_dan, disciplines=user.discipline_progressions
    )
    return progression_public


@router.post("/completions")
def add_completions(
    completion: KataCompletionCreate,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    kata = get_kata(completion.kata_id, session)
    if kata is None:
        raise HTTPException(status_code=404, detail="kata not found")

    kata_completion = KataCompletion(
        kata_id=completion.kata_id,
        user_id=user.id,
    )

    session.add(kata_completion)

    recalculate_progression(user.id, session)

    session.commit()
    session.refresh(kata_completion)

    return kata_completion
