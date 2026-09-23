from app.services.katas import get_kata
from tests.data.base_entity_helper import BaseEntityHelper


class TestsKata(BaseEntityHelper):
    def test_get_kata(self, session):
        self._add_kata(session=session)

        result = get_kata("kyu_10_addition", session)

        assert result is not None
        assert result.id == "kyu_10_addition"
        assert result.title == "Premier Kata"

    def test_get_kata_non_existent(self, session):
        result = get_kata("kyu_10_addition", session)
        assert result is None
