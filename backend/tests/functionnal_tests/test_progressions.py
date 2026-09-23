from fastapi import status
from pwdlib import PasswordHash

from app.model import DisciplineProgression, Kata, Progression, User
from tests.data.base_entity_helper import BaseEntityHelper


class TestsProgressions(BaseEntityHelper):
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
        self._add_kata(
            session=session,
            id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
            title="core 1",
        )

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
            json={"kata_id": "kyu_10_addition"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["kata_id"] == "kyu_10_addition"
        assert data["user_id"] == user.id
