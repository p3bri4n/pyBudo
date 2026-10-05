import copy

import pytest
from pydantic import ValidationError
from sqlmodel import Session

from app.model import Kata
from app.scripts.seed import ingest_katas, load_katas, validate_catalog
from tests.data.base_entity_helper import BaseEntityHelper


class TestsKatasCatalog(BaseEntityHelper):
    def test_validate_catalog(self):
        katas = load_katas()
        validate_catalog(katas)

    def test_kata_without_status_return_error(self):
        katas = load_katas()
        del katas[0]["metadata"]["status"]
        with pytest.raises(ValueError, match="no status"):
            validate_catalog(katas)

    def test_kata_duplicate_id_return_error(self):
        katas = load_katas()
        kata = copy.deepcopy(katas[0])
        katas.append(kata)
        with pytest.raises(ValueError, match="duplicate"):
            validate_catalog(katas)

    def test_kata_class_tests_format(self):
        katas = load_katas()
        kata = next(k for k in katas if k["kata_type"] == "function")
        kata["id"] = "test-id"
        kata["kata_type"] = "class"
        kata["class_name"] = "class-test"
        katas.append(kata)
        with pytest.raises(ValidationError):
            validate_catalog(katas)

    def test_ingest_new_katas(self, session: Session):
        katas = load_katas()[:2]
        ingest_katas(katas, session)
        for kata in katas:
            assert session.get(Kata, kata["id"]) is not None

    def test_ingest_existing_id_reject_whole_lot(self, session: Session):
        katas1 = load_katas()[:1]
        ingest_katas(katas1, session)
        katas2 = load_katas()[:2]
        with pytest.raises(ValueError, match="already exist"):
            ingest_katas(katas2, session)

        assert session.get(Kata, katas2[1]["id"]) is None
