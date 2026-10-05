from datetime import datetime
from typing import Annotated, Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from app.rank import Rank

MAX_CODE_LENGTH = 5000


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
    role: str
    created_at: datetime


class UserAdmin(UserPublic):
    id: int
    is_active: bool


class UserStats(BaseModel):
    total_users: int
    active_users: int


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
    code: str = Field(max_length=MAX_CODE_LENGTH)


class KataCompletionPublic(KataCompletionCreate):
    user_id: int
    completed_at: datetime
    verified: bool


class KataStats(BaseModel):
    katas_number: int
    published_katas: int


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


class FunctionKataTest(BaseModel):
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
    tests: list[FunctionKataTest]


class ClassKataPublic(KataBase):
    kata_type: Literal["class"]
    tests: list[ClassKataTest]
    class_name: str


KataPublic = Annotated[
    FunctionKataPublic | ClassKataPublic,
    Field(discriminator="kata_type"),
]


class KataInternalBase(BaseModel):
    metadata: dict = Field(
        validation_alias=AliasChoices("meta", "metadata")
    )  # Le champ est nommé "meta" dans la base de données
    solution_reference: str


class FunctionKataInternal(FunctionKataPublic, KataInternalBase):
    pass


class ClassKataInternal(ClassKataPublic, KataInternalBase):
    pass


KataInternal = Annotated[
    FunctionKataInternal | ClassKataInternal,
    Field(discriminator="kata_type"),
]
