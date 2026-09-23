from tests.data.base_entity_helper import BaseEntityHelper


class HealthEntityHelper(BaseEntityHelper):
    def test_health(self, client):
        response = client.get("/health")
        assert response.status_code == 200
