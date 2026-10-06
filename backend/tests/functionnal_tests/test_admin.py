from fastapi import status
from httpx import Client
from sqlmodel import Session

from tests.data.base_entity_helper import BaseEntityHelper


class TestsAdminAccess(BaseEntityHelper):
    def test_without_token(self, client: Client):
        response = client.get("/admin/users")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_simple_user(self, client: Client, session: Session):
        self._add_user(session, role="user")
        token = self._auth_user(client)
        response = client.get(
            "/admin/users", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_user(self, client: Client, session: Session):
        self._add_user(session, role="admin")
        token = self._auth_user(client)
        response = client.get(
            "/admin/users", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK


class TestsAdminKatas(BaseEntityHelper):
    def test_katas_has_solution_reference_and_metadata(
        self, client: Client, session: Session
    ):
        self._add_user(session, role="admin")
        self._add_kata(
            session,
            solution_reference="def additionner(a, b):\n    return a + b",
            meta={"difficulty": "easy"},
        )
        token = self._auth_user(client)
        response = client.get(
            "/admin/katas", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        for kata in data:
            assert (
                kata["solution_reference"] == "def additionner(a, b):\n    return a + b"
            )
            assert kata["metadata"] == {"difficulty": "easy"}

    def test_get_kata_id_200_and_404(self, client: Client, session: Session):
        self._add_user(session, role="admin")
        self._add_kata(session, id="kyu_10_addition")
        token = self._auth_user(client)
        response = client.get(
            "/admin/katas/kyu_10_addition", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == "kyu_10_addition"

        response_not_found = client.get(
            "/admin/katas/non_existent_kata",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response_not_found.status_code == status.HTTP_404_NOT_FOUND

    def test_kata_become_archived(self, client: Client, session: Session):
        self._add_user(session, role="admin")
        self._add_kata(session, id="kyu_10_addition")
        self._add_kata(session, id="kyu_8_division")
        token = self._auth_user(client)

        response1 = client.get(
            "/admin/katas/kyu_10_addition", headers={"Authorization": f"Bearer {token}"}
        )

        assert response1.status_code == status.HTTP_200_OK

        response2 = client.patch(
            "/admin/katas/kyu_10_addition/archive",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response2.status_code == status.HTTP_200_OK
        data2 = response2.json()
        assert data2["metadata"]["status"] == "archive"

        response3 = client.get("/katas", headers={"Authorization": f"Bearer {token}"})

        assert response3.status_code == status.HTTP_200_OK
        data3 = response3.json()
        katas = {kata["id"]: kata for kata in data3}
        assert "kyu_10_addition" not in katas
        assert "kyu_8_division" in katas

    def test_completion_archived_kata_returns_404(
        self, client: Client, session: Session
    ):
        self._add_user(session, role="admin")
        self._add_kata(
            session,
            id="kyu_10_addition",
        )

        token = self._auth_user(client)

        response1 = client.patch(
            "/admin/katas/kyu_10_addition/archive",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response1.status_code == status.HTTP_200_OK

        code = "my-code"
        response2 = client.post(
            "/completions",
            json={"kata_id": "kyu_10_addition", "code": code},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response2.status_code == status.HTTP_404_NOT_FOUND

        response3 = client.patch(
            "/admin/katas/kyu_8_division/archive",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response3.status_code == status.HTTP_404_NOT_FOUND


class TestsAdminUsers(BaseEntityHelper):
    def test_admin_users_no_hashed_password(self, client: Client, session: Session):
        self._add_user(session, role="admin")
        token = self._auth_user(client)
        response = client.get(
            "/admin/users", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for user in data:
            assert "hashed_password" not in user

    def test_get_user_id_200_and_404(self, client: Client, session: Session):
        user = self._add_user(session, role="admin")
        token = self._auth_user(client)
        response = client.get(
            f"/admin/users/{user.id}", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        response_not_found = client.get(
            f"/admin/users/{user.id + 1}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response_not_found.status_code == status.HTTP_404_NOT_FOUND


class TestsAdminStats(BaseEntityHelper):
    def test_admin_stats(self, client: Client, session: Session):
        self._add_user(session, role="admin")
        self._add_user(
            session,
            role="user",
            username="test",
            email="test@example.com",
            is_active=False,
        )
        self._add_kata(session, id="kyu_10_addition", meta={"status": "publie"})
        self._add_kata(session, id="kyu_9_subtraction", meta={"status": "draft"})

        token = self._auth_user(client)
        response = client.get(
            "/admin/stats", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["katas"]["katas_number"] == 2
        assert data["katas"]["published_katas"] == 1

        assert data["users"]["total_users"] == 2
        assert data["users"]["active_users"] == 1
