from datetime import datetime
from typing import Annotated, Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, model_serializer

from app.rank import Ranks

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


class KataCompletionStats(BaseModel):
    total_completions: int
    completions_last_7_days: int
    disciplines_count: int
    ranks_count: int


class KataStats(BaseModel):
    katas_number: int
    published_katas: int


class AdminStats(BaseModel):
    users: UserStats
    katas: KataStats


class AdminCompletionStats(BaseModel):
    total_completions: int
    completions_last_7_days: int
    users_with_completions: int
    distinct_katas_completed: int
    disciplines_count: int
    ranks_count: int


class DisciplineProgressionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    discipline: str
    highest_dan_practiced: Ranks


class ProgressionPublic(BaseModel):
    core_dan: Ranks | None
    disciplines: list[DisciplineProgressionPublic] = []


class Translated(BaseModel):
    fr: str = Field(min_length=1)
    en: str | None = None

    # N'enregistre pas les traductions absentes ({"fr": …} plutôt que {"fr": …, "en": null}).
    # Mode "wrap" sans annotation de retour : le schéma OpenAPI reste un seul Translated
    @model_serializer(mode="wrap")
    def _drop_missing(self, handler):
        return {k: v for k, v in handler(self).items() if v is not None}


class KataBase(BaseModel):
    id: str
    rank: Ranks
    discipline: str
    variant_of: str | None = None
    title: Translated
    statement: Translated
    signature: str
    concepts_used: list[str]


class AdminKataPublic(BaseModel):
    id: str
    title: dict[str, str]
    discipline: str
    rank: str


class AdminKataCompletionPublic(BaseModel):
    kata_id: str
    code: str
    user_id: int
    completed_at: datetime
    verified: bool
    kata: AdminKataPublic


class AdminUserCompletions(BaseModel):
    user: UserAdmin
    stats: AdminCompletionStats
    completions: list[AdminKataCompletionPublic]


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


class KataVariantCreate(BaseModel):
    kata: KataInternal
    replace: bool = False
