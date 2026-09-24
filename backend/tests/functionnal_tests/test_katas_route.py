from fastapi import status
from httpx import Client
from sqlmodel import Session

from tests.data.base_entity_helper import BaseEntityHelper


class TestsKatas(BaseEntityHelper):
    def test_get_katas_success(self, client: Client, session: Session):
        kata1 = self._add_kata(
            session=session,
            id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
            statement="Écrivez une fonction qui reçoit deux entiers et renvoie leur somme.",
            solution_reference="def additionner(a, b):\n    return a + b",
        )

        kata2 = self._add_kata(
            session=session,
            id="kyu_2_check_pair",
            rank="kyu_2",
            discipline="django",
            statement="Écrivez une fonction qui reçoit un entier et renvoie True s'il est pair, False sinon",
            solution_reference="def est_pair(n):\n"
            "if n % 2 == 0:\n"
            "return True\n"
            "else:\n"
            "return False",
        )

        response = client.get("/katas")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        katas = {kata["id"]: kata for kata in data}
        assert len(data) == 2
        assert katas["kyu_10_addition"]["statement"] == kata1.statement
        assert katas["kyu_2_check_pair"]["statement"] == kata2.statement
        assert "solution_reference" not in katas["kyu_10_addition"]

    def test_get_katas_no_katas(self, client: Client):
        response = client.get("/katas")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data == []
