from fastapi import APIRouter

router = APIRouter(prefix="/health")


@router.get("")
def read_root():
    return {"status": "healthy"}
