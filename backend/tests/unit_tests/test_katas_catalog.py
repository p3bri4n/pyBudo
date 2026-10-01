
from app.scripts.seed import load_katas, validate_catalog
from tests.data.base_entity_helper import BaseEntityHelper


class TestsKatasCatalog(BaseEntityHelper):
    def test_validate_catalog(self):
        katas = load_katas()
        validate_catalog(katas)
