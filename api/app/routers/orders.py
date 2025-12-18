"""
Router Orders - Endpoints pour la gestion des commandes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models import Order, User, CatalogItem

router = APIRouter()

# Schémas Pydantic

class CreateOrderRequest(BaseModel):
    catalog_item_id: UUID
    uid_freefire: str = Field(..., min_length=8, max_length=12)
    idempotency_key: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "catalog_item_id": "123e4567-e89b-12d3-a456-426614174000",
                "uid_freefire": "123456789",
                "idempotency_key": "order-2024-001"
            }
        }

class OrderResponse(BaseModel):
    id: str
    order_code: str
    user_id: str
    catalog_item_id: str
    catalog_item_name: str
    price_xof: int
    uid_freefire: str
    status: str
    created_at: str
    delivered_at: Optional[str]
    
    class Config:
        from_attributes = True

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    request: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Créer une nouvelle commande
    
    - **catalog_item_id**: ID du produit à commander
    - **uid_freefire**: UID FreeFire du destinataire
    - **idempotency_key**: Clé d'idempotence pour éviter les doublons (optionnel)
    """
    # Vérifier l'idempotence
    if request.idempotency_key:
        existing_order = db.query(Order).filter(
            Order.user_id == current_user.id,
            Order.idempotency_key == request.idempotency_key
        ).first()
        
        if existing_order:
            return OrderResponse(
                id=str(existing_order.id),
                order_code=existing_order.order_code,
                user_id=str(existing_order.user_id),
                catalog_item_id=str(existing_order.catalog_item_id),
                catalog_item_name=existing_order.catalog_item.name,
                price_xof=existing_order.price_xof,
                uid_freefire=existing_order.uid_freefire,
                status=existing_order.status,
                created_at=existing_order.created_at.isoformat(),
                delivered_at=existing_order.delivered_at.isoformat() if existing_order.delivered_at else None
            )
    
    # Vérifier que le produit existe
    catalog_item = db.query(CatalogItem).filter(CatalogItem.id == request.catalog_item_id).first()
    if not catalog_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    if not catalog_item.in_stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Produit en rupture de stock"
        )
    
    # Générer un code de commande unique
    order_code = f"FF{datetime.now().strftime('%Y%m%d')}{str(current_user.id)[:8]}"
    
    # Créer la commande
    order = Order(
        order_code=order_code,
        user_id=current_user.id,
        catalog_item_id=catalog_item.id,
        price_xof=catalog_item.price_xof,
        uid_freefire=request.uid_freefire,
        status="pending",
        idempotency_key=request.idempotency_key
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return OrderResponse(
        id=str(order.id),
        order_code=order.order_code,
        user_id=str(order.user_id),
        catalog_item_id=str(order.catalog_item_id),
        catalog_item_name=catalog_item.name,
        price_xof=order.price_xof,
        uid_freefire=order.uid_freefire,
        status=order.status,
        created_at=order.created_at.isoformat(),
        delivered_at=None
    )

@router.get("/orders/mine", response_model=List[OrderResponse])
def get_my_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer mes commandes
    
    - **status**: Filtrer par statut (pending, paid, delivered, cancelled)
    """
    query = db.query(Order).filter(Order.user_id == current_user.id)
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    
    return [
        OrderResponse(
            id=str(order.id),
            order_code=order.order_code,
            user_id=str(order.user_id),
            catalog_item_id=str(order.catalog_item_id),
            catalog_item_name=order.catalog_item.name,
            price_xof=order.price_xof,
            uid_freefire=order.uid_freefire,
            status=order.status,
            created_at=order.created_at.isoformat(),
            delivered_at=order.delivered_at.isoformat() if order.delivered_at else None
        )
        for order in orders
    ]

@router.get("/orders/{order_code}", response_model=OrderResponse)
def get_order(
    order_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les détails d'une commande
    
    - **order_code**: Code de la commande
    """
    order = db.query(Order).filter(Order.order_code == order_code).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    # Vérifier que l'utilisateur est propriétaire ou admin
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    return OrderResponse(
        id=str(order.id),
        order_code=order.order_code,
        user_id=str(order.user_id),
        catalog_item_id=str(order.catalog_item_id),
        catalog_item_name=order.catalog_item.name,
        price_xof=order.price_xof,
        uid_freefire=order.uid_freefire,
        status=order.status,
        created_at=order.created_at.isoformat(),
        delivered_at=order.delivered_at.isoformat() if order.delivered_at else None
    )

@router.post("/admin/orders/{order_code}/deliver", response_model=OrderResponse)
def deliver_order(
    order_code: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Marquer une commande comme livrée (Admin uniquement)
    
    - **order_code**: Code de la commande
    """
    order = db.query(Order).filter(Order.order_code == order_code).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    if order.status == "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Commande déjà livrée"
        )
    
    order.status = "delivered"
    order.delivered_at = datetime.utcnow()
    
    db.commit()
    db.refresh(order)
    
    return OrderResponse(
        id=str(order.id),
        order_code=order.order_code,
        user_id=str(order.user_id),
        catalog_item_id=str(order.catalog_item_id),
        catalog_item_name=order.catalog_item.name,
        price_xof=order.price_xof,
        uid_freefire=order.uid_freefire,
        status=order.status,
        created_at=order.created_at.isoformat(),
        delivered_at=order.delivered_at.isoformat() if order.delivered_at else None
    )
