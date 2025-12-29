"""
Router Admin - Endpoints d'administration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.dependencies.auth import require_admin
from app.models import User, UserProfile, Order, Payment, PaymentProof, Tournament, CatalogItem

router = APIRouter()

# Schémas Pydantic

class StatsResponse(BaseModel):
    total_users: int
    total_orders: int
    total_payments: int
    total_tournaments: int
    total_revenue_xof: int
    pending_payments: int
    active_tournaments: int

class UserListResponse(BaseModel):
    id: str
    email: str
    display_name: str
    role: str
    email_verified: bool
    created_at: str
    
    class Config:
        from_attributes = True

class UpdateUserRoleRequest(BaseModel):
    role: str

class PendingPaymentResponse(BaseModel):
    id: str
    user_email: str
    amount_xof: int
    payment_method: str
    created_at: str
    proof_count: int

@router.get("/stats", response_model=StatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Récupérer les statistiques globales de la plateforme (Admin uniquement)
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_payments = db.query(func.count(Payment.id)).scalar()
    total_tournaments = db.query(func.count(Tournament.id)).scalar()
    
    # Calculer le revenu total (paiements validés)
    total_revenue = db.query(func.sum(Payment.amount_xof)).filter(
        Payment.status == "validated"
    ).scalar() or 0
    
    # Compter les paiements en attente
    pending_payments = db.query(func.count(Payment.id)).filter(
        Payment.status.in_(["pending", "proof_uploaded"])
    ).scalar()
    
    # Compter les tournois actifs
    active_tournaments = db.query(func.count(Tournament.id)).filter(
        Tournament.status.in_(["open", "in_progress"])
    ).scalar()
    
    return StatsResponse(
        total_users=total_users,
        total_orders=total_orders,
        total_payments=total_payments,
        total_tournaments=total_tournaments,
        total_revenue_xof=total_revenue,
        pending_payments=pending_payments,
        active_tournaments=active_tournaments
    )

@router.get("/users", response_model=List[UserListResponse])
def list_users(
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Lister tous les utilisateurs (Admin uniquement)
    
    - **role**: Filtrer par rôle (user, organizer, admin)
    - **skip**: Nombre d'utilisateurs à sauter (pagination)
    - **limit**: Nombre maximum d'utilisateurs à retourner
    """
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        result.append(
            UserListResponse(
                id=str(user.id),
                email=user.email,
                display_name=profile.display_name if profile else user.email.split('@')[0],
                role=user.role,
                email_verified=user.email_verified_at is not None,
                created_at=user.created_at.isoformat()
            )
        )
    
    return result

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: UUID,
    request: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Changer le rôle d'un utilisateur (Admin uniquement)
    
    - **user_id**: ID de l'utilisateur
    - **role**: Nouveau rôle (user, organizer, admin)
    """
    if request.role not in ["user", "organizer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rôle invalide. Utilisez: user, organizer ou admin"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    user.role = request.role
    db.commit()
    
    return {
        "message": "Rôle mis à jour avec succès",
        "user_id": str(user.id),
        "new_role": user.role
    }

@router.get("/payments/pending", response_model=List[PendingPaymentResponse])
def list_pending_payments(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Lister les paiements en attente de validation (Admin uniquement)
    """
    payments = db.query(Payment).filter(
        Payment.status.in_(["pending", "proof_uploaded"])
    ).order_by(Payment.created_at.desc()).all()
    
    return [
        PendingPaymentResponse(
            id=str(payment.id),
            user_email=payment.user.email,
            amount_xof=payment.amount_xof,
            payment_method=payment.payment_method,
            created_at=payment.created_at.isoformat(),
            proof_count=len(payment.proofs)
        )
        for payment in payments
    ]

@router.post("/payments/{payment_id}/validate")
def validate_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Valider un paiement (Admin uniquement)
    
    - **payment_id**: ID du paiement à valider
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )
    
    if payment.status == "validated":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paiement déjà validé"
        )
    
    # Valider le paiement
    payment.status = "validated"
    payment.validated_at = datetime.utcnow()
    
    # Si c'est un paiement de commande, mettre à jour le statut
    if payment.order_id:
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "paid"
    
    # Si c'est un paiement de tournoi, mettre à jour l'inscription
    if payment.tournament_id:
        from app.models import TournamentRegistration
        registration = db.query(TournamentRegistration).filter(
            TournamentRegistration.tournament_id == payment.tournament_id,
            TournamentRegistration.user_id == payment.user_id
        ).first()
        if registration:
            registration.status = "paid"
    
    db.commit()
    
    return {
        "message": "Paiement validé avec succès",
        "payment_id": str(payment.id),
        "validated_at": payment.validated_at.isoformat()
    }

@router.post("/payments/{payment_id}/reject")
def reject_payment(
    payment_id: UUID,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Rejeter un paiement (Admin uniquement)
    
    - **payment_id**: ID du paiement à rejeter
    - **reason**: Raison du rejet (optionnel)
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )
    
    payment.status = "rejected"
    
    db.commit()
    
    return {
        "message": "Paiement rejeté",
        "payment_id": str(payment.id),
        "reason": reason
    }
