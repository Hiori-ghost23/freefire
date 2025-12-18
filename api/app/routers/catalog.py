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
    name: str
    description: Optional[str]
    price_xof: int
    category: str
    image_url: Optional[str]
    in_stock: bool
    metadata: Optional[dict]
    created_at: str
    
    class Config:
        from_attributes = True

class CreateCatalogItemRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    price_xof: int = Field(..., gt=0)
    category: str = Field(..., pattern="^(DIAMONDS|SUBSCRIPTION|PASS|SPECIAL)$")
    image_url: Optional[str] = None
    in_stock: bool = True
    metadata: Optional[dict] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "1580 Diamants FreeFire",
                "description": "Pack de diamants avec bonus",
                "price_xof": 1600,
                "category": "DIAMONDS",
                "image_url": "https://example.com/diamonds.jpg",
                "in_stock": True,
                "metadata": {
                    "bonus": "80 diamants bonus",
                    "popular": True
                }
            }
        }

class UpdateCatalogItemRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    price_xof: Optional[int] = Field(None, gt=0)
    category: Optional[str] = Field(None, pattern="^(DIAMONDS|SUBSCRIPTION|PASS|SPECIAL)$")
    image_url: Optional[str] = None
    in_stock: Optional[bool] = None
    metadata: Optional[dict] = None

@router.get("/catalog", response_model=List[CatalogItemResponse])
def list_catalog_items(
    category: Optional[str] = None,
    in_stock: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Lister tous les produits du catalogue
    
    - **category**: Filtrer par catégorie (DIAMONDS, SUBSCRIPTION, PASS, SPECIAL)
    - **in_stock**: Filtrer par disponibilité
    
    Endpoint public, authentification optionnelle
    """
    query = db.query(CatalogItem)
    
    if category:
        query = query.filter(CatalogItem.category == category)
    
    if in_stock is not None:
        query = query.filter(CatalogItem.in_stock == in_stock)
    
    items = query.order_by(CatalogItem.price_xof).all()
    
    return [
        CatalogItemResponse(
            id=str(item.id),
            name=item.name,
            description=item.description,
            price_xof=item.price_xof,
            category=item.category,
            image_url=item.image_url,
            in_stock=item.in_stock,
            metadata=item.metadata,
            created_at=item.created_at.isoformat()
        )
        for item in items
    ]

@router.get("/catalog/{item_id}", response_model=CatalogItemResponse)
def get_catalog_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Récupérer les détails d'un produit
    
    - **item_id**: ID du produit
    
    Endpoint public, authentification optionnelle
    """
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    return CatalogItemResponse(
        id=str(item.id),
        name=item.name,
        description=item.description,
        price_xof=item.price_xof,
        category=item.category,
        image_url=item.image_url,
        in_stock=item.in_stock,
        metadata=item.metadata,
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
    
    - **name**: Nom du produit
    - **description**: Description détaillée
    - **price_xof**: Prix en XOF
    - **category**: Catégorie (DIAMONDS, SUBSCRIPTION, PASS, SPECIAL)
    - **image_url**: URL de l'image
    - **in_stock**: Disponibilité
    - **metadata**: Métadonnées additionnelles (JSON)
    """
    item = CatalogItem(
        name=request.name,
        description=request.description,
        price_xof=request.price_xof,
        category=request.category,
        image_url=request.image_url,
        in_stock=request.in_stock,
        metadata=request.metadata
    )
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return CatalogItemResponse(
        id=str(item.id),
        name=item.name,
        description=item.description,
        price_xof=item.price_xof,
        category=item.category,
        image_url=item.image_url,
        in_stock=item.in_stock,
        metadata=item.metadata,
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
    
    - **item_id**: ID du produit à modifier
    
    Tous les champs sont optionnels, seuls les champs fournis seront modifiés
    """
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Mettre à jour les champs fournis
    if request.name is not None:
        item.name = request.name
    if request.description is not None:
        item.description = request.description
    if request.price_xof is not None:
        item.price_xof = request.price_xof
    if request.category is not None:
        item.category = request.category
    if request.image_url is not None:
        item.image_url = request.image_url
    if request.in_stock is not None:
        item.in_stock = request.in_stock
    if request.metadata is not None:
        item.metadata = request.metadata
    
    db.commit()
    db.refresh(item)
    
    return CatalogItemResponse(
        id=str(item.id),
        name=item.name,
        description=item.description,
        price_xof=item.price_xof,
        category=item.category,
        image_url=item.image_url,
        in_stock=item.in_stock,
        metadata=item.metadata,
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
    
    - **item_id**: ID du produit à supprimer
    
    Note: La suppression est définitive
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
