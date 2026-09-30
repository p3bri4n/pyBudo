from fastapi import status
from httpx import Client
from sqlmodel import Session

from tests.data.base_entity_helper import BaseEntityHelper


class TestsProgressions(BaseEntityHelper):
    def test_get_user_progress(self, client: Client, session: Session):
        user = self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )
        self._add_progression(session, user_id=user.id, core_dan="kyu_9")
        self._add_discipline_progression(
            session, user_id=user.id, discipline="django", highest_dan_practiced="kyu_8"
        )
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

    def test_get_user_progress_returns_current_rank(
        self, client: Client, session: Session
    ):
        user = self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )
        self._add_progression(session, user_id=user.id)
        self._add_kata(session, id="kyu_10_soustraction", rank="kyu_10")
        self._add_kata(session, id="kyu_8_somme", rank="kyu_8")
        self._add_completed_kata(session, user_id=user.id, kata_id="kyu_10_addition")

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # kyu_10 pas encore terminé
        response = client.get("/progression", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["current_rank"] == "kyu_10"

        # dernier kyu_10 réussi : core_dan obtenu et passage au kyu_8
        response = client.post(
            "/completions", json={"kata_id": "kyu_10_soustraction"}, headers=headers
        )
        assert response.status_code == status.HTTP_200_OK

        data = client.get("/progression", headers=headers).json()
        assert data["core_dan"] == "kyu_10"
        assert data["current_rank"] == "kyu_8"

    def test_new_kata_in_obtained_rank_does_not_send_user_back(
        self, client: Client, session: Session
    ):
        user = self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )
        self._add_progression(session, user_id=user.id, core_dan="kyu_10")
        self._add_completed_kata(session, user_id=user.id, kata_id="kyu_10_addition")
        self._add_kata(session, id="kyu_8_somme", rank="kyu_8")
        # Ajouté par l'admin après l'obtention du kyu_10
        self._add_kata(session, id="kyu_10_soustraction", rank="kyu_10")

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        token = login.json()["access_token"]

        response = client.get(
            "/progression", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["core_dan"] == "kyu_10"
        assert data["current_rank"] == "kyu_8"

    def test_add_completions(self, client: Client, session: Session):
        kata = self._add_kata(
            session=session,
            id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
            title="core 1",
        )
        user = self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )

        self._add_progression(session, user_id=user.id)

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert login.status_code == status.HTTP_200_OK
        token = login.json()["access_token"]

        response = client.post(
            "/completions",
            json={"kata_id": kata.id},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["kata_id"] == "kyu_10_addition"
        assert data["user_id"] == user.id

    def test_add_completion_with_unknown_kata_returns_404(
        self, client: Client, session: Session
    ):
        self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        token = login.json()["access_token"]
        assert login.status_code == status.HTTP_200_OK
        response = client.post(
            "/completions",
            json={"kata_id": "kyu_10_addition"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_double_completion_return_409(self, client: Client, session: Session):
        kata = self._add_kata(
            session=session,
            id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
            title="core 1",
        )
        user = self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )

        self._add_progression(session, user_id=user.id)

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert login.status_code == status.HTTP_200_OK
        token = login.json()["access_token"]

        response = client.post(
            "/completions",
            json={"kata_id": kata.id},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == status.HTTP_200_OK

        response = client.post(
            "/completions",
            json={"kata_id": kata.id},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_get_completions_returns_only_user_completions(
        self, client: Client, session: Session
    ):
        user = self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )
        other = self._add_user(
            session, username="jane", email="jane@example.com", password="password123"
        )
        self._add_completed_kata(session, user_id=user.id, kata_id="kyu_10_addition")
        self._add_completed_kata(session, user_id=other.id, kata_id="kyu_10_perimetre")

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert login.status_code == status.HTTP_200_OK
        token = login.json()["access_token"]

        response = client.get(
            "/completions", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert len(data) == 1
        assert data[0]["kata_id"] == "kyu_10_addition"
        assert data[0]["user_id"] == user.id

    def test_get_completions_without_completion_returns_empty_list(
        self, client: Client, session: Session
    ):
        self._add_user(
            session, username="john", email="john@example.com", password="password123"
        )

        login = client.post(
            "/auth/login", json={"email": "john@example.com", "password": "password123"}
        )
        assert login.status_code == status.HTTP_200_OK
        token = login.json()["access_token"]

        response = client.get(
            "/completions", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_get_completions_without_token_is_rejected(self, client: Client):
        response = client.get("/completions")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )
