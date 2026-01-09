-- =================================================================
-- GOKU E-SHOP - Script d'initialisation complet de la base de données
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- =================================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 1. TABLE DES UTILISATEURS
-- =================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(16) NOT NULL CHECK (role IN ('user','organizer','admin')) DEFAULT 'user',
  email_verified_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 2. TABLE DES PROFILS UTILISATEURS
-- =================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(120),
  uid_freefire VARCHAR(32),
  phone_msisdn VARCHAR(32),
  country_code CHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 3. TABLE DES VÉRIFICATIONS EMAIL
-- =================================================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 4. TABLE DES RESETS DE MOT DE PASSE
-- =================================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 5. TABLE DES FRAIS D'INSCRIPTION
-- =================================================================
CREATE TABLE IF NOT EXISTS entry_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 6. TABLE DU CATALOGUE
-- =================================================================
CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(24) NOT NULL,
  title VARCHAR(120) NOT NULL,
  sku VARCHAR(60) UNIQUE NOT NULL,
  price_amount NUMERIC(12,2) NOT NULL,
  price_currency CHAR(3) NOT NULL DEFAULT 'XOF',
  attributes JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 7. TABLE DES COMMANDES
-- =================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  catalog_item_id UUID NOT NULL,
  uid_freefire VARCHAR(32) NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'XOF',
  idempotency_key VARCHAR(64) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 8. TABLE DES TOURNOIS
-- =================================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL,
  created_by_role VARCHAR(10) NOT NULL,
  visibility VARCHAR(10) NOT NULL,
  mode VARCHAR(20) NOT NULL,
  reward_text TEXT,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  entry_fee_id UUID REFERENCES entry_fees(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL,
  contact_whatsapp VARCHAR(32),
  ticket_code VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 9. TABLE DES PAIEMENTS
-- =================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(16) NOT NULL,
  target_id UUID NOT NULL,
  user_id UUID NOT NULL,
  country CHAR(2) NOT NULL,
  method VARCHAR(32),
  currency CHAR(3) NOT NULL DEFAULT 'XOF',
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  reference VARCHAR(40) UNIQUE NOT NULL,
  order_code VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 10. TABLE DES INSCRIPTIONS AUX TOURNOIS
-- =================================================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- 11. TABLE DES PREUVES DE PAIEMENT
-- =================================================================
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_hash_sha256 VARCHAR(64) NOT NULL,
  mime VARCHAR(64) NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =================================================================
-- DONNÉES DE DÉMONSTRATION
-- =================================================================

-- Frais d'inscription
INSERT INTO entry_fees (name, amount, currency) VALUES
  ('Gratuit', 0, 'XOF'),
  ('Standard', 500, 'XOF'),
  ('Premium', 1000, 'XOF'),
  ('Elite', 2000, 'XOF')
ON CONFLICT DO NOTHING;

-- Produits du catalogue
INSERT INTO catalog_items (type, title, sku, price_amount, price_currency, attributes, active) VALUES
  ('DIAMONDS', '100 Diamants', 'FF-DIAMONDS-100', 500, 'XOF', '{"quantity": 100}', true),
  ('DIAMONDS', '310 Diamants', 'FF-DIAMONDS-310', 1500, 'XOF', '{"quantity": 310, "bonus": 10}', true),
  ('DIAMONDS', '520 Diamants', 'FF-DIAMONDS-520', 2500, 'XOF', '{"quantity": 520, "bonus": 20}', true),
  ('DIAMONDS', '1060 Diamants', 'FF-DIAMONDS-1060', 5000, 'XOF', '{"quantity": 1060, "bonus": 60}', true),
  ('DIAMONDS', '2180 Diamants', 'FF-DIAMONDS-2180', 10000, 'XOF', '{"quantity": 2180, "bonus": 180}', true),
  ('SUBSCRIPTION', 'Weekly Membership', 'FF-WEEKLY-MEMBER', 1000, 'XOF', '{"duration": "7 days"}', true),
  ('SUBSCRIPTION', 'Monthly Membership', 'FF-MONTHLY-MEMBER', 3500, 'XOF', '{"duration": "30 days"}', true),
  ('PASS', 'Elite Pass', 'FF-ELITE-PASS', 5000, 'XOF', '{"season": "current"}', true),
  ('PASS', 'Elite Pass Bundle', 'FF-ELITE-BUNDLE', 7500, 'XOF', '{"season": "current", "bonus_levels": 50}', true)
ON CONFLICT (sku) DO NOTHING;

-- Utilisateur de démonstration (mot de passe: demo123)
INSERT INTO users (email, password_hash, role, email_verified_at) VALUES
  ('demo@goku-eshop.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', now()),
  ('admin@goku-eshop.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', now())
ON CONFLICT (email) DO NOTHING;

-- =================================================================
-- FIN DU SCRIPT
-- =================================================================
SELECT 'Base de données GOKU E-SHOP initialisée avec succès!' as message;
