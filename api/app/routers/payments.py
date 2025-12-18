"""
Router Payments - Endpoints pour la gestion des paiements
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models import Payment, PaymentProof, User

router = APIRouter()

# Configuration des méthodes de paiement par pays
PAYMENT_METHODS_BY_COUNTRY = {
    "BJ": ["mtn_momo", "moov_money"],
    "CI": ["mtn_momo", "moov_money"],
    "TG": ["mtn_momo", "moov_money"],
    "BF": ["mtn_momo", "moov_money"],
    "ML": ["mtn_momo", "moov_money"],
    "NE": ["mtn_momo", "moov_money"],
    "SN": ["mtn_momo", "moov_money"],
    "GW": ["mtn_momo"],
    "NG": ["mtn_momo"],
    "FR": ["remitly", "worldremit", "western_union", "ria", "moneygram", "taptap_send"]
}

# Schémas Pydantic

class PaymentMethodsResponse(BaseModel):
    country: str
    methods: List[Dict[str, str]]

class CreatePaymentRequest(BaseModel):
    order_id: Optional[UUID] = None
    tournament_id: Optional[UUID] = None
    amount_xof: int = Field(..., gt=0)
    payment_method: str
    country_code: str = Field(..., pattern="^(BJ|CI|TG|BF|ML|NE|SN|GW|NG|FR)$")
    phone_number: Optional[str] = None
    reference: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "order_id": "123e4567-e89b-12d3-a456-426614174000",
                "amount_xof": 1600,
                "payment_method": "mtn_momo",
                "country_code": "BJ",
                "phone_number": "+22912345678",
                "reference": "MP201224001234"
            }
        }

class PaymentResponse(BaseModel):
    id: str
    order_id: Optional[str]
    tournament_id: Optional[str]
    user_id: str
    amount_xof: int
    payment_method: str
    country_code: str
    status: str
    created_at: str
    validated_at: Optional[str]
    
    class Config:
        from_attributes = True

@router.get("/methods", response_model=PaymentMethodsResponse)
def get_payment_methods(country: str = "BJ"):
    """
    Récupérer les méthodes de paiement disponibles pour un pays
    
    - **country**: Code pays (BJ, CI, TG, BF, ML, NE, SN, GW, NG, FR)
    """
    if country not in PAYMENT_METHODS_BY_COUNTRY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pays non supporté: {country}"
        )
    
    methods = PAYMENT_METHODS_BY_COUNTRY[country]
    
    # Mapper les méthodes avec leurs noms affichables
    method_names = {
        "mtn_momo": "MTN Mobile Money",
        "moov_money": "Moov Money",
        "remitly": "Remitly",
        "worldremit": "WorldRemit",
        "western_union": "Western Union",
        "ria": "RIA Money Transfer",
        "moneygram": "MoneyGram",
        "taptap_send": "Taptap Send"
    }
    
    return PaymentMethodsResponse(
        country=country,
        methods=[
            {"id": method, "name": method_names.get(method, method)}
            for method in methods
        ]
    )

@router.post("/checkout", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    request: CreatePaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initier un paiement
    
    - **order_id**: ID de la commande (optionnel si tournament_id fourni)
    - **tournament_id**: ID du tournoi (optionnel si order_id fourni)
    - **amount_xof**: Montant en XOF
    - **payment_method**: Méthode de paiement
    - **country_code**: Code pays
    - **phone_number**: Numéro de téléphone (pour mobile money)
    - **reference**: Référence de transaction (optionnel)
    """
    # Vérifier qu'au moins order_id ou tournament_id est fourni
    if not request.order_id and not request.tournament_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="order_id ou tournament_id requis"
        )
    
    # Vérifier que la méthode est disponible pour le pays
    if request.payment_method not in PAYMENT_METHODS_BY_COUNTRY.get(request.country_code, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Méthode de paiement non disponible pour {request.country_code}"
        )
    
    # Créer le paiement
    payment = Payment(
        order_id=request.order_id,
        tournament_id=request.tournament_id,
        user_id=current_user.id,
        amount_xof=request.amount_xof,
        payment_method=request.payment_method,
        country_code=request.country_code,
        phone_number=request.phone_number,
        reference=request.reference,
        status="pending"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return PaymentResponse(
        id=str(payment.id),
        order_id=str(payment.order_id) if payment.order_id else None,
        tournament_id=str(payment.tournament_id) if payment.tournament_id else None,
        user_id=str(payment.user_id),
        amount_xof=payment.amount_xof,
        payment_method=payment.payment_method,
        country_code=payment.country_code,
        status=payment.status,
        created_at=payment.created_at.isoformat(),
        validated_at=None
    )

@router.post("/{payment_id}/proof", status_code=status.HTTP_201_CREATED)
async def upload_payment_proof(
    payment_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploader une preuve de paiement
    
    - **payment_id**: ID du paiement
    - **file**: Fichier image ou PDF (max 5MB)
    
    Formats acceptés: JPG, PNG, GIF, PDF
    """
    # Vérifier que le paiement existe et appartient à l'utilisateur
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )
    
    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Vérifier le type de fichier
    allowed_types = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de fichier non supporté. Utilisez JPG, PNG, GIF ou PDF"
        )
    
    # Lire le fichier
    content = await file.read()
    
    # Vérifier la taille (5MB max)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fichier trop volumineux. Maximum 5MB"
        )
    
    # Calculer le hash SHA256 du fichier (requis par le modèle)
    import hashlib
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Créer l'URL temporaire (en production, utiliser MinIO/S3)
    # Pour l'instant, on stocke juste les métadonnées
    file_url = f"/storage/payment-proofs/{payment.id}/{file.filename}"
    
    # Créer la preuve de paiement selon le modèle
    proof = PaymentProof(
        payment_id=payment.id,
        file_url=file_url,
        file_hash_sha256=file_hash,
        mime=file.content_type or "application/octet-stream",
        size_bytes=len(content)
    )
    
    db.add(proof)
    
    # Mettre à jour le statut du paiement
    payment.status = "proof_uploaded"
    
    db.commit()
    db.refresh(proof)
    
    return {
        "message": "Preuve de paiement uploadée avec succès",
        "proof_id": str(proof.id),
        "file_hash": file_hash,
        "status": "pending_validation",
        "note": "Le stockage de fichiers sera implémenté avec MinIO/S3 en production"
    }

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les détails d'un paiement
    
    - **payment_id**: ID du paiement
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )
    
    # Vérifier que l'utilisateur est propriétaire ou admin
    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    return PaymentResponse(
        id=str(payment.id),
        order_id=str(payment.order_id) if payment.order_id else None,
        tournament_id=str(payment.tournament_id) if payment.tournament_id else None,
        user_id=str(payment.user_id),
        amount_xof=payment.amount_xof,
        payment_method=payment.payment_method,
        country_code=payment.country_code,
        status=payment.status,
        created_at=payment.created_at.isoformat(),
        validated_at=payment.validated_at.isoformat() if payment.validated_at else None
    )
