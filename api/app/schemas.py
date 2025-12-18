"""
Schémas Pydantic pour la validation des données API
Tous les modèles de requête et réponse sont définis ici
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# ============================================================================
# SCHÉMAS D'AUTHENTIFICATION
# ============================================================================

class UserCreate(BaseModel):
    """Création d'un nouvel utilisateur"""
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: Optional[str] = Field(None, max_length=120)
    uid_freefire: Optional[str] = Field(None, max_length=32)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)


class UserLogin(BaseModel):
    """Connexion utilisateur"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Réponse utilisateur (sans données sensibles)"""
    id: float
    email: str
    role: str
    email_verified_at: Optional[datetime]
    created_at: datetime


class UserProfileResponse(BaseModel):
    """Profil utilisateur public"""
    user_id: float
    display_name: Optional[str]
    uid_freefire: Optional[str]
    country_code: Optional[str]


class TokenResponse(BaseModel):
    """Réponse de connexion avec token JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============================================================================
# SCHÉMAS DU CATALOGUE
# ============================================================================

class CatalogItemResponse(BaseModel):
    """Réponse produit du catalogue"""
    id: str
    type: str
    title: str
    sku: str
    price_amount: float
    price_currency: str
    attributes: Dict[str, Any]
    image_url: Optional[str]
    active: bool


class CatalogItemCreate(BaseModel):
    """Création d'un produit (admin only)"""
    type: str = Field(pattern="^(DIAMONDS|SUBSCRIPTION|PASS|LEVEL_UP|SPECIAL_DROP|ACCES_EVO)$")
    title: str = Field(min_length=2, max_length=120)
    sku: str = Field(min_length=2, max_length=60)
    price_amount: float = Field(gt=0)
    price_currency: str = Field(min_length=3, max_length=3, default="XOF")
    attributes: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    active: bool = True


# ============================================================================
# SCHÉMAS DES COMMANDES
# ============================================================================

class CreateOrderRequest(BaseModel):
    """Création d'une nouvelle commande"""
    catalogItemId: str
    uidFreeFire: float = Field(min_length=10, max_length=32)


class OrderResponse(BaseModel):
    """Réponse commande"""
    id: float
    order_code: str
    total_amount: float
    currency: str
    status: str
    catalog_item_id: str
    created_at: Optional[str]


# ============================================================================
# SCHÉMAS DES PAIEMENTS
# ============================================================================

class CheckoutRequest(BaseModel):
    """Initiation d'un paiement"""
    type: str = Field(pattern="^(order|entry_fee)$")
    targetId: str
    country: str = Field(min_length=2, max_length=2)
    method: Optional[str] = None


class Instructions(BaseModel):
    """Instructions de paiement"""
    title: str
    steps: List[str]


class CheckoutResponse(BaseModel):
    """Réponse d'initiation de paiement"""
    paymentId: str
    reference: str
    amount: float
    currency: str
    instructions: Instructions
    proofUploadUrl: str
    status: str
    expiresAt: str


class PaymentResponse(BaseModel):
    """Réponse détail de paiement"""
    id: float
    type: str
    amount: float
    currency: str
    status: str
    reference: str
    country: str
    method: Optional[str]
    created_at: datetime


class MethodsResponse(BaseModel):
    """Méthodes de paiement disponibles par pays"""
    methods: List[str]


# ============================================================================
# SCHÉMAS DES TOURNOIS
# ============================================================================

class TournamentCreate(BaseModel):
    """Création d'un nouveau tournoi"""
    visibility: str = Field(pattern="^(public|private)$")
    mode: str = Field(pattern="^(BR_SOLO|BR_DUO|BR_SQUAD|CLASH_SQUAD|LONE_WOLF|ROOM_HS)$")
    reward_text: Optional[str] = None
    description: Optional[str] = None
    start_at: datetime
    entry_fee_id: Optional[str] = None
    contact_whatsapp: Optional[str] = None
    ticket_code: Optional[str] = None


class TournamentResponse(BaseModel):
    """Réponse tournoi"""
    id: float
    visibility: str
    mode: str
    reward_text: Optional[str]
    description: Optional[str]
    start_at: datetime
    status: str
    entry_fee_id: Optional[str]
    contact_whatsapp: Optional[str]
    ticket_code: Optional[str]
    created_at: datetime


class TournamentRegistrationRequest(BaseModel):
    """Inscription à un tournoi"""
    tournament_id: float
    ticket_code: Optional[str] = None  # Requis pour les tournois privés


class TournamentRegistrationResponse(BaseModel):
    """Réponse inscription tournoi"""
    id: float
    tournament_id: float
    status: str
    payment_required: bool
    payment_amount: Optional[float]
    created_at: datetime


# ============================================================================
# SCHÉMAS DES FRAIS D'INSCRIPTION
# ============================================================================

class EntryFeeResponse(BaseModel):
    """Réponse frais d'inscription"""
    id: float
    name: str
    amount: float
    currency: str


# ============================================================================
# SCHÉMAS GÉNÉRIQUES
# ============================================================================

class SuccessResponse(BaseModel):
    """Réponse de succès générique"""
    ok: bool = True
    message: Optional[str] = "Merci de faire confiance a GOKU FF E-SHOP"


class ErrorResponse(BaseModel):
    """Réponse d'erreur standardisée"""
    error: str
    detail: Optional[str] = None
    code: Optional[int] = None


class HealthResponse(BaseModel):
    """Réponse du health check"""
    status: str = "ok"
    timestamp: datetime
    version: str = "2.4.0"
