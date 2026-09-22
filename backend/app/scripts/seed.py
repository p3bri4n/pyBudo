import json
from pathlib import Path

from sqlmodel import Session

from app.db import engine, init_db
from app.model import Kata

KATAS_PATH = Path(__file__).resolve().parents[1] / "data" / "examples.json"

def load_katas():
    #Récupère tous les katas depuis le json
    with KATAS_PATH.open(encoding="utf-8") as file:
       return json.load(file)

def seed_katas():
    with Session(engine) as session:
        for kata in load_katas():
            session.merge(Kata(**kata))
        session.commit()

if __name__ == "__main__":
    init_db()
    seed_katas()