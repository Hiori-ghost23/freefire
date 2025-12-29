"""
Auth Service - Logique métier pour l'authentification
"""
import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
import secrets
from datetime import datetime, timedelta

from app.models import User, UserProfile, EmailVerification, PasswordReset
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
        role=role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Créer le profil utilisateur si des infos sont fournies
    if display_name or uid_freefire or phone or country:
        profile = UserProfile(
            user_id=user.id,
            display_name=display_name or email.split('@')[0],
            uid_freefire=uid_freefire,
            phone_msisdn=phone,
            country_code=country
        )
        db.add(profile)
        db.commit()
    
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

def create_email_verification_token(db: Session, user: User) -> EmailVerification:
    """
    Créer un token de vérification email
    """
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    email_verification = EmailVerification(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
        used=False
    )
    
    db.add(email_verification)
    db.commit()
    db.refresh(email_verification)
    
    return email_verification

def verify_email_token(db: Session, token: str) -> bool:
    """
    Vérifier un token de vérification email
    """
    email_verification = db.query(EmailVerification).filter(
        EmailVerification.token == token,
        EmailVerification.used == False,
        EmailVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not email_verification:
        return False
    
    # Marquer le token comme utilisé
    email_verification.used = True
    
    # Marquer l'email comme vérifié
    user = db.query(User).filter(User.id == email_verification.user_id).first()
    if user:
        user.email_verified_at = datetime.utcnow()
    
    db.commit()
    return True

def create_password_reset_token(db: Session, email: str) -> Optional[PasswordReset]:
    """
    Créer un token de réinitialisation de mot de passe
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    password_reset = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
        used=False
    )
    
    db.add(password_reset)
    db.commit()
    db.refresh(password_reset)
    
    return password_reset

def reset_password(db: Session, token: str, new_password: str) -> bool:
    """
    Réinitialiser le mot de passe avec un token
    """
    password_reset = db.query(PasswordReset).filter(
        PasswordReset.token == token,
        PasswordReset.used == False,
        PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not password_reset:
        return False
    
    # Marquer le token comme utilisé
    password_reset.used = True
    
    # Changer le mot de passe
    user = db.query(User).filter(User.id == password_reset.user_id).first()
    if user:
        user.password_hash = hash_password(new_password)
    
    db.commit()
    return True
