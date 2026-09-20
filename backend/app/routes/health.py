from fastapi import APIRouter, FastAPI

router = APIRouter()

@router.get("/health")
def read_root():
    return {"status": "healthy"}