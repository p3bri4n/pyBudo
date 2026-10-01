from datetime import datetime
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.rank import Rank


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    username: str
    email: str


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


class KataCompletionPublic(BaseModel):
    kata_id: str
    user_id: int
    completed_at: datetime
    verified: bool


class DisciplineProgressionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    discipline: str
    highest_dan_practiced: Rank


class ProgressionPublic(BaseModel):
    core_dan: Rank | None
    disciplines: list[DisciplineProgressionPublic] = []


class KataBase(BaseModel):
    id: str
    rank: Rank
    discipline: str
    variant_of: str | None = None
    title: str
    statement: str
    signature: str
    concepts_used: list[str]


class KataTest(BaseModel):
    input: list[Any]
    output: Any


class MethodCall(BaseModel):
    method: str
    args: list[Any]
    expected_return: Any


class ClassKataTest(BaseModel):
    init: list[Any]
    calls: list[MethodCall]
    expected_state: dict[str, Any]


class FunctionKataPublic(KataBase):
    kata_type: Literal["function"]
    tests: list[KataTest]


class ClassKataPublic(KataBase):
    kata_type: Literal["class"]
    tests: list[ClassKataTest]
    class_name: str | None


KataPublic = Annotated[
    FunctionKataPublic | ClassKataPublic,
    Field(discriminator="kata_type"),
]


class KataInternal(KataBase):
    solution_reference: str
    metadata: dict
