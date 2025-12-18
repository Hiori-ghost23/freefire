"""
Modèles SQLAlchemy pour l'application FreeFire MVP
Toutes les tables de base de données sont définies ici
"""
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer, Boolean, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """Table des utilisateurs avec authentification"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(16), nullable=False, default="user")  # user | organizer | admin
    email_verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class UserProfile(Base):
    """Profils utilisateurs avec informations FreeFire"""
    __tablename__ = "user_profiles"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    display_name = Column(String(120))
    uid_freefire = Column(String(32))
    phone_msisdn = Column(String(32))
    country_code = Column(String(2))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class EmailVerification(Base):
    """Tokens de vérification d'email"""
    __tablename__ = "email_verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String(64), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())


class PasswordReset(Base):
    """Tokens de réinitialisation de mot de passe"""
    __tablename__ = "password_resets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String(64), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())


class CatalogItem(Base):
    """Catalogue des produits FreeFire"""
    __tablename__ = "catalog_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(24), nullable=False)  # DIAMONDS, SUBSCRIPTION, PASS, etc.
    title = Column(String(120), nullable=False)
    sku = Column(String(60), unique=True, nullable=False)
    price_amount = Column(Numeric(12,2), nullable=False)
    price_currency = Column(String(3), nullable=False, default="XOF")
    attributes = Column(JSONB, nullable=False, default="{}")
    image_url = Column(Text)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Order(Base):
    """Commandes des utilisateurs"""
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_code = Column(String(20), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    catalog_item_id = Column(UUID(as_uuid=True), nullable=False)
    uid_freefire = Column(String(32), nullable=False)
    status = Column(String(20), nullable=False)  # achete | en_attente | livre
    total_amount = Column(Numeric(12,2), nullable=False)
    currency = Column(String(3), nullable=False, default="XOF")
    idempotency_key = Column(String(64), unique=True, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class EntryFee(Base):
    """Frais d'inscription aux tournois"""
    __tablename__ = "entry_fees"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    amount = Column(Numeric(12,2), nullable=False)
    currency = Column(String(3), nullable=False, default="XOF")
    created_at = Column(DateTime, server_default=func.now())


class Tournament(Base):
    """Tournois FreeFire"""
    __tablename__ = "tournaments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_by_role = Column(String(10), nullable=False)  # user | admin
    visibility = Column(String(10), nullable=False)       # public | private
    mode = Column(String(20), nullable=False)             # BR_SOLO | BR_DUO | BR_SQUAD | etc.
    reward_text = Column(Text)
    description = Column(Text)
    start_at = Column(DateTime, nullable=False)
    entry_fee_id = Column(UUID(as_uuid=True), ForeignKey("entry_fees.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), nullable=False)           # en_examen | valide | rejete | etc.
    contact_whatsapp = Column(String(32))
    ticket_code = Column(String(32))
    created_at = Column(DateTime, server_default=func.now())


class TournamentRegistration(Base):
    """Inscriptions aux tournois"""
    __tablename__ = "tournament_registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tournament_id = Column(UUID(as_uuid=True), ForeignKey("tournaments.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(String(20), nullable=False)  # registered | paid | cancelled
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class Payment(Base):
    """Paiements (commandes et inscriptions tournois)"""
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(16), nullable=False)  # order | entry_fee
    target_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    country = Column(String(2), nullable=False)
    method = Column(String(32))
    currency = Column(String(3), nullable=False, default="XOF")
    amount = Column(Numeric(12,2), nullable=False)
    status = Column(String(20), nullable=False)  # initiated | pending_review | confirmed | etc.
    reference = Column(String(40), unique=True, nullable=False)
    order_code = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PaymentProof(Base):
    """Preuves de paiement uploadées par les utilisateurs"""
    __tablename__ = "payment_proofs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id", ondelete="CASCADE"))
    file_url = Column(Text, nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False)
    mime = Column(String(64), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
