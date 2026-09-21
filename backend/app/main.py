
from fastapi import FastAPI
from app.db import init_db
from app.routes import auth, completions, health, katas

app = FastAPI()

init_db()

app.include_router(health.router)

app.include_router(auth.router)

app.include_router(completions.router)

app.include_router(katas.router)