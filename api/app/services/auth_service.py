"""
Auth Service - Logique métier pour l'authentification
"""
import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
import secrets
from datetime import datetime, timedelta

from app.models import User, AuthToken
from app.dependencies.auth import create_access_token

def hash_password(password: str) -> str:
    """
    Hasher un mot de passe avec bcrypt
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifier un mot de passe contre son hash
    """
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def create_user(
    db: Session,
    email: str,
    password: str,
    display_name: Optional[str] = None,
    uid_freefire: Optional[str] = None,
    phone: Optional[str] = None,
    phone_code: Optional[str] = None,
    country: Optional[str] = None,
    role: str = "user"
) -> User:
    """
    Créer un nouvel utilisateur
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Créer l'utilisateur
    user = User(
        email=email,
        password_hash=hash_password(password),
        display_name=display_name or email.split('@')[0],
        uid_freefire=uid_freefire,
        phone=phone,
        phone_code=phone_code,
        country_code=country,
        role=role,
        email_verified=False
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Créer un token de vérification email
    create_email_verification_token(db, user)
    
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authentifier un utilisateur avec email et mot de passe
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user

def create_email_verification_token(db: Session, user: User) -> AuthToken:
    """
    Créer un token de vérification email
    """
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    auth_token = AuthToken(
        user_id=user.id,
        token=token,
        token_type="email_verification",
        expires_at=expires_at
    )
    
    db.add(auth_token)
    db.commit()
    db.refresh(auth_token)
    
    return auth_token

def verify_email_token(db: Session, token: str) -> bool:
    """
    Vérifier un token de vérification email
    """
    auth_token = db.query(AuthToken).filter(
        AuthToken.token == token,
        AuthToken.token_type == "email_verification",
        AuthToken.used_at.is_(None),
        AuthToken.expires_at > datetime.utcnow()
    ).first()
    
    if not auth_token:
        return False
    
    # Marquer le token comme utilisé
    auth_token.used_at = datetime.utcnow()
    
    # Marquer l'email comme vérifié
    user = db.query(User).filter(User.id == auth_token.user_id).first()
    if user:
        user.email_verified = True
    
    db.commit()
    return True

def create_password_reset_token(db: Session, email: str) -> Optional[AuthToken]:
    """
    Créer un token de réinitialisation de mot de passe
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    auth_token = AuthToken(
        user_id=user.id,
        token=token,
        token_type="password_reset",
        expires_at=expires_at
    )
    
    db.add(auth_token)
    db.commit()
    db.refresh(auth_token)
    
    return auth_token

def reset_password(db: Session, token: str, new_password: str) -> bool:
    """
    Réinitialiser le mot de passe avec un token
    """
    auth_token = db.query(AuthToken).filter(
        AuthToken.token == token,
        AuthToken.token_type == "password_reset",
        AuthToken.used_at.is_(None),
        AuthToken.expires_at > datetime.utcnow()
    ).first()
    
    if not auth_token:
        return False
    
    # Marquer le token comme utilisé
    auth_token.used_at = datetime.utcnow()
    
    # Changer le mot de passe
    user = db.query(User).filter(User.id == auth_token.user_id).first()
    if user:
        user.password_hash = hash_password(new_password)
    
    db.commit()
    return True
