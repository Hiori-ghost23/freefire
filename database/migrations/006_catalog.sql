-- =================================================================
-- Migration 006: Catalogue boutique
-- Description: Table pour le catalogue des produits FreeFire
-- =================================================================

-- Table du catalogue des produits
CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(24) NOT NULL,
  title VARCHAR(120) NOT NULL,
  sku VARCHAR(60) UNIQUE NOT NULL,
  price_amount NUMERIC(12,2) NOT NULL,
  price_currency CHAR(3) NOT NULL DEFAULT 'XOF',
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes sur le catalogue
CREATE INDEX IF NOT EXISTS idx_catalog_type_active ON catalog_items(type, active);
