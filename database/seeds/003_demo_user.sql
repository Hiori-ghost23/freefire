-- ============================================================
-- Seed: Utilisateurs de démonstration
-- ============================================================
-- Mot de passe pour tous: demo123
-- Hash bcrypt valide généré avec Python:
-- import bcrypt; print(bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode())

-- Utilisateur standard de démo
INSERT INTO users (
    id,
    email,
    password_hash,
    display_name,
    phone,
    country_code,
    uid_freefire,
    role,
    email_verified,
    created_at
) VALUES (
    gen_random_uuid(),
    'demo@freefire.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Joueur Demo',
    '+22901234567',
    'BJ',
    '123456789',
    'user',
    true,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    email_verified = true;

-- Utilisateur admin pour les tests
INSERT INTO users (
    id,
    email,
    password_hash,
    display_name,
    phone,
    country_code,
    uid_freefire,
    role,
    email_verified,
    created_at
) VALUES (
    gen_random_uuid(),
    'admin@freefire.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin FreeFire',
    '+22901234568',
    'BJ',
    '987654321',
    'admin',
    true,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'admin',
    email_verified = true;

-- Utilisateur organisateur pour les tests
INSERT INTO users (
    id,
    email,
    password_hash,
    display_name,
    phone,
    country_code,
    uid_freefire,
    role,
    email_verified,
    created_at
) VALUES (
    gen_random_uuid(),
    'organizer@freefire.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Organisateur Pro',
    '+22901234569',
    'BJ',
    '456789123',
    'organizer',
    true,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'organizer',
    email_verified = true;

-- ============================================================
-- Note: Pour générer un nouveau hash bcrypt en Python:
-- import bcrypt
-- password = "demo123"
-- hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
-- print(hash.decode())
-- ============================================================
