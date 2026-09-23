from fastapi import status
from pwdlib import PasswordHash

from app.model import DisciplineProgression, Kata, Progression, User
from tests.data.test_base import TestBase


class TestProgressions(TestBase):
    def test_get_user_progress(self, client, session):
        password_hash = PasswordHash.recommended()
        hashed_password = password_hash.hash("password123")
        user = User(
            username="john",
            email="john@example.com",
            hashed_password=hashed_password,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        progression = Progression(user_id=user.id, core_dan="kyu_9")
        django_progression = DisciplineProgression(
            user_id=user.id, discipline="django", highest_dan_practiced="kyu_8"
        )
        session.add_all([progression, django_progression])
        session.commit()
        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert login.status_code == status.HTTP_200_OK
        token = login.json()["access_token"]

        response = client.get(
            "/progression", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["core_dan"] == "kyu_9"
        assert isinstance(data["disciplines"], list)
        assert data["disciplines"][0]["discipline"] == "django"
        assert data["disciplines"][0]["highest_dan_practiced"] == "kyu_8"

    def test_add_completions(self, client, session):
        kata = Kata(
            id="1",
            rank="kyu_10",
            discipline="core",
            title="core 1",
            statement="Écrivez une fonction qui reçoit deux entiers et renvoie leur somme.",
            signature="def additionner(a: int, b: int) -> int:",
            solution_reference="def additionner(a, b):\n    return a + b",
        )
        session.add(kata)
        session.commit()

        password_hash = PasswordHash.recommended()
        hashed_password = password_hash.hash("password123")
        user = User(
            username="john",
            email="john@example.com",
            hashed_password=hashed_password,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        user_progression = Progression(user_id=user.id)
        session.add(user_progression)
        session.commit()
        session.refresh(user_progression)

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert login.status_code == status.HTTP_200_OK
        token = login.json()["access_token"]

        response = client.post(
            "/completions",
            json={"kata_id": "1"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["kata_id"] == "1"
        assert data["user_id"] == 1
