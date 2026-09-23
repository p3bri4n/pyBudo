from tests.data.test_base import TestBase


class TestHealth(TestBase):
    def test_health(self, client):
        response = client.get("/health")
        assert response.status_code == 200
