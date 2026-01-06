"""
Router Catalog - Endpoints pour le catalogue de produits
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.dependencies.auth import require_admin, get_optional_user
from app.models import CatalogItem, User

router = APIRouter()

# Schémas Pydantic

class CatalogItemResponse(BaseModel):
    id: str
    type: str
    title: str
    sku: str
    price_amount: float
    price_currency: str
    attributes: Optional[dict]
    image_url: Optional[str]
    active: bool
    created_at: str
    
    class Config:
        from_attributes = True

class CreateCatalogItemRequest(BaseModel):
    type: str = Field(..., pattern="^(DIAMONDS|SUBSCRIPTION|PASS|SPECIAL)$")
    title: str = Field(..., min_length=3, max_length=120)
    sku: str = Field(..., min_length=3, max_length=60)
    price_amount: float = Field(..., gt=0)
    price_currency: str = Field(default="XOF", max_length=3)
    attributes: Optional[dict] = {}
    image_url: Optional[str] = None
    active: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "DIAMONDS",
                "title": "1580 Diamants FreeFire",
                "sku": "FF-DIAMONDS-1580",
                "price_amount": 1600,
                "price_currency": "XOF",
                "attributes": {"bonus": "80 diamants bonus"},
                "image_url": "https://example.com/diamonds.jpg",
                "active": True
            }
        }

class UpdateCatalogItemRequest(BaseModel):
    type: Optional[str] = Field(None, pattern="^(DIAMONDS|SUBSCRIPTION|PASS|SPECIAL)$")
    title: Optional[str] = Field(None, min_length=3, max_length=120)
    price_amount: Optional[float] = Field(None, gt=0)
    attributes: Optional[dict] = None
    image_url: Optional[str] = None
    active: Optional[bool] = None

@router.get("/catalog", response_model=List[CatalogItemResponse])
def list_catalog_items(
    type: Optional[str] = None,
    active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Lister tous les produits du catalogue
    
    - **type**: Filtrer par type (DIAMONDS, SUBSCRIPTION, PASS, SPECIAL)
    - **active**: Filtrer par disponibilité
    
    Endpoint public, pas d'authentification requise
    """
    query = db.query(CatalogItem)
    
    if type:
        query = query.filter(CatalogItem.type == type)
    
    if active is not None:
        query = query.filter(CatalogItem.active == active)
    
    items = query.order_by(CatalogItem.price_amount).all()
    
    return [
        CatalogItemResponse(
            id=str(item.id),
            type=item.type,
            title=item.title,
            sku=item.sku,
            price_amount=float(item.price_amount),
            price_currency=item.price_currency,
            attributes=item.attributes,
            image_url=item.image_url,
            active=item.active,
            created_at=item.created_at.isoformat()
        )
        for item in items
    ]


@router.get("/catalog/{item_id}", response_model=CatalogItemResponse)
def get_catalog_item(
    item_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Récupérer les détails d'un produit
    
    - **item_id**: ID du produit
    
    Endpoint public, pas d'authentification requise
    """
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    return CatalogItemResponse(
        id=str(item.id),
        type=item.type,
        title=item.title,
        sku=item.sku,
        price_amount=float(item.price_amount),
        price_currency=item.price_currency,
        attributes=item.attributes,
        image_url=item.image_url,
        active=item.active,
        created_at=item.created_at.isoformat()
    )

@router.post("/admin/catalog", response_model=CatalogItemResponse, status_code=status.HTTP_201_CREATED)
def create_catalog_item(
    request: CreateCatalogItemRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Créer un nouveau produit dans le catalogue (Admin uniquement)
    """
    # Vérifier si le SKU existe déjà
    existing = db.query(CatalogItem).filter(CatalogItem.sku == request.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce SKU existe déjà"
        )
    
    item = CatalogItem(
        type=request.type,
        title=request.title,
        sku=request.sku,
        price_amount=request.price_amount,
        price_currency=request.price_currency,
        attributes=request.attributes or {},
        image_url=request.image_url,
        active=request.active
    )
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return CatalogItemResponse(
        id=str(item.id),
        type=item.type,
        title=item.title,
        sku=item.sku,
        price_amount=float(item.price_amount),
        price_currency=item.price_currency,
        attributes=item.attributes,
        image_url=item.image_url,
        active=item.active,
        created_at=item.created_at.isoformat()
    )

@router.put("/admin/catalog/{item_id}", response_model=CatalogItemResponse)
def update_catalog_item(
    item_id: UUID,
    request: UpdateCatalogItemRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Modifier un produit du catalogue (Admin uniquement)
    """
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    if request.type is not None:
        item.type = request.type
    if request.title is not None:
        item.title = request.title
    if request.price_amount is not None:
        item.price_amount = request.price_amount
    if request.attributes is not None:
        item.attributes = request.attributes
    if request.image_url is not None:
        item.image_url = request.image_url
    if request.active is not None:
        item.active = request.active
    
    db.commit()
    db.refresh(item)
    
    return CatalogItemResponse(
        id=str(item.id),
        type=item.type,
        title=item.title,
        sku=item.sku,
        price_amount=float(item.price_amount),
        price_currency=item.price_currency,
        attributes=item.attributes,
        image_url=item.image_url,
        active=item.active,
        created_at=item.created_at.isoformat()
    )

@router.delete("/admin/catalog/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_catalog_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Supprimer un produit du catalogue (Admin uniquement)
    """
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    db.delete(item)
    db.commit()
    
    return None
