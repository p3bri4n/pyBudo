from os import getenv

from sqlmodel import create_engine

DATABASE_URL = getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
