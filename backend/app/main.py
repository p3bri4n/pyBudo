from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routes import auth, health, katas, progressions


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application is starting up")
    init_db()
    yield
    print("Application is shutting down")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(progressions.router)
app.include_router(katas.router)
