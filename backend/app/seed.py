from sqlmodel import Session

from app.db import engine, init_db
from app.model import Kata
from app.routes.katas import load_katas


def seed_katas():
    with Session(engine) as session:
        for kata in load_katas():
            session.merge(Kata(**kata))
        session.commit()

if __name__ == "__main__":
    init_db()
    seed_katas()