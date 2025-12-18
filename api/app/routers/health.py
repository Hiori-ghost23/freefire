"""
Router Health - Endpoints de santé et monitoring
"""
from fastapi import APIRouter
from datetime import datetime
from app.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    """
    Health check endpoint - Vérifie que l'API est opérationnelle
    """
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(),
        version="2.4.0"
    )
