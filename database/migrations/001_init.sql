-- =================================================================
-- Migration 001: Tables de base
-- Description: Tables principales pour orders, payments, payment_proofs
-- =================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  catalog_item_id UUID NOT NULL,
  uid_freefire VARCHAR(32) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('achete','en_attente','livre')),
  total_amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key VARCHAR(64) UNIQUE NULL
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(16) NOT NULL CHECK (type IN ('order','entry_fee')),
  target_id UUID NOT NULL,
  user_id UUID NOT NULL,
  country CHAR(2) NOT NULL,
  method VARCHAR(32),
  currency CHAR(3) NOT NULL DEFAULT 'XOF',
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('initiated','pending_review','confirmed','expired','rejected','refunded')),
  reference VARCHAR(40) UNIQUE NOT NULL,
  order_code VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes sur les paiements
CREATE INDEX IF NOT EXISTS idx_pay_status ON payments(status, created_at DESC);

-- Table des preuves de paiement
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_hash_sha256 CHAR(64) NOT NULL,
  mime VARCHAR(64) NOT NULL,
  size_bytes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
