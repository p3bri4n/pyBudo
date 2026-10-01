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

def validate_catalog(katas):
    seen = set()
    for kata in katas:
        if kata["id"] in seen:
            raise ValueError(f"duplicate id : {kata['id']}")
        seen.add(kata["id"])
        validate_kata(kata)

def validate_kata(kata):
    # Vérifie que le json respecte le Schéma
    TypeAdapter(KataPublic).validate_python(kata)
    TypeAdapter(KataInternal).validate_python(kata)
    if "status" not in kata["metadata"]:
        raise ValueError(f"This kata has no status {kata['id']}")

def seed_katas():
    with Session(engine) as session:
        katas = load_katas()
        validate_catalog(katas)
        for kata in katas:
            session.merge(Kata(**kata, meta=kata["metadata"]))
        session.commit()


if __name__ == "__main__":
    init_db()
    seed_katas()
