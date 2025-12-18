"""
Application principale FastAPI FreeFire MVP
Point d'entrée de l'API avec configuration des routers et middleware
"""
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.routers import (
    health,
    auth, 
    catalog,
    orders,
    payments,
    tournaments,
    admin
)
from app.schemas import HealthResponse

# Configuration de l'application FastAPI
app = FastAPI(
    title="FreeFire MVP API",
    description="API complète pour la plateforme FreeFire MVP - E-commerce et Tournois",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS - Lire depuis variable d'environnement ou autoriser tout
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    cors_origins = ["*"]
else:
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration des routers (modules fonctionnels)
app.include_router(health.router, prefix="", tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(catalog.router, prefix="", tags=["catalog"])
app.include_router(orders.router, prefix="", tags=["orders"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(tournaments.router, prefix="/tournaments", tags=["tournaments"])
app.include_router(admin.router, prefix="/admin", tags=["administration"])

# Configuration des fichiers statiques (CSS, JS, images)
# Gérer le cas où le dossier n'existe pas (pour éviter les erreurs au démarrage)
import os
static_dir = "app/static"
if os.path.exists(static_dir) and os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_model=HealthResponse)
def root():
    """
    Endpoint racine - Information de base sur l'API
    """
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(),
        version="2.4.0"
    )

@app.on_event("startup")
async def startup_event():
    """
    Événements exécutés au démarrage de l'application
    """
    print("🚀 FreeFire MVP API démarrée")
    print("📊 Version: 2.4.0")
    print("🌐 Documentation: http://localhost:8080/docs")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Événements exécutés à l'arrêt de l'application
    """
    print("🛑 FreeFire MVP API arrêtée")

if __name__ == "__main__":
    import uvicorn
    # Utiliser le port depuis la variable d'environnement (Render) ou 8080 par défaut
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
