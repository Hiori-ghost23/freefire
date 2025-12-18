# 🔥 FreeFire MVP - Plateforme E-commerce et Tournois

**Version :** 2.4.0  
**Statut :** Prêt pour production  
**Technologies :** FastAPI + PostgreSQL + Docker

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités](#fonctionnalités)
3. [Prérequis](#prérequis)
4. [Installation rapide](#installation-rapide)
5. [Configuration détaillée](#configuration-détaillée)
6. [Déploiement](#déploiement)
7. [Tests](#tests)
8. [API Documentation](#api-documentation)
9. [Architecture](#architecture)
10. [Support](#support)

---

## 🎯 Vue d'ensemble

FreeFire MVP est une plateforme complète qui permet de :
- **Vendre des produits FreeFire** (diamants, pass, abonnements)
- **Organiser des tournois** avec gestion des inscriptions
- **Gérer les paiements** multi-pays et multi-méthodes  
- **Administrer** les utilisateurs et commandes

### Statistiques du projet
- **12 tables** de base de données
- **25 produits** pré-configurés
- **6 modes** de tournoi FreeFire
- **10 pays** supportés
- **API REST** complète avec authentification JWT

---

## ⭐ Fonctionnalités

### 🛍️ E-commerce
- Catalogue de produits complet (diamants, pass, abonnements)
- Commandes avec idempotency (anti-doublons)
- Gestion des stocks et prix
- Interface d'administration

### 🏆 Système de tournois
- Tournois publics/privés avec codes d'accès
- 6 modes FreeFire : BR_SOLO, BR_DUO, BR_SQUAD, CLASH_SQUAD, LONE_WOLF, ROOM_HS
- Frais d'inscription configurables
- Workflow : création → validation → inscription → paiement

### 💳 Paiements
- Support multi-pays (BJ, CI, TG, BF, ML, NE, SN, GW, NG, FR)
- Mobile Money (MTN, Moov, Celtiis)
- Services de transfert (Remitly, WorldRemit, Western Union, etc.)
- Upload et validation des preuves de paiement

### 👥 Gestion utilisateurs
- 3 rôles : user (acheteur), organizer (tournois), admin (tout)
- Authentification JWT sécurisée
- Vérification email + reset mot de passe
- Profils FreeFire avec uid_freefire

---

## 🔧 Prérequis

### Logiciels requis
- **Docker** (v20.10+) et **Docker Compose** (v2.0+)
- **Git** pour cloner le projet
- **Navigateur web** moderne

### Configuration minimale
- **RAM :** 2 Go minimum, 4 Go recommandé
- **Stockage :** 5 Go d'espace libre
- **Réseau :** Ports 8080, 5432, 8081, 9000, 9001, 8025 disponibles

---

## 🚀 Installation rapide

### 1. Cloner le projet
\`\`\`bash
git clone https://github.com/votre-repo/freefire-mvp.git
cd freefire-mvp
\`\`\`

### 2. Démarrer avec Docker
\`\`\`bash
# Démarrer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
\`\`\`

### 3. Initialiser la base de données
\`\`\`bash
# Appliquer les migrations
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/001_init.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/002_entry_fees.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/003_tournaments.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/004_users.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/005_auth_tokens.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/006_catalog.sql

# Insérer les données d'exemple
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/001_entry_fees.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/002_catalog.sql
\`\`\`

### 4. Vérifier l'installation
- **API :** http://localhost:8080
- **Documentation :** http://localhost:8080/docs  
- **Base de données :** http://localhost:8081 (adminer)
- **Stockage fichiers :** http://localhost:9001 (minio)
- **Emails :** http://localhost:8025 (mailhog)

---

## 🔧 Configuration détaillée

### Variables d'environnement

Modifiez le fichier \`api/.env\` selon vos besoins :

\`\`\`env
# Sécurité - À CHANGER EN PRODUCTION
JWT_SECRET=votre-clé-secrete-très-longue-et-complexe
PAYMENTS_HMAC_SECRET=votre-clé-hmac-pour-webhooks
ADMIN_TOKEN=votre-token-admin-securise

# Base de données (si externe)
DATABASE_URL=postgresql://user:password@host:port/database

# Email (si SMTP externe)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app

# Contacts administrateurs
WHATSAPP_ADMIN=+22901234567
MERCHANT_MTN=+22901234567
MERCHANT_MOOV=+22901234567
\`\`\`

### Configuration de production

Pour la production, modifiez \`docker-compose.yml\` :

\`\`\`yaml
# Retirer les ports exposés non nécessaires
services:
  api:
    # Supprimer le mode development
    volumes: []
    environment:
      APP_ENV: production
      APP_DEBUG: false
\`\`\`

---

## 🌐 Déploiement

### Déploiement local
\`\`\`bash
# Mode développement (avec hot-reload)
docker-compose up

# Mode production
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### Déploiement serveur
\`\`\`bash
# Sur votre serveur
git clone https://github.com/votre-repo/freefire-mvp.git
cd freefire-mvp

# Configurer les variables d'environnement
cp api/.env.example api/.env
nano api/.env  # Modifier selon votre configuration

# Démarrer en production
docker-compose up -d

# Configurer un reverse proxy (nginx recommandé)
# Exemple de configuration nginx fourni dans docs/nginx.conf
\`\`\`

### SSL/TLS (HTTPS)

Pour sécuriser votre API en production :

\`\`\`bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Le certificat sera automatiquement renouvelé
\`\`\`

---

## 🧪 Tests

### Tests automatisés
\`\`\`bash
# Installer les dépendances de test
pip install -r api/requirements.txt

# Lancer les tests
cd api
pytest tests/

# Tests avec couverture
pytest --cov=app tests/
\`\`\`

### Tests manuels
\`\`\`bash
# Tester l'API
curl http://localhost:8080/health

# Tester l'authentification
curl -X POST http://localhost:8080/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"motdepasse123"}'

# Tester le catalogue
curl http://localhost:8080/catalog
\`\`\`

### Scripts de test fournis
\`\`\`bash
# Test complet de l'application
./scripts/tests/run_all_tests.sh

# Test de charge
./scripts/tests/load_test.sh

# Test de la base de données
./scripts/tests/db_test.sh
\`\`\`

---

## 📚 API Documentation

### Documentation interactive
- **Swagger UI :** http://localhost:8080/docs
- **ReDoc :** http://localhost:8080/redoc

### Endpoints principaux

#### Authentification
- \`POST /auth/register\` - Créer un compte
- \`POST /auth/login\` - Se connecter
- \`POST /auth/verify-email\` - Vérifier l'email

#### Catalogue
- \`GET /catalog\` - Lister les produits
- \`GET /catalog/{id}\` - Détail d'un produit
- \`POST /admin/catalog\` - Ajouter un produit (admin)

#### Commandes
- \`POST /orders\` - Créer une commande
- \`GET /orders/mine\` - Mes commandes
- \`POST /admin/orders/{code}/deliver\` - Marquer livré (admin)

#### Paiements
- \`GET /payments/methods?country=BJ\` - Méthodes disponibles
- \`POST /payments/checkout\` - Initier un paiement
- \`POST /payments/{id}/proof\` - Uploader une preuve

#### Tournois
- \`GET /tournaments\` - Lister les tournois
- \`POST /tournaments\` - Créer un tournoi
- \`POST /tournaments/{id}/register\` - S'inscrire

---

## 🏗️ Architecture

### Structure du projet
\`\`\`
FreeFire_MVP_Final/
├── api/                    # API FastAPI
│   ├── app/               # Code application
│   │   ├── routers/       # Endpoints par module
│   │   ├── services/      # Logique métier
│   │   ├── utils/         # Utilitaires
│   │   └── dependencies/  # Injections de dépendances
│   ├── tests/            # Tests unitaires
│   └── config/           # Configuration
├── database/             # Base de données
│   ├── migrations/       # Scripts SQL de migration
│   └── seeds/           # Données d'exemple
├── docs/                # Documentation
├── docker/              # Configuration Docker
└── scripts/             # Scripts utilitaires
\`\`\`

### Technologies utilisées

| Composant | Technologie | Version |
|-----------|------------|---------|
| **API** | FastAPI | 0.115.0 |
| **Base de données** | PostgreSQL | 15 |
| **ORM** | SQLAlchemy | 2.0.43 |
| **Authentification** | JWT | - |
| **Validation** | Pydantic | 2.8.2 |
| **Stockage fichiers** | MinIO | S3-compatible |
| **Email** | MailHog | Développement |
| **Conteneurisation** | Docker | 20.10+ |

---

## 📈 Monitoring et Logs

### Logs de l'application
\`\`\`bash
# Voir les logs en temps réel
docker-compose logs -f api

# Logs d'un service spécifique
docker-compose logs db
docker-compose logs minio
\`\`\`

### Métriques
- **Health checks :** http://localhost:8080/health
- **Base de données :** Via Adminer sur http://localhost:8081
- **Stockage :** Via MinIO Console sur http://localhost:9001

---

## 🆘 Dépannage

### Problèmes courants

#### Port déjà utilisé
\`\`\`bash
# Vérifier les ports utilisés
netstat -tulpn | grep :8080

# Modifier les ports dans docker-compose.yml si nécessaire
\`\`\`

#### Base de données ne démarre pas
\`\`\`bash
# Vérifier les logs
docker-compose logs db

# Réinitialiser les données (attention: perte de données)
docker-compose down -v
docker-compose up -d
\`\`\`

#### API ne répond pas
\`\`\`bash
# Vérifier les logs de l'API
docker-compose logs api

# Redémarrer l'API
docker-compose restart api
\`\`\`

### Commandes utiles
\`\`\`bash
# Redémarrer tous les services
docker-compose restart

# Reconstruire l'API après modifications
docker-compose build api
docker-compose up -d api

# Nettoyer les conteneurs et volumes
docker-compose down --volumes --remove-orphans
docker system prune -a
\`\`\`

---

## 👥 Support

### Documentation
- **Guide développeur :** [docs/developer-guide.md](docs/developer-guide.md)
- **Guide API :** [docs/api/README.md](docs/api/README.md)
- **FAQ :** [docs/faq.md](docs/faq.md)

### Contact
- **Email :** support@freefire-mvp.com
- **WhatsApp :** +229 01 51 10 45 75
- **GitHub Issues :** https://github.com/votre-repo/freefire-mvp/issues

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**🎉 Votre plateforme FreeFire MVP est maintenant prête !**

Pour commencer, rendez-vous sur http://localhost:8080/docs et explorez l'API interactive.

*Développé avec ❤️ pour la communauté FreeFire*
