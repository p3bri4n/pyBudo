from pydantic import TypeAdapter

from app.schemas import KataInternal, KataPublic
from app.scripts.seed import load_katas
from tests.data.base_entity_helper import BaseEntityHelper


class TestsKatasCatalog(BaseEntityHelper):
    def test_katas_match_public_schema(self):
        katas = load_katas()
        for kata in katas:
            TypeAdapter(KataPublic).validate_python(kata)

    def test_katas_have_internal_fields(self):
        katas = load_katas()
        for kata in katas:
            TypeAdapter(KataInternal).validate_python(kata)
            assert "status" in kata["metadata"], f"{kata['id']} n'a pas de status"

    def test_katas_ids_are_unique(self):
        seen = set()
        katas = load_katas()
        for kata in katas:
            assert kata["id"] not in seen, f"id en double : {kata['id']}"
            seen.add(kata["id"])
