import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

KATAS_PATH = Path(__file__).resolve().parents[1] / "data" / "examples.json"

def load_katas():
    #Récupère tous les katas depuis le json
    with KATAS_PATH.open(encoding="utf-8") as file:
        return json.load(file)

KATAS = load_katas()
KATAS_BY_ID = {kata["id"]: kata for kata in KATAS}

def get_kata(kata_id: str) -> dict | None:
    return KATAS_BY_ID.get(kata_id)

@router.get("/katas")
def get_katas():
    return KATAS