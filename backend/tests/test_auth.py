from fastapi import status
from sqlmodel import select
from app.model import User, Progression
from pwdlib import PasswordHash


def test_register_user_success(client):
    response = client.post("/auth/register",
                           json={"username": "john",
                                 "email": "john@example.com",
                                 "password": "password123"}
                           )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert "access_token" in data
    assert data["access_token"]


def test_register_user_existing_email(client):
    existing_user = {
        "username": "jack",
        "email": "jack@example.com",
        "password": "password123",
    }

    first_response = client.post("/auth/register", json=existing_user)
    assert first_response.status_code == status.HTTP_200_OK

    second_response = client.post("/auth/register",
                                  json={"username": "jane",
                                        "email": "jack@example.com",
                                        "password": "password456"}
                                  )
    assert second_response.status_code == status.HTTP_409_CONFLICT
    data = second_response.json()
    assert data["detail"] == "Email already registered"


def test_register_user_existing_username(client):
    existing_user = {
        "username": "jack",
        "email": "jack@example.com",
        "password": "password123",
    }
    first_response = client.post("/auth/register", json=existing_user)
    assert first_response.status_code == status.HTTP_200_OK
    second_response = client.post("/auth/register",
                                  json={"username": "jack",
                                        "email": "jane@example.com",
                                        "password": "password456"}
                                  )
    assert second_response.status_code == status.HTTP_409_CONFLICT
    data = second_response.json()
    assert data["detail"] == "Username already exists"


def test_register_password_is_hashed(client, session):
    response = client.post("/auth/register",
                           json={"username": "john",
                                 "email": "john@example.com",
                                 "password": "password123"}
                           )

    assert response.status_code == status.HTTP_200_OK

    user = session.exec(select(User).where(User.email == "john@example.com")).first()

    assert user is not None
    assert user.hashed_password != "password123"
    password_hash = PasswordHash.recommended()
    assert password_hash.verify("password123", user.hashed_password)


def test_register_creates_progress(client, session):
    response = client.post("/auth/register",
                           json={"username": "john",
                                 "email": "john@example.com",
                                 "password": "password123"}
                           )

    assert response.status_code == status.HTTP_200_OK

    user = session.exec(select(User).where(User.email == "john@example.com")).first()
    assert user is not None

    progression = session.exec(select(Progression).where(Progression.user_id == user.id)).first()
    assert progression is not None
