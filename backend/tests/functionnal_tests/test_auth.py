from fastapi import status
from pwdlib import PasswordHash
from sqlmodel import select

from app.model import Progression, User
from tests.data.base_entity_helper import BaseEntityHelper


class TestsRegister(BaseEntityHelper):
    def test_register_user_success(self, client):
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

    def test_register_user_existing_email(self, client, session):
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

    def test_register_user_existing_username(self, client, session):
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

    def test_register_password_is_hashed(self, client, session):
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

    def test_register_creates_progress(self, client, session):
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
    def test_login_user_success(self, client, session):
        hashed_password = PasswordHash.recommended().hash("password123")
        self._add_user(session=session, username="john", email="john@example.com", hashed_password=hashed_password)

        response = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "User logged in successfully"
        assert data["access_token"] is not None
        assert isinstance(data["access_token"], str)

    def test_login_user_no_db_user(self, client):
        response = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data["detail"] == "Incorrect email or password"
        assert data.get("access_token") is None

    def test_login_user_wrong_password(self, client, session):
        hashed_password = PasswordHash.recommended().hash("password123")
        self._add_user(session=session, username="john", email="john@example.com", hashed_password=hashed_password)
        response = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password456"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data["detail"] == "Incorrect email or password"
        assert data.get("access_token") is None
