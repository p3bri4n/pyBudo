from app.services.katas import get_kata
from tests.data.base_entity_helper import BaseEntityHelper


class TestsKata(BaseEntityHelper):
    def test_get_kata(self, session):
        self.add_kata(session=session)

        result = get_kata("1", session)

        assert result is not None
        assert result.id == "1"
        assert result.title == "Premier Kata"

    def test_get_kata_non_existent(self, session):
        result = get_kata("1", session)
        assert result is None
