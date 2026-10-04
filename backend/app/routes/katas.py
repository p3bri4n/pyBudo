from typing import Annotated

from app.dependencies import get_session
from app.model import Kata
from app.schemas import KataPublic
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

router = APIRouter()


@router.get("/katas", response_model=list[KataPublic])
def get_katas(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(Kata)).all()
