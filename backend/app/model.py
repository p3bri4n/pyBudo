from datetime import datetime, timezone
from typing import Optional
from sqlmodel import DateTime, SQLModel, UniqueConstraint, Field, Relationship

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)

    progression: Optional["Progression"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    discipline_progressions : list["DisciplineProgression"] = Relationship(back_populates="user")

class KataCompletion(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    kata_id: str = Field(nullable=False)
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    discipline: str = Field(default="core")
    completed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    verified: bool = Field(default=False)

class Progression(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, nullable=False)
    core_dan: str | None = None
    user: Optional[User] = Relationship(back_populates="progression")

class DisciplineProgression(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    discipline: str = Field()
    highest_dan_practiced: str = Field()

    user: Optional[User] = Relationship(back_populates="discipline_progressions")

    __table_args__ = (
        UniqueConstraint("user_id", "discipline", name="unique_user_discipline"),
    )