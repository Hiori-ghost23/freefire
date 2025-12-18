-- =================================================================
-- Migration 003: Système de tournois
-- Description: Tables pour la gestion complète des tournois FreeFire
-- =================================================================

-- Table des tournois
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL,
  created_by_role VARCHAR(10) NOT NULL CHECK (created_by_role IN ('user','admin')),
  visibility VARCHAR(10) NOT NULL CHECK (visibility IN ('public','private')),
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('BR_SOLO','BR_DUO','BR_SQUAD','CLASH_SQUAD','LONE_WOLF','ROOM_HS')),
  reward_text TEXT,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  entry_fee_id UUID NULL REFERENCES entry_fees(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('en_examen','valide','rejete','en_cours','indisponible')),
  contact_whatsapp VARCHAR(32),
  ticket_code VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes sur les tournois
CREATE INDEX IF NOT EXISTS idx_tourn_status ON tournaments(status, start_at DESC);
CREATE INDEX IF NOT EXISTS idx_tourn_visibility ON tournaments(visibility, start_at DESC);

-- Table des inscriptions aux tournois
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('registered','paid','cancelled')),
  payment_id UUID NULL REFERENCES payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);
