from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.dependencies import get_session, require_admin
from app.model import Kata, User
from app.schemas import AdminStats, KataInternal, UserAdmin

router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])


@router.get("/katas", response_model=list[KataInternal])
def get_katas(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(Kata)).all()


@router.get("/users", response_model=list[UserAdmin])
def get_users(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(User)).all()


@router.get("/users/{user_id}", response_model=UserAdmin)
def get_user(user_id: int, session: Annotated[Session, Depends(get_session)]):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.get("/katas/{kata_id}", response_model=KataInternal)
def get_kata(kata_id: str, session: Annotated[Session, Depends(get_session)]):
    kata = session.get(Kata, kata_id)
    if not kata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Kata not found"
        )
    return kata


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(session: Annotated[Session, Depends(get_session)]):
    total_users = session.exec(select(func.count()).select_from(User)).one()
    active_users = session.exec(
        select(func.count()).select_from(User).where(User.is_active)
    ).one()

    users = {"total_users": total_users, "active_users": active_users}

    katas_number = session.exec(select(func.count()).select_from(Kata)).one()
    published_katas = session.exec(
        select(func.count())
        .select_from(Kata)
        .where(Kata.meta["status"].as_string() == "publie")
    ).one()

    katas = {"katas_number": katas_number, "published_katas": published_katas}

    return AdminStats(users=users, katas=katas)
