from datetime import datetime, timedelta, timezone

import jwt
from fastapi import status
from httpx import Client
from pwdlib import PasswordHash
from sqlmodel import Session, select

from app.dependencies import ALGORITHM, SECRET_KEY
from app.model import Progression, User
from tests.data.base_entity_helper import BaseEntityHelper


class TestsRegister(BaseEntityHelper):
    def test_register_user_success(self, client: Client):
        response = client.post(
            "/auth/register",
            json={
                "username": "john",
                "email": "john@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert "access_token" in data
        assert data["access_token"]

    def test_register_user_existing_email(self, client: Client, session: Session):
        self._add_user(session=session, email="jack@example.com")

        response = client.post(
            "/auth/register",
            json={
                "username": "jane",
                "email": "jack@example.com",
                "password": "password456",
            },
        )
        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        assert data["detail"] == "Email already registered"

    def test_register_user_existing_username(self, client: Client, session: Session):
        self._add_user(session=session, username="jack")

        response = client.post(
            "/auth/register",
            json={
                "username": "jack",
                "email": "jane@example.com",
                "password": "password456",
            },
        )
        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        assert data["detail"] == "Username already exists"

    def test_register_password_is_hashed(self, client: Client, session: Session):
        response = client.post(
            "/auth/register",
            json={
                "username": "john",
                "email": "john@example.com",
                "password": "password123",
            },
        )

        assert response.status_code == status.HTTP_200_OK

        user = session.exec(
            select(User).where(User.email == "john@example.com")
        ).first()

        assert user is not None
        assert user.hashed_password != "password123"
        password_hash = PasswordHash.recommended()
        assert password_hash.verify("password123", user.hashed_password)

    def test_register_creates_progress(self, client: Client, session: Session):
        response = client.post(
            "/auth/register",
            json={
                "username": "john",
                "email": "john@example.com",
                "password": "password123",
            },
        )

        assert response.status_code == status.HTTP_200_OK

        user = session.exec(
            select(User).where(User.email == "john@example.com")
        ).first()
        assert user is not None

        progression = session.exec(
            select(Progression).where(Progression.user_id == user.id)
        ).first()
        assert progression is not None


class TestsLogin(BaseEntityHelper):
    def test_login_user_success(self, client: Client, session: Session):
        self._add_user(
            session=session,
            username="john",
            email="john@example.com",
            password="password123",
        )

        response = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "User logged in successfully"
        assert data["access_token"] is not None
        assert isinstance(data["access_token"], str)

    def test_login_user_no_db_user(self, client: Client):
        response = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data["detail"] == "Incorrect email or password"
        assert data.get("access_token") is None

    def test_login_user_wrong_password(self, client: Client, session: Session):
        self._add_user(
            session=session,
            username="john",
            email="john@example.com",
            password="password123",
        )
        response = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password456"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data["detail"] == "Incorrect email or password"
        assert data.get("access_token") is None


class TestsToken(BaseEntityHelper):
    def test_token_missing_return_403(self, client: Client):
        response1 = client.post(
            "/completions",
            json={"kata_id": "kyu_10_addition"},
        )
        response2 = client.get(
            "/progression",
        )
        assert response1.status_code == status.HTTP_403_FORBIDDEN
        assert response2.status_code == status.HTTP_403_FORBIDDEN

    def test_no_sub_in_token(self, client: Client):
        token = jwt.encode(
            {"exp": datetime.now(timezone.utc) + timedelta(hours=24)},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        response = client.get(
            "/progression", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["detail"] == "Invalid token"

    def test_expired_token(self, client: Client):
        email = "john@example.com"
        expired_token = jwt.encode(
            {"sub": email, "exp": datetime.now(timezone.utc) - timedelta(seconds=1)},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        response = client.get(
            "/progression", headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["detail"] == "Expired token"

    def test_bad_token(self, client: Client):
        bad_token = "bad_token"
        response = client.get(
            "/progression", headers={"Authorization": f"Bearer {bad_token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["detail"] == "Invalid token"

    def test_user_not_found(self, client: Client):
        email = "john@example.com"
        token = jwt.encode(
            {"email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24)},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        response = client.get(
            "/progression", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["detail"] == "Invalid token"
