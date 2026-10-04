from app.model import Kata
from sqlmodel import Session


def get_kata(kata_id: str, session: Session) -> Kata | None:
    return session.get(Kata, kata_id)
