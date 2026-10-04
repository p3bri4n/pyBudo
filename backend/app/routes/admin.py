from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.dependencies import get_session, require_admin
from app.model import Kata, User
from app.schemas import KataInternal, UserPublic


router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/admin/katas", response_model=list[KataInternal])
def get_katas(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(Kata)).all()


@router.get("/admin/users", response_model=list[UserPublic])
def get_users(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(User)).all()


@router.get("/admin/users/{user_id}", response_model=UserPublic)
def get_user(user_id: int, session: Annotated[Session, Depends(get_session)]):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user
