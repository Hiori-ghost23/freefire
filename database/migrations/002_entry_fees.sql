-- =================================================================
-- Migration 002: Table des frais d'inscription
-- Description: Gestion des frais d'inscription aux tournois
-- =================================================================

CREATE TABLE IF NOT EXISTS entry_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
