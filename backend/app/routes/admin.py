from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.dependencies import get_session, require_admin
from app.model import Kata, User
from app.schemas import KataInternal, KataStats, UserAdmin, UserStats

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/admin/katas", response_model=list[KataInternal])
def get_katas(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(Kata)).all()


@router.get("/admin/katas/stats", response_model=KataStats)
def get_kata_stats(session: Annotated[Session, Depends(get_session)]):
    katas_number = session.exec(select(func.count()).select_from(Kata)).one()
    published_katas = session.exec(
        select(func.count())
        .select_from(Kata)
        .where(Kata.meta["status"].as_string() == "publie")
    ).one()
    return {"katas_number": katas_number, "published_katas": published_katas}


@router.get("/admin/users", response_model=list[UserAdmin])
def get_users(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(User)).all()


@router.get("/admin/users/stats", response_model=UserStats)
def get_users_stats(session: Annotated[Session, Depends(get_session)]):
    total_users = session.exec(select(func.count()).select_from(User)).one()
    active_users = session.exec(
        select(func.count()).select_from(User).where(User.is_active)
    ).one()
    return {"total_users": total_users, "active_users": active_users}


@router.get("/admin/users/{user_id}", response_model=UserAdmin)
def get_user(user_id: int, session: Annotated[Session, Depends(get_session)]):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.get("/admin/katas/{kata_id}", response_model=KataInternal)
def get_kata(kata_id: str, session: Annotated[Session, Depends(get_session)]):
    kata = session.get(Kata, kata_id)
    if not kata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Kata not found"
        )
    return kata
