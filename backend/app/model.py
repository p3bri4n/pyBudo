from datetime import datetime, timezone
from typing import Optional

from sqlmodel import (
    JSON,
    Column,
    DateTime,
    Field,
    Relationship,
    SQLModel,
    UniqueConstraint,
)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)

    progression: Optional["Progression"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"uselist": False}
    )
    discipline_progressions: list["DisciplineProgression"] = Relationship(
        back_populates="user"
    )


class Kata(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    rank: str = Field(index=True)
    discipline: str = Field(index=True)
    variant_of: str | None = Field(default=None)
    title: str
    statement: str
    signature: str
    solution_reference: str
    tests: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    concepts_used: list[str] = Field(default_factory=list, sa_column=Column(JSON))


class KataCompletion(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    kata_id: str = Field(nullable=False)
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    completed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    verified: bool = Field(default=False)


class Progression(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, nullable=False)
    core_dan: str | None = None
    user: User | None = Relationship(back_populates="progression")


class DisciplineProgression(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    discipline: str = Field()
    highest_dan_practiced: str = Field()

    user: User | None = Relationship(back_populates="discipline_progressions")

    __table_args__ = (
        UniqueConstraint("user_id", "discipline", name="unique_user_discipline"),
    )
