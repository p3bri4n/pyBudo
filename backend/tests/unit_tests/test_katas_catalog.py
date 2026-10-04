import copy

import pytest
from app.scripts.seed import load_katas, validate_catalog
from pydantic import ValidationError
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
