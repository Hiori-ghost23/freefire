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
from app.models import Tournament, TournamentRegistration, User

router = APIRouter()

# Schémas Pydantic

class CreateTournamentRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    game_mode: str = Field(..., pattern="^(BR_SOLO|BR_DUO|BR_SQUAD|CLASH_SQUAD|LONE_WOLF|ROOM_HS)$")
    max_participants: int = Field(..., gt=0, le=1000)
    entry_fee_id: Optional[UUID] = None
    prize_pool: int = Field(default=0, ge=0)
    start_date: datetime
    is_private: bool = False
    rules: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Battle Royale Championship",
                "description": "Tournoi BR Squad avec prix",
                "game_mode": "BR_SQUAD",
                "max_participants": 100,
                "entry_fee_id": "123e4567-e89b-12d3-a456-426614174000",
                "prize_pool": 50000,
                "start_date": "2024-12-20T18:00:00Z",
                "is_private": False,
                "rules": "Règles standard FreeFire"
            }
        }

class TournamentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    game_mode: str
    max_participants: int
    current_participants: int
    entry_fee: int
    prize_pool: int
    start_date: str
    is_private: bool
    access_code: Optional[str]
    status: str
    organizer_id: str
    created_at: str
    
    class Config:
        from_attributes = True

class RegisterTournamentRequest(BaseModel):
    access_code: Optional[str] = None
    team_name: Optional[str] = None
    team_members: Optional[List[str]] = None

@router.get("", response_model=List[TournamentResponse])
def list_tournaments(
    game_mode: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Lister tous les tournois publics
    
    - **game_mode**: Filtrer par mode de jeu
    - **status**: Filtrer par statut (open, full, in_progress, completed)
    """
    query = db.query(Tournament).filter(Tournament.is_private == False)
    
    if game_mode:
        query = query.filter(Tournament.game_mode == game_mode)
    
    if status:
        query = query.filter(Tournament.status == status)
    
    tournaments = query.order_by(Tournament.start_date).all()
    
    return [
        TournamentResponse(
            id=str(t.id),
            title=t.title,
            description=t.description,
            game_mode=t.game_mode,
            max_participants=t.max_participants,
            current_participants=len(t.registrations),
            entry_fee=t.entry_fee.amount_xof if t.entry_fee else 0,
            prize_pool=t.prize_pool,
            start_date=t.start_date.isoformat(),
            is_private=t.is_private,
            access_code=None,  # Ne pas exposer le code d'accès
            status=t.status,
            organizer_id=str(t.organizer_id),
            created_at=t.created_at.isoformat()
        )
        for t in tournaments
    ]

@router.post("", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_tournament(
    request: CreateTournamentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    """
    Créer un nouveau tournoi (Organizer ou Admin uniquement)
    """
    # Générer un code d'accès si privé
    access_code = secrets.token_urlsafe(8) if request.is_private else None
    
    tournament = Tournament(
        title=request.title,
        description=request.description,
        game_mode=request.game_mode,
        max_participants=request.max_participants,
        entry_fee_id=request.entry_fee_id,
        prize_pool=request.prize_pool,
        start_date=request.start_date,
        is_private=request.is_private,
        access_code=access_code,
        rules=request.rules,
        status="open",
        organizer_id=current_user.id
    )
    
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    
    return TournamentResponse(
        id=str(tournament.id),
        title=tournament.title,
        description=tournament.description,
        game_mode=tournament.game_mode,
        max_participants=tournament.max_participants,
        current_participants=0,
        entry_fee=tournament.entry_fee.amount_xof if tournament.entry_fee else 0,
        prize_pool=tournament.prize_pool,
        start_date=tournament.start_date.isoformat(),
        is_private=tournament.is_private,
        access_code=access_code,  # Retourner le code à l'organisateur
        status=tournament.status,
        organizer_id=str(tournament.organizer_id),
        created_at=tournament.created_at.isoformat()
    )

@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Récupérer les détails d'un tournoi
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournoi non trouvé"
        )
    
    # Masquer le code d'accès sauf pour l'organisateur
    access_code = None
    if current_user and (tournament.organizer_id == current_user.id or current_user.role == "admin"):
        access_code = tournament.access_code
    
    return TournamentResponse(
        id=str(tournament.id),
        title=tournament.title,
        description=tournament.description,
        game_mode=tournament.game_mode,
        max_participants=tournament.max_participants,
        current_participants=len(tournament.registrations),
        entry_fee=tournament.entry_fee.amount_xof if tournament.entry_fee else 0,
        prize_pool=tournament.prize_pool,
        start_date=tournament.start_date.isoformat(),
        is_private=tournament.is_private,
        access_code=access_code,
        status=tournament.status,
        organizer_id=str(tournament.organizer_id),
        created_at=tournament.created_at.isoformat()
    )

@router.post("/{tournament_id}/register", status_code=status.HTTP_201_CREATED)
def register_tournament(
    tournament_id: UUID,
    request: RegisterTournamentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    S'inscrire à un tournoi
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournoi non trouvé"
        )
    
    # Vérifier le code d'accès si privé
    if tournament.is_private and request.access_code != tournament.access_code:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Code d'accès invalide"
        )
    
    # Vérifier que le tournoi est ouvert
    if tournament.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les inscriptions sont fermées"
        )
    
    # Vérifier qu'il reste de la place
    if len(tournament.registrations) >= tournament.max_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournoi complet"
        )
    
    # Vérifier que l'utilisateur n'est pas déjà inscrit
    existing = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous êtes déjà inscrit à ce tournoi"
        )
    
    # Créer l'inscription
    registration = TournamentRegistration(
        tournament_id=tournament.id,
        user_id=current_user.id,
        team_name=request.team_name,
        team_members=request.team_members,
        status="registered"
    )
    
    db.add(registration)
    db.commit()
    
    return {
        "message": "Inscription réussie",
        "tournament_id": str(tournament.id),
        "registration_id": str(registration.id)
    }

@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprimer un tournoi (Organisateur ou Admin uniquement)
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournoi non trouvé"
        )
    
    # Vérifier les permissions
    if tournament.organizer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    db.delete(tournament)
    db.commit()
    
    return None
