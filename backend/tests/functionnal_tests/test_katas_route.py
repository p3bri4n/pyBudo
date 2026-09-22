from fastapi import status

from app.model import Kata


class TestsKatas:
    def test_get_katas_success(self, client, session):
        kata1 = Kata(
            id="1",
            rank="kyu_10",
            discipline="core",
            title="core 1",
            statement="Écrivez une fonction qui reçoit deux entiers et renvoie leur somme.",
            signature="def additionner(a: int, b: int) -> int:",
            solution_reference="def additionner(a, b):\n    return a + b",

        )

        kata2 = Kata(
            id="2",
            rank="kyu_2",
            discipline="django",
            title="django 2",
            statement="Écrivez une fonction qui reçoit un entier et renvoie True s'il est pair, False sinon",
            signature="def est_pair(n: int) -> bool:",
            solution_reference="def est_pair(n):\n"
                               "if n % 2 == 0:\n"
                               "return True\n"
                               "else:\n"
                               "return False",

        )
        session.add_all([kata1, kata2])
        session.commit()

        response = client.get("/katas")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert data[0]["statement"] == "Écrivez une fonction qui reçoit deux entiers et renvoie leur somme."
        assert data[1]["statement"] == "Écrivez une fonction qui reçoit un entier " \
                                       "et renvoie True s'il est pair, False sinon"

    def test_get_katas_no_katas(self, client):
        response = client.get("/katas")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data == []
