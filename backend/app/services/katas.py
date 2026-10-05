from sqlmodel import Session, select

from app.model import Kata


def get_published_kata(kata_id: str, session: Session) -> Kata | None:
    return session.exec(
        select(Kata).where(
            Kata.id == kata_id, Kata.meta["status"].as_string() == "publie"
        )
    ).first()
