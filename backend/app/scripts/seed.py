import json
from pathlib import Path

from pydantic import TypeAdapter
from sqlmodel import Session

from app.db import engine, init_db
from app.model import Kata
from app.schemas import KataInternal, KataPublic

KATAS_PATH = Path(__file__).resolve().parents[1] / "data" / "katas.json"


def load_katas():
    # Récupère tous les katas depuis le json
    with KATAS_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def seed_katas():
    with Session(engine) as session:
        for kata in load_katas():
            TypeAdapter(KataPublic).validate_python(kata)
            TypeAdapter(KataInternal).validate_python(kata)
            session.merge(Kata(**kata, meta=kata["metadata"]))
        session.commit()


if __name__ == "__main__":
    init_db()
    seed_katas()
