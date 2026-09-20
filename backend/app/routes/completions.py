from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.dependencies import get_current_user, get_session
from app.model import KataCompletion, User
from app.services.recalculate import recalculate_progression
from app.schemas import KataCompletionCreate, ProgressionPublic


router = APIRouter()

@router.get("/progression", response_model=ProgressionPublic)
def get_user_progress(user: User = Depends(get_current_user)):
    progression_public = ProgressionPublic(
        core_dan=user.progression.core_dan, 
        disciplines=user.discipline_progressions
    )
    return progression_public

@router.post("/completions")
def add_completions(
    completion: KataCompletionCreate, 
    user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    kata = KataCompletion(
        kata_id=completion.kata_id, 
        user_id=user.id, 
        discipline=completion.discipline
    )
    session.add(kata)

    recalculate_progression(user.id, session, kata.discipline)

    session.commit()
    return kata