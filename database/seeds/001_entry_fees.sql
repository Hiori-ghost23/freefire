-- =================================================================
-- Seeds 001: Données d'exemple pour les frais d'inscription
-- Description: Frais d'inscription standard pour les tournois
-- =================================================================

INSERT INTO entry_fees (name, amount, currency) VALUES
('Tournoi gratuit', 0.00, 'XOF'),
('Frais inscription Bronze', 500.00, 'XOF'),
('Frais inscription Argent', 1000.00, 'XOF'),
('Frais inscription Or', 2500.00, 'XOF'),
('Frais inscription Platine', 5000.00, 'XOF'),
('Championnat Elite', 10000.00, 'XOF')
ON CONFLICT DO NOTHING;
