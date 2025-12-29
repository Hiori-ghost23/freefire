"""
Router Auth - Endpoints d'authentification et gestion utilisateur
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.database import get_db
from app.dependencies.auth import create_access_token, get_current_user
from app.services import auth_service
from app.models import User, UserProfile

router = APIRouter()

# Schémas Pydantic pour les requêtes/réponses

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    password_confirmation: str
    display_name: Optional[str] = None
    uid_freefire: Optional[str] = Field(None, min_length=8, max_length=12)
    phone: Optional[str] = None
    phone_code: Optional[str] = "+33"
    country: Optional[str] = "FR"
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "joueur@example.com",
                "password": "MotDePasse123",
                "password_confirmation": "MotDePasse123",
                "display_name": "ProGamer",
                "uid_freefire": "123456789",
                "phone": "123456789",
                "phone_code": "+33",
                "country": "FR"
            }
        }

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "joueur@example.com",
                "password": "MotDePasse123"
            }
        }

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "joueur@example.com",
                    "display_name": "ProGamer",
                    "role": "user"
                }
            }
        }

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    role: str
    uid_freefire: Optional[str]
    phone: Optional[str]
    country_code: Optional[str]
    email_verified: bool
    created_at: str
    
    class Config:
        from_attributes = True

class VerifyEmailRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    new_password_confirmation: str

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Créer un nouveau compte utilisateur
    
    - **email**: Email unique de l'utilisateur
    - **password**: Mot de passe (min 8 caractères)
    - **password_confirmation**: Confirmation du mot de passe
    - **display_name**: Nom affiché (optionnel)
    - **uid_freefire**: UID FreeFire (8-12 chiffres)
    - **phone**: Numéro de téléphone
    - **country**: Code pays (BJ, CI, TG, etc.)
    """
    # Vérifier que les mots de passe correspondent
    if request.password != request.password_confirmation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas"
        )
    
    # Créer l'utilisateur
    user = auth_service.create_user(
        db=db,
        email=request.email,
        password=request.password,
        display_name=request.display_name,
        uid_freefire=request.uid_freefire,
        phone=request.phone,
        country=request.country
    )
    
    # Créer le token JWT
    access_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        role=user.role
    )
    
    return AuthResponse(
        access_token=access_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "display_name": request.display_name or user.email.split('@')[0],
            "role": user.role,
            "email_verified": user.email_verified_at is not None
        }
    )

@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Se connecter avec email et mot de passe
    
    - **email**: Email de l'utilisateur
    - **password**: Mot de passe
    
    Retourne un token JWT à utiliser dans les requêtes suivantes
    """
    # Authentifier l'utilisateur
    user = auth_service.authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Créer le token JWT
    access_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        role=user.role
    )
    
    return AuthResponse(
        access_token=access_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "display_name": user.email.split('@')[0],
            "role": user.role,
            "email_verified": user.email_verified_at is not None
        }
    )

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Récupérer le profil de l'utilisateur connecté
    
    Nécessite un token JWT valide dans le header Authorization
    """
    # Récupérer le profil utilisateur
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        display_name=profile.display_name if profile else current_user.email.split('@')[0],
        role=current_user.role,
        uid_freefire=profile.uid_freefire if profile else None,
        phone=profile.phone_msisdn if profile else None,
        country_code=profile.country_code if profile else None,
        email_verified=current_user.email_verified_at is not None,
        created_at=current_user.created_at.isoformat()
    )

@router.post("/verify-email")
def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """
    Vérifier l'email avec le token reçu par email
    
    - **token**: Token de vérification reçu par email
    """
    success = auth_service.verify_email_token(db, request.token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )
    
    return {"message": "Email vérifié avec succès"}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Demander un lien de réinitialisation de mot de passe
    
    - **email**: Email du compte
    
    Un email sera envoyé avec un lien de réinitialisation
    """
    token = auth_service.create_password_reset_token(db, request.email)
    
    # Toujours retourner succès pour éviter l'énumération d'emails
    return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé"}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Réinitialiser le mot de passe avec le token
    
    - **token**: Token reçu par email
    - **new_password**: Nouveau mot de passe
    - **new_password_confirmation**: Confirmation du nouveau mot de passe
    """
    # Vérifier que les mots de passe correspondent
    if request.new_password != request.new_password_confirmation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas"
        )
    
    success = auth_service.reset_password(db, request.token, request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )
    
    return {"message": "Mot de passe réinitialisé avec succès"}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Se déconnecter (côté client, supprimer le token)
    
    Note: Avec JWT, la déconnexion est gérée côté client en supprimant le token
    """
    return {"message": "Déconnexion réussie"}
