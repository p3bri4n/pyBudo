import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

KATAS_PATH = Path(__file__).resolve().parents[1] / "data" / "examples.json"

def load_katas():
    #Récupère tous les katas depuis le json
    with KATAS_PATH.open(encoding="utf-8") as file:
        return json.load(file)

@router.get("/katas")
def get_katas():
    return load_katas()