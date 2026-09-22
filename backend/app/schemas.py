from typing import Any

from pydantic import BaseModel, ConfigDict

from app.rank import Rank


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    message: str
    access_token: str
    token_type: str = (
        "bearer"  # Valeur par défaut pour ne pas avoir à le fournir plus tard
    )


class TokenData(BaseModel):
    email: str | None = None


class KataCompletionCreate(BaseModel):
    kata_id: str


class DisciplineProgressionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    discipline: str
    highest_dan_practiced: Rank


class ProgressionPublic(BaseModel):
    core_dan: Rank | None
    disciplines: list[DisciplineProgressionPublic] = []


class KataTest(BaseModel):
    input: list[Any]
    output: Any


class KataPublic(BaseModel):
    id: str
    rank: Rank
    discipline: str
    variant_of: str | None = None
    title: str
    statement: str
    signature: str
    tests: list[KataTest]
    concepts_used: list[str]


class KataInternal(KataPublic):
    solution_reference: str
    metadata: dict
