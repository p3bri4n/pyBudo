from os import getenv

from sqlmodel import SQLModel, create_engine

DATABASE_URL = getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)


def init_db():
    SQLModel.metadata.create_all(engine)
