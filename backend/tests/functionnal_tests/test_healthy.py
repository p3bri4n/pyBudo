from sqlmodel import Session

from tests.data.base_entity_helper import BaseEntityHelper


class TestsHealth(BaseEntityHelper):
    def test_health(self, client: Session):
        response = client.get("/health")
        assert response.status_code == 200
