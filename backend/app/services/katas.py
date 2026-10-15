from sqlmodel import Session, select
from typing import get_args
from app.model import Kata

from app.rank import Ranks


def get_published_kata(kata_id: str, session: Session) -> Kata | None:
    return session.exec(
        select(Kata).where(
            Kata.id == kata_id, Kata.meta["status"].as_string() == "publie"
        )
    ).first()


def can_access_kata(user_rank: str | None, kata_rank: str) -> bool:
    RANKS = get_args(Ranks)
    if user_rank not in RANKS or kata_rank not in RANKS:
        return False
    user_index = RANKS.index(user_rank)
    kata_index = RANKS.index(kata_rank)
    return kata_index <= user_index + 1
