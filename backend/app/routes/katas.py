import json
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.dependencies import get_session
from app.model import Kata
from app.schemas import KataPublic

router = APIRouter()

KATAS_PATH = Path(__file__).resolve().parents[1] / "data" / "examples.json"

def load_katas():
    #Récupère tous les katas depuis le json
    with KATAS_PATH.open(encoding="utf-8") as file:
       return json.load(file)

def get_kata(kata_id: str, session: Session) -> Kata | None:
    return session.get(Kata, kata_id)

@router.get("/katas", response_model=list[KataPublic])
def get_katas(session: Session = Depends(get_session)):
    return session.exec(select(Kata)).all()