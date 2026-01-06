"""
Router Tournaments - Endpoints pour la gestion des tournois
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import secrets

from app.database import get_db
from app.dependencies.auth import get_current_user, require_organizer, get_optional_user
from app.models import Tournament, TournamentRegistration, User, EntryFee

router = APIRouter()

# Schémas Pydantic

class CreateTournamentRequest(BaseModel):
    mode: str = Field(..., pattern="^(BR_SOLO|BR_DUO|BR_SQUAD|CLASH_SQUAD|LONE_WOLF|ROOM_HS)$")
    description: Optional[str] = None
    reward_text: Optional[str] = None
    start_at: datetime
    entry_fee_id: Optional[UUID] = None
    visibility: str = Field(default="public", pattern="^(public|private)$")
    contact_whatsapp: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "mode": "BR_SQUAD",
                "description": "Tournoi BR Squad avec prix",
                "reward_text": "50000 XOF pour le gagnant",
                "start_at": "2024-12-20T18:00:00Z",
                "visibility": "public",
                "contact_whatsapp": "+22901234567"
            }
        }

class TournamentResponse(BaseModel):
    id: str
    mode: str
    description: Optional[str]
    reward_text: Optional[str]
    start_at: str
    visibility: str
    status: str
    entry_fee_id: Optional[str]
    entry_fee_amount: Optional[float]
    contact_whatsapp: Optional[str]
    ticket_code: Optional[str]
    created_by: str
    created_at: str
    
    class Config:
        from_attributes = True

class RegisterTournamentRequest(BaseModel):
    ticket_code: Optional[str] = None

@router.get("", response_model=List[TournamentResponse])
def list_tournaments(
    mode: Optional[str] = None,
    status: Optional[str] = None,
    visibility: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lister tous les tournois publics
    
    - **mode**: Filtrer par mode de jeu (BR_SOLO, BR_DUO, BR_SQUAD, etc.)
    - **status**: Filtrer par statut (en_examen, valide, rejete)
    - **visibility**: Filtrer par visibilité (public, private)
    
    Endpoint public, pas d'authentification requise
    """
    query = db.query(Tournament)
    
    # Par défaut, ne montrer que les tournois publics et validés
    if visibility is None:
        query = query.filter(Tournament.visibility == "public")
    else:
        query = query.filter(Tournament.visibility == visibility)
    
    if mode:
        query = query.filter(Tournament.mode == mode)
    
    if status:
        query = query.filter(Tournament.status == status)
    else:
        # Par défaut, montrer les tournois validés
        query = query.filter(Tournament.status == "valide")
    
    tournaments = query.order_by(Tournament.start_at.desc()).all()
    
    result = []
    for t in tournaments:
        # Récupérer le montant du frais d'inscription si présent
        entry_fee_amount = None
        if t.entry_fee_id:
            entry_fee = db.query(EntryFee).filter(EntryFee.id == t.entry_fee_id).first()
            if entry_fee:
                entry_fee_amount = float(entry_fee.amount)
        
        result.append(TournamentResponse(
            id=str(t.id),
            mode=t.mode,
            description=t.description,
            reward_text=t.reward_text,
            start_at=t.start_at.isoformat(),
            visibility=t.visibility,
            status=t.status,
            entry_fee_id=str(t.entry_fee_id) if t.entry_fee_id else None,
            entry_fee_amount=entry_fee_amount,
            contact_whatsapp=t.contact_whatsapp,
            ticket_code=t.ticket_code if t.visibility == "private" else None,
            created_by=str(t.created_by),
            created_at=t.created_at.isoformat()
        ))
    
    return result


@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(
    tournament_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Récupérer les détails d'un tournoi
    
    Endpoint public, pas d'authentification requise
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournoi non trouvé"
        )
    
    entry_fee_amount = None
    if tournament.entry_fee_id:
        entry_fee = db.query(EntryFee).filter(EntryFee.id == tournament.entry_fee_id).first()
        if entry_fee:
            entry_fee_amount = float(entry_fee.amount)
    
    return TournamentResponse(
        id=str(tournament.id),
        mode=tournament.mode,
        description=tournament.description,
        reward_text=tournament.reward_text,
        start_at=tournament.start_at.isoformat(),
        visibility=tournament.visibility,
        status=tournament.status,
        entry_fee_id=str(tournament.entry_fee_id) if tournament.entry_fee_id else None,
        entry_fee_amount=entry_fee_amount,
        contact_whatsapp=tournament.contact_whatsapp,
        ticket_code=tournament.ticket_code if tournament.visibility == "private" else None,
        created_by=str(tournament.created_by),
        created_at=tournament.created_at.isoformat()
    )

@router.post("", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_tournament(
    request: CreateTournamentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Créer un nouveau tournoi
    
    Nécessite une authentification
    """
    # Générer un code ticket pour les tournois privés
    ticket_code = None
    if request.visibility == "private":
        ticket_code = secrets.token_urlsafe(8).upper()
    
    tournament = Tournament(
        created_by=current_user.id,
        created_by_role=current_user.role,
        mode=request.mode,
        description=request.description,
        reward_text=request.reward_text,
        start_at=request.start_at,
        entry_fee_id=request.entry_fee_id,
        visibility=request.visibility,
        status="en_examen",  # Les tournois doivent être validés par un admin
        contact_whatsapp=request.contact_whatsapp,
        ticket_code=ticket_code
    )
    
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    
    entry_fee_amount = None
    if tournament.entry_fee_id:
        entry_fee = db.query(EntryFee).filter(EntryFee.id == tournament.entry_fee_id).first()
        if entry_fee:
            entry_fee_amount = float(entry_fee.amount)
    
    return TournamentResponse(
        id=str(tournament.id),
        mode=tournament.mode,
        description=tournament.description,
        reward_text=tournament.reward_text,
        start_at=tournament.start_at.isoformat(),
        visibility=tournament.visibility,
        status=tournament.status,
        entry_fee_id=str(tournament.entry_fee_id) if tournament.entry_fee_id else None,
        entry_fee_amount=entry_fee_amount,
        contact_whatsapp=tournament.contact_whatsapp,
        ticket_code=tournament.ticket_code,
        created_by=str(tournament.created_by),
        created_at=tournament.created_at.isoformat()
    )

@router.post("/{tournament_id}/register", status_code=status.HTTP_201_CREATED)
def register_to_tournament(
    tournament_id: UUID,
    request: RegisterTournamentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    S'inscrire à un tournoi
    
    Nécessite une authentification
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournoi non trouvé"
        )
    
    if tournament.status != "valide":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce tournoi n'est pas ouvert aux inscriptions"
        )
    
    # Vérifier le code ticket pour les tournois privés
    if tournament.visibility == "private":
        if not request.ticket_code or request.ticket_code != tournament.ticket_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Code ticket invalide"
            )
    
    # Vérifier si déjà inscrit
    existing = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous êtes déjà inscrit à ce tournoi"
        )
    
    registration = TournamentRegistration(
        tournament_id=tournament_id,
        user_id=current_user.id,
        status="registered"
    )
    
    db.add(registration)
    db.commit()
    
    return {"message": "Inscription réussie", "registration_id": str(registration.id)}

@router.get("/my/registrations")
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer mes inscriptions aux tournois
    """
    registrations = db.query(TournamentRegistration).filter(
        TournamentRegistration.user_id == current_user.id
    ).all()
    
    result = []
    for reg in registrations:
        tournament = db.query(Tournament).filter(Tournament.id == reg.tournament_id).first()
        if tournament:
            result.append({
                "registration_id": str(reg.id),
                "tournament_id": str(tournament.id),
                "tournament_mode": tournament.mode,
                "tournament_start_at": tournament.start_at.isoformat(),
                "registration_status": reg.status,
                "registered_at": reg.created_at.isoformat()
            })
    
    return result
