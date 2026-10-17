import json
import sys
from pathlib import Path

from pydantic import TypeAdapter
from sqlmodel import Session, select

from app.db import engine
from app.model import Kata
from app.schemas import KataInternal, KataPublic

KATAS_PATH = Path(__file__).resolve().parents[1] / "data" / "katas.json"


def load_katas(path: Path = KATAS_PATH):
    # Récupère tous les katas depuis le json
    with path.open(encoding="utf-8") as file:
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


def ingest_katas(katas, session: Session):
    validate_catalog(katas)
    ids = [kata["id"] for kata in katas]
    katas_base = [kata for kata in katas if kata.get("variant_of") is None]
    katas_variant = [kata for kata in katas if kata.get("variant_of") is not None]
    kata_ids = session.exec(select(Kata.id)).all()
    missing = [
        kata["variant_of"]
        for kata in katas_variant
        if kata["variant_of"] not in kata_ids and kata["variant_of"] not in ids
    ]
    if missing:
        raise ValueError(f"Katas not found for the variant : {missing}")
    existing = session.exec(select(Kata.id).where(Kata.id.in_(ids))).all()
    if existing:
        raise ValueError(f"Katas with IDs {existing} already exist")
    # Ajouter les Kata sans variant puis ceux avec
    kata_total = katas_base + katas_variant
    for kata in kata_total:
        session.add(Kata(**kata, meta=kata["metadata"]))
    session.commit()


def seed_katas(path: Path):
    katas = load_katas(path)
    with Session(engine) as session:
        ingest_katas(katas, session)


if __name__ == "__main__":
    seed_katas(Path(sys.argv[1])) if len(sys.argv) > 1 else seed_katas(KATAS_PATH)
