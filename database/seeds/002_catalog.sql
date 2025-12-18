-- =================================================================
-- Seeds 002: Catalogue complet des produits FreeFire
-- Description: Tous les produits disponibles avec leurs prix
-- =================================================================

INSERT INTO catalog_items (id, type, title, sku, price_amount, price_currency, attributes, image_url, active) VALUES
-- Diamants FreeFire (11 offres)
('abd9e4a7-0c4d-44c6-a563-d6ca303329c1', 'DIAMONDS', 'Diamants 110', 'DIAMONDS_110', 800.00, 'XOF', '{"diamonds": 110}'::jsonb, NULL, TRUE),
('59f31b7b-2d23-4707-a676-5146497ffa3b', 'DIAMONDS', 'Diamants 231', 'DIAMONDS_231', 1600.00, 'XOF', '{"diamonds": 231}'::jsonb, NULL, TRUE),
('695beb33-b7ff-4682-8c34-9386ca992beb', 'DIAMONDS', 'Diamants 341', 'DIAMONDS_341', 2500.00, 'XOF', '{"diamonds": 341}'::jsonb, NULL, TRUE),
('b073376e-50f3-40d6-948d-be821e31f1d9', 'DIAMONDS', 'Diamants 462', 'DIAMONDS_462', 3000.00, 'XOF', '{"diamonds": 462}'::jsonb, NULL, TRUE),
('ca249642-e6af-46da-b7d4-2ece49a66244', 'DIAMONDS', 'Diamants 572', 'DIAMONDS_572', 3500.00, 'XOF', '{"diamonds": 572}'::jsonb, NULL, TRUE),
('1a939d3e-4dd6-409d-8df5-e08688884e47', 'DIAMONDS', 'Diamants 693', 'DIAMONDS_693', 4500.00, 'XOF', '{"diamonds": 693}'::jsonb, NULL, TRUE),
('0ec2cef0-60bd-4bdb-97f0-be693764fac9', 'DIAMONDS', 'Diamants 840', 'DIAMONDS_840', 5800.00, 'XOF', '{"diamonds": 840}'::jsonb, NULL, TRUE),
('87bc0242-9dec-4d2d-9caa-a0edf851276f', 'DIAMONDS', 'Diamants 1000', 'DIAMONDS_1000', 6800.00, 'XOF', '{"diamonds": 1000}'::jsonb, NULL, TRUE),
('0f50581f-5473-4162-9197-4e3c2ba4a148', 'DIAMONDS', 'Diamants 1500', 'DIAMONDS_1500', 10200.00, 'XOF', '{"diamonds": 1500}'::jsonb, NULL, TRUE),
('3e59472e-aafa-4455-b55f-e78c0260bcc4', 'DIAMONDS', 'Diamants 2000', 'DIAMONDS_2000', 13300.00, 'XOF', '{"diamonds": 2000}'::jsonb, NULL, TRUE),
('3a90641e-7353-4714-afb2-be7c14249dee', 'DIAMONDS', 'Diamants 2500', 'DIAMONDS_2500', 16500.00, 'XOF', '{"diamonds": 2500}'::jsonb, NULL, TRUE),

-- Abonnements (2 offres)
('523fe626-6dad-41f9-a643-8a1619786609', 'SUBSCRIPTION', 'Abonnement hebdomadaire', 'SUB_WEEK', 1700.00, 'XOF', '{"days": 7}'::jsonb, NULL, TRUE),
('8175ddd8-7716-4052-84d9-766d089147af', 'SUBSCRIPTION', 'Abonnement mensuel', 'SUB_MONTH', 7200.00, 'XOF', '{"days": 30}'::jsonb, NULL, TRUE),

-- Pass (1 offre)
('96675005-33ce-4721-b2e2-2701c4f870c4', 'PASS', 'Booyah Pass', 'PASS_BOOYAH', 2400.00, 'XOF', '{}'::jsonb, NULL, TRUE),

-- Level Up Pass (6 offres)
('550e0beb-3dc4-4abd-a7d2-c30778a0e304', 'LEVEL_UP', 'Level Up Pass L6', 'LUP_L6', 300.00, 'XOF', '{"level": 6}'::jsonb, NULL, TRUE),
('25ba1fb8-66a2-48bf-8432-13f7d5e1c2d8', 'LEVEL_UP', 'Level Up Pass L10', 'LUP_L10', 500.00, 'XOF', '{"level": 10}'::jsonb, NULL, TRUE),
('9545f976-afdf-4fa9-9374-5be6628b698c', 'LEVEL_UP', 'Level Up Pass L15', 'LUP_L15', 500.00, 'XOF', '{"level": 15}'::jsonb, NULL, TRUE),
('da2e86c7-c87e-472d-a239-d78d00b65f01', 'LEVEL_UP', 'Level Up Pass L20', 'LUP_L20', 500.00, 'XOF', '{"level": 20}'::jsonb, NULL, TRUE),
('54b1fa89-8147-41b8-b546-3cbd23e066e1', 'LEVEL_UP', 'Level Up Pass L25', 'LUP_L25', 500.00, 'XOF', '{"level": 25}'::jsonb, NULL, TRUE),
('ac40d590-b27b-4258-bb9a-773326872524', 'LEVEL_UP', 'Level Up Pass L30', 'LUP_L30', 700.00, 'XOF', '{"level": 30}'::jsonb, NULL, TRUE),

-- Largages spéciaux (2 offres)
('2b005d03-a830-4673-be8d-f4113b8c2c90', 'SPECIAL_DROP', 'Largage spécial 1$', 'DROP_1USD', 1000.00, 'XOF', '{"usd": 1}'::jsonb, NULL, TRUE),
('cc6283b4-3592-47df-840d-c4e330587966', 'SPECIAL_DROP', 'Largage spécial 2$', 'DROP_2USD', 2000.00, 'XOF', '{"usd": 2}'::jsonb, NULL, TRUE),

-- Accès Évo (2 offres)
('3c6ee495-3953-4f60-9a6d-4e3f45f7c8b9', 'ACCES_EVO', 'Accès Évo 7j', 'EVO_7D', 900.00, 'XOF', '{"days": 7}'::jsonb, NULL, TRUE),
('1e29278c-e3cb-463c-9f50-24eca0f26e47', 'ACCES_EVO', 'Accès Évo 30j', 'EVO_30D', 2500.00, 'XOF', '{"days": 30}'::jsonb, NULL, TRUE)

ON CONFLICT (sku) DO UPDATE SET
  price_amount=EXCLUDED.price_amount,
  attributes=EXCLUDED.attributes,
  updated_at=now();
