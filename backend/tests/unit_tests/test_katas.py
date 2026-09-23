from app.services.katas import get_kata
from tests.data.base_entity_helper import BaseEntityHelper


class TestsKata(BaseEntityHelper):
    def test_get_kata(self, session):
        kata = self._add_kata(session=session)

        result = get_kata(kata.id, session)

        assert result is not None
        assert result.id == kata.id
        assert result.title == kata.title

    def test_get_kata_non_existent(self, session):
        result = get_kata("kata_inexistant", session)
        assert result is None
