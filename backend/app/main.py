from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import init_db
from app.routes import auth, health, katas, progressions


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application is starting up")
    init_db()
    yield
    print("Application is shutting down")


app = FastAPI(lifespan=lifespan)


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(progressions.router)
app.include_router(katas.router)
