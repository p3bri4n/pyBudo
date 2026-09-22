import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

os.environ.setdefault("DATABASE_URL", "sqlite:///")
os.environ.setdefault("SECRET_KEY", "cle-de-test")

from app.dependencies import get_session
from app.main import app


@pytest.fixture(scope="function")
def session():
    engine = create_engine(os.getenv("DATABASE_URL"),
                           connect_args={"check_same_thread": False},
                           poolclass=StaticPool)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(scope="function")
def client(session):
    def override_get_session():
        yield session
    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
