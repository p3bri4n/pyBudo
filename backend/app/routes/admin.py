from typing import Annotated
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select
from sqlalchemy import String, cast, or_
from app.dependencies import get_session, require_admin
from app.model import Kata, KataCompletion, User
from app.schemas import (
    AdminCompletionStats,
    AdminStats,
    AdminUserCompletions,
    KataInternal,
    KataVariantCreate,
    UserAdmin, AdminKataCompletions, AdminKataSummary,
)
from app.services.admin.stats import build_completion_stats

router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])


@router.get("/katas", response_model=list[KataInternal])
def get_katas(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(Kata)).all()


@router.get("/users", response_model=list[UserAdmin])
def get_users(
    session: Annotated[Session, Depends(get_session)],
    search: str = Query(default="", max_length=100),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    statement = select(User)
    if search.strip():
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                User.username.ilike(term),
                User.email.ilike(term),
            )
        )

    statement = statement.order_by(User.username).offset(skip).limit(limit)
    return session.exec(statement).all()


@router.get("/users/{user_id}", response_model=UserAdmin)
def get_user(user_id: int, session: Annotated[Session, Depends(get_session)]):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.get(
    "/users/{user_id}/completions",
    response_model=AdminUserCompletions,
)
def get_admin_user_completions(
    user_id: int,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    stats = build_completion_stats(session, user_id=user_id)

    statement = (
        select(KataCompletion, Kata)
        .join(Kata, Kata.id == KataCompletion.kata_id)
        .where(KataCompletion.user_id == user_id)
        .order_by(KataCompletion.completed_at.desc())
    )

    rows = session.exec(statement).all()

    completions = [
        {
            "kata_id": completion.kata_id,
            "code": completion.code,
            "user_id": completion.user_id,
            "completed_at": completion.completed_at,
            "verified": completion.verified,
            "kata": {
                "id": kata.id,
                "title": kata.title,
                "discipline": kata.discipline,
                "rank": kata.rank,
            },
        }
        for completion, kata in rows
    ]

    return {
        "user": user,
        "stats": stats,
        "completions": completions,
    }


@router.get("/katas/search", response_model=list[AdminKataSummary])
def search_admin_katas(
    session: Annotated[Session, Depends(get_session)],
    search: str = Query(default="", max_length=100),
    limit: int = Query(default=20, ge=1, le=100),
):
    statement = select(Kata)

    if search.strip():
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Kata.id.ilike(term),
                cast(Kata.title, String).ilike(term),
                Kata.discipline.ilike(term),
                Kata.rank.ilike(term),
            )
        )

    katas = session.exec(
        statement.order_by(Kata.id).limit(limit)
    ).all()

    return [
        AdminKataSummary(
            id=kata.id,
            title=kata.title,
            discipline=kata.discipline,
            rank=kata.rank,
        )
        for kata in katas
    ]


@router.get(
    "/katas/{kata_id}/completions",
    response_model=AdminKataCompletions,
)
def get_admin_kata_completions(
    kata_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    kata = session.get(Kata, kata_id)

    if kata is None:
        raise HTTPException(status_code=404, detail="Kata not found")

    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)

    total = session.exec(
        select(func.count())
        .select_from(KataCompletion)
        .where(KataCompletion.kata_id == kata_id)
    ).one()

    recent = session.exec(
        select(func.count())
        .select_from(KataCompletion)
        .where(
            KataCompletion.kata_id == kata_id,
            KataCompletion.completed_at >= seven_days_ago,
        )
    ).one()

    distinct_users = session.exec(
        select(func.count(func.distinct(KataCompletion.user_id)))
        .where(KataCompletion.kata_id == kata_id)
    ).one()

    verified = session.exec(
        select(func.count())
        .select_from(KataCompletion)
        .where(
            KataCompletion.kata_id == kata_id,
            KataCompletion.verified.is_(True),
        )
    ).one()

    rows = session.exec(
        select(KataCompletion, User)
        .join(User, User.id == KataCompletion.user_id)
        .where(KataCompletion.kata_id == kata_id)
        .order_by(KataCompletion.completed_at.desc())
    ).all()

    return {
        "kata": {
            "id": kata.id,
            "title": kata.title,
            "discipline": kata.discipline,
            "rank": kata.rank,
        },
        "stats": {
            "total_completions": total,
            "completions_last_7_days": recent,
            "distinct_users_completed": distinct_users,
            "verified_completions": verified,
        },
        "completions": [
            {
                "user_id": completion.user_id,
                "username": user.username,
                "completed_at": completion.completed_at,
                "verified": completion.verified,
            }
            for completion, user in rows
        ],
    }
@router.get("/katas/{kata_id}", response_model=KataInternal)
def get_kata(kata_id: str, session: Annotated[Session, Depends(get_session)]):
    kata = session.get(Kata, kata_id)
    if not kata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Kata not found"
        )
    return kata


@router.post("/katas/{kata_id}/variants", response_model=KataInternal, status_code=201)
def add_variant(
    kata_id: str,
    body: KataVariantCreate,
    session: Annotated[Session, Depends(get_session)],
):
    kata_base = session.get(Kata, kata_id)
    if not kata_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Kata not found"
        )
    existing_id = session.get(Kata, body.kata.id)
    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{body.kata.id} already exist",
        )

    kata_dict = body.kata.model_dump()

    meta = kata_dict["metadata"]
    meta["status"] = "publie"

    if body.replace:
        kata_base.meta = {**kata_base.meta, "status": "archive"}
        session.add(kata_base)

    kata = Kata(**kata_dict, meta=meta)
    kata.variant_of = kata_base.id

    session.add(kata)

    session.commit()
    return kata


@router.patch("/katas/{kata_id}/archive", response_model=KataInternal)
def archive_kata(kata_id: str, session: Annotated[Session, Depends(get_session)]):
    kata = session.get(Kata, kata_id)
    if not kata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Kata not found"
        )
    kata.meta = {**kata.meta, "status": "archive"}
    session.commit()
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


@router.get("/completions/stats", response_model=AdminCompletionStats)
def get_admin_completion_stats(
    session: Session = Depends(get_session),
):
    return build_completion_stats(session)
