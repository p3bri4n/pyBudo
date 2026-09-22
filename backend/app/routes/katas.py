from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.dependencies import get_session
from app.model import Kata
from app.schemas import KataPublic

router = APIRouter()

@router.get("/katas", response_model=list[KataPublic])
def get_katas(session: Session = Depends(get_session)):
    return session.exec(select(Kata)).all()