"""
Configuration de la base de données PostgreSQL avec SQLAlchemy
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de connexion à la base de données
# Render utilise postgres:// mais SQLAlchemy nécessite postgresql://
database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/freefire_mvp")
# Normaliser l'URL pour gérer les deux formats
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = database_url

# Configuration du moteur SQLAlchemy avec pool de connexions pour production
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Vérifier les connexions avant utilisation
    pool_recycle=300,    # Recycler les connexions après 5 minutes
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Générateur de session de base de données pour FastAPI dependency injection
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
