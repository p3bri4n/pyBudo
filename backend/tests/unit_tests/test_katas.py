from app.services.katas import get_kata
from tests.data.test_base import TestBase


class TestKata(TestBase):
    def test_get_kata(self, session):
        kata = self.add_kata(
            id="1",
            rank="kyu_10",
            discipline="core",
            title="Premier Kata",
            statement="Écrivez une fonction qui reçoit deux entiers et renvoie leur somme.",
            signature="def additionner(a: int, b: int) -> int:",
            solution_reference="def additionner(a, b):\n    return a + b",
        )
        session.add(kata)
        session.commit()

        result = get_kata("1", session)

        assert result is not None
        assert result.id == "1"
        assert result.title == "Premier Kata"

    def test_get_kata_non_existent(self, session):
        result = get_kata("1", session)
        assert result is None
