"""
Configuration de la base de données PostgreSQL avec SQLAlchemy
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de connexion à la base de données
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/freefire_mvp")

# Configuration du moteur SQLAlchemy
engine = create_engine(DATABASE_URL)
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
