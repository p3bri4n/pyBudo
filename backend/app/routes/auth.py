from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pwdlib import PasswordHash
from sqlmodel import Session, select

from app.dependencies import generate_token, get_current_user, get_session
from app.model import Progression, User
from app.schemas import Token, UserLogin, UserPublic, UserRegister

router = APIRouter()

password_hash = PasswordHash.recommended()


@router.post("/auth/register")
def register_user(
    user: UserRegister, session: Annotated[Session, Depends(get_session)]
):
    # Verifie que l'email est unique
    existing_email = session.exec(select(User).where(User.email == user.email)).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Verifie que le nom d'utilisateur est unique
    existing_username = session.exec(
        select(User).where(User.username == user.username)
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    # Hash le mot de passe
    hashed_password = password_hash.hash(user.password)

    # Crée l'utilisateur
    user = User(
        username=user.username, email=user.email, hashed_password=hashed_password
    )

    # Stocke l'utilisateur dans la base de données
    session.add(user)
    session.flush()  # Flush permet d'avoir un user.id

    # Il faut maintenant créer un objet Progression pour l'utilisateur
    progress = Progression(user_id=user.id)
    session.add(progress)

    session.commit()

    # Refresh n'est pas très utile ici puisqu'on a pas de colonne qui sera généré par la base et inconnu ici
    session.refresh(user)
    session.refresh(progress)

    # Génère le token JWT
    encoded_jwt = generate_token(user.email)

    return Token(message="User registered successfully", access_token=encoded_jwt)


@router.post("/auth/login")
def login_user(user: UserLogin, session: Annotated[Session, Depends(get_session)]):
    # Vérifie que l'utilisateur existe
    db_user = session.exec(select(User).where(User.email == user.email)).first()

    # Retourne l'erreur si l'email ou le mot de passe est incorrect
    if not db_user or not password_hash.verify(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Génère le token JWT
    encoded_jwt = generate_token(db_user.email)

    return Token(message="User logged in successfully", access_token=encoded_jwt)


@router.get("/auth/me", response_model=UserPublic)
def get_me(user: Annotated[User, Depends(get_current_user)]):
    return user
