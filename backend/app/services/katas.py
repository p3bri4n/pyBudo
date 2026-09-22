from sqlmodel import Session

from app.model import Kata


def get_kata(kata_id: str, session: Session) -> Kata | None:
    return session.get(Kata, kata_id)