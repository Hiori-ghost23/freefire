# 📁 STRUCTURE DU PROJET - FreeFire MVP

**Version :** 2.4.0  
**Dernière mise à jour :** 18 décembre 2025

---

## 🎯 VUE D'ENSEMBLE

Ce projet est organisé en **modules indépendants** pour faciliter le développement et la maintenance.

```
FreeFire_MVP_Final/
├── 🔥 api/                    # Backend FastAPI
├── 💻 frontend/               # Frontend Next.js
├── 💾 database/               # Migrations SQL
├── 📚 docs/                   # Documentation
├── 📦 reference/              # Ressources de référence
├── 🔧 scripts/                # Scripts utilitaires
└── 🐳 docker-compose.yml      # Orchestration services
```

---

## 🔥 API BACKEND

### Structure

```
api/
├── app/
│   ├── routers/              # 🎯 Endpoints API (7 modules)
│   │   ├── health.py         # Health checks
│   │   ├── auth.py           # Authentification
│   │   ├── catalog.py        # Catalogue produits
│   │   ├── orders.py         # Commandes
│   │   ├── payments.py       # Paiements
│   │   ├── tournaments.py    # Tournois
│   │   └── admin.py          # Administration
│   │
│   ├── services/             # 🔧 Logique métier
│   │   └── auth_service.py   # Service d'authentification
│   │
│   ├── dependencies/         # 🛡️ Middlewares
│   │   └── auth.py           # JWT & permissions
│   │
│   ├── utils/                # 🛠️ Utilitaires
│   ├── static/               # 📁 Fichiers statiques
│   ├── templates/            # 📧 Templates emails
│   │
│   ├── database.py           # 💾 Configuration DB
│   ├── models.py             # 📊 Modèles SQLAlchemy
│   ├── schemas.py            # ✅ Schémas Pydantic
│   └── main.py               # 🚀 Application principale
│
├── tests/                    # 🧪 Tests unitaires
├── config/                   # ⚙️ Configuration
├── .env                      # 🔐 Variables d'environnement
├── Dockerfile                # 🐳 Image Docker
└── requirements.txt          # 📦 Dépendances Python
```

### Modules API

#### 1. Health (`/health`)
- Health check de l'API
- Informations de version

#### 2. Auth (`/auth`)
- `POST /register` - Inscription
- `POST /login` - Connexion
- `GET /me` - Profil utilisateur
- `POST /verify-email` - Vérification email
- `POST /forgot-password` - Mot de passe oublié
- `POST /reset-password` - Réinitialisation
- `POST /logout` - Déconnexion

#### 3. Catalog (`/catalog`)
- `GET /catalog` - Liste produits (public)
- `GET /catalog/{id}` - Détail produit
- `POST /admin/catalog` - Créer produit (admin)
- `PUT /admin/catalog/{id}` - Modifier produit
- `DELETE /admin/catalog/{id}` - Supprimer produit

#### 4. Orders (`/orders`)
- `POST /orders` - Créer commande
- `GET /orders/mine` - Mes commandes
- `GET /orders/{code}` - Détail commande
- `POST /admin/orders/{code}/deliver` - Marquer livré

#### 5. Payments (`/payments`)
- `GET /methods` - Méthodes par pays
- `POST /checkout` - Initier paiement
- `POST /{id}/proof` - Upload preuve
- `GET /{id}` - Statut paiement

#### 6. Tournaments (`/tournaments`)
- `GET /tournaments` - Liste tournois
- `POST /tournaments` - Créer tournoi
- `GET /tournaments/{id}` - Détail tournoi
- `POST /tournaments/{id}/register` - S'inscrire
- `DELETE /tournaments/{id}` - Supprimer tournoi

#### 7. Admin (`/admin`)
- `GET /stats` - Statistiques globales
- `GET /users` - Liste utilisateurs
- `PUT /users/{id}/role` - Changer rôle
- `GET /payments/pending` - Paiements en attente
- `POST /payments/{id}/validate` - Valider paiement
- `POST /payments/{id}/reject` - Rejeter paiement

---

## 💻 FRONTEND

### Structure

```
frontend/
├── src/
│   ├── app/                  # 📄 Pages Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/        # ✅ Page connexion
│   │   │   └── register/     # ✅ Page inscription
│   │   ├── dashboard/        # ✅ Dashboard utilisateur
│   │   ├── tournaments/
│   │   │   ├── page.tsx      # ✅ Liste tournois
│   │   │   ├── create/       # 🚧 Création tournoi
│   │   │   ├── my/           # 🚧 Mes tournois
│   │   │   └── [id]/         # ✅ Détail tournoi
│   │   ├── catalog/          # ✅ Boutique e-commerce
│   │   ├── payment/          # ✅ Système de paiement
│   │   ├── profile/          # 🚧 Profil utilisateur
│   │   ├── cart/             # 🚧 Panier
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # ✅ Page d'accueil
│   │   └── providers.tsx     # Providers React
│   │
│   ├── components/           # 🧩 Composants réutilisables
│   │   ├── ui/               # Composants UI de base
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── toast.tsx
│   │   └── layout/           # Composants de layout
│   │       ├── Header.tsx    # ✅ Navigation principale
│   │       └── AppLayout.tsx # ✅ Layout réutilisable
│   │
│   ├── lib/                  # 📚 Bibliothèques
│   │   ├── api/              # Services API
│   │   │   ├── client.ts     # Client Axios
│   │   │   └── services.ts   # Services métier
│   │   ├── hooks/            # Hooks personnalisés
│   │   │   ├── api-hooks.ts  # Hooks React Query
│   │   │   ├── useCart.ts    # Gestion panier
│   │   │   └── useToast.ts   # Notifications
│   │   ├── validations/      # Schémas Zod
│   │   │   └── auth.ts       # Validation auth
│   │   └── utils/            # Utilitaires
│   │
│   ├── contexts/             # Contextes React
│   │   └── AuthContext.tsx   # 🚧 Contexte auth
│   │
│   └── types/                # Types TypeScript
│       └── api.ts            # Types API
│
├── public/                   # Fichiers publics
├── .env.local                # ✅ Variables d'environnement
├── package.json              # Dépendances
├── tsconfig.json             # Config TypeScript
├── tailwind.config.ts        # Config Tailwind
└── next.config.js            # Config Next.js
```

### Pages Développées

| Page | Route | Statut | Description |
|------|-------|--------|-------------|
| **Accueil** | `/` | ✅ | Landing page moderne |
| **Connexion** | `/login` | ✅ | Authentification |
| **Inscription** | `/register` | ✅ | Création de compte |
| **Dashboard** | `/dashboard` | ✅ | Tableau de bord |
| **Liste tournois** | `/tournaments` | ✅ | Tous les tournois |
| **Détail tournoi** | `/tournaments/[id]` | ✅ | Détails + inscription |
| **Créer tournoi** | `/tournaments/create` | 🚧 | À migrer |
| **Mes tournois** | `/tournaments/my` | 🚧 | À migrer |
| **Catalogue** | `/catalog` | ✅ | Boutique produits |
| **Paiement** | `/payment` | ✅ | Système multi-pays |
| **Profil** | `/profile` | 🚧 | À créer |
| **Panier** | `/cart` | 🚧 | À créer |

**Légende :** ✅ Complet | 🚧 En cours

---

## 💾 DATABASE

### Structure

```
database/
├── migrations/               # Scripts SQL chronologiques
│   ├── 001_init.sql         # Tables de base
│   ├── 002_entry_fees.sql   # Frais d'inscription
│   ├── 003_tournaments.sql  # Système tournois
│   ├── 004_users.sql        # Gestion utilisateurs
│   ├── 005_auth_tokens.sql  # Tokens auth
│   └── 006_catalog.sql      # Catalogue produits
│
└── seeds/                    # Données d'exemple
    ├── 001_entry_fees.sql   # 6 types de frais
    └── 002_catalog.sql      # 25 produits
```

### Tables (12 au total)

1. **users** - Utilisateurs
2. **auth_tokens** - Tokens de vérification
3. **catalog_items** - Produits
4. **orders** - Commandes
5. **payments** - Paiements
6. **payment_proofs** - Preuves de paiement
7. **tournaments** - Tournois
8. **tournament_registrations** - Inscriptions
9. **entry_fees** - Frais d'inscription
10. **tournament_results** - Résultats
11. **user_profiles** - Profils FreeFire
12. **admin_logs** - Logs admin

---

## 📚 DOCUMENTATION

### Structure

```
docs/
├── api/                      # Documentation API
│   └── endpoints.md          # Liste des endpoints
│
├── guides/                   # Guides utilisateur
│   ├── installation.md       # Guide d'installation
│   └── deployment.md         # Guide de déploiement
│
└── reports/                  # Rapports de projet
    └── SESSION_1_BACKEND_COMPLETE.md
```

### Fichiers Principaux

| Fichier | Description |
|---------|-------------|
| **README.md** | Guide complet du projet |
| **QUICK_START.md** | Démarrage rapide (5 min) |
| **GUIDE_EQUIPE.md** | Guide pour l'équipe |
| **RAPPORT_ETAT_PROJET.md** | État complet du projet |
| **RAPPORT_TRAVAIL_EN_COURS.md** | Journal de travail |
| **RESUME_SESSION_1.md** | Résumé session 1 |
| **STRUCTURE_PROJET.md** | Ce fichier |

---

## 📦 REFERENCE

### Structure

```
reference/
├── maquettes-html/           # 11 maquettes HTML
│   ├── connexion.html
│   ├── inscription.html
│   ├── maquette.html
│   ├── Tournois.html
│   └── ...
│
├── pages-react/              # Pages React originales
│   ├── CreateTournamentPage.tsx
│   ├── MyTournamentsPage.tsx
│   └── TournamentDetailPage.tsx
│
└── tests-integration/        # Tests d'intégration
    └── integration-test.html
```

---

## 🔧 SCRIPTS

### Structure

```
scripts/
├── setup/                    # Scripts d'installation
│   └── init-db.sh           # Initialisation DB
│
└── tests/                    # Scripts de test
    └── validate_setup.py    # Validation installation
```

---

## 🐳 DOCKER

### Services

```yaml
services:
  api:          # FastAPI (port 8080)
  db:           # PostgreSQL (port 5432)
  adminer:      # Interface DB (port 8081)
  minio:        # Stockage S3 (ports 9000, 9001)
  mailhog:      # Emails dev (ports 1025, 8025)
```

### Volumes

- `db_data` - Données PostgreSQL
- `minio_data` - Fichiers MinIO

---

## 🔐 VARIABLES D'ENVIRONNEMENT

### Backend (`api/.env`)

```env
# Base de données
DATABASE_URL=postgresql://postgres:postgres@db:5432/freefire_mvp

# Sécurité
JWT_SECRET=your-secret-key-change-in-production
PAYMENTS_HMAC_SECRET=your-hmac-secret
ADMIN_TOKEN=your-admin-token

# Email
SMTP_HOST=mailhog
SMTP_PORT=1025

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio12345

# Contacts
WHATSAPP_ADMIN=+22901511045
```

### Frontend (`frontend/.env.local`)

```env
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=10000

# MinIO
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_MINIO_BUCKET=freefire-uploads

# App
NEXT_PUBLIC_APP_NAME=FreeFire MVP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 COMMANDES UTILES

### Démarrage

```bash
# Démarrer tous les services
docker-compose up -d

# Démarrer en mode développement (avec logs)
docker-compose up

# Démarrer uniquement l'API
docker-compose up -d api
```

### Logs

```bash
# Tous les logs
docker-compose logs -f

# Logs API uniquement
docker-compose logs -f api

# Logs base de données
docker-compose logs -f db
```

### Base de données

```bash
# Accéder à PostgreSQL
docker-compose exec db psql -U postgres -d freefire_mvp

# Exécuter une migration
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/001_init.sql

# Backup de la base
docker-compose exec db pg_dump -U postgres freefire_mvp > backup.sql
```

### API

```bash
# Redémarrer l'API
docker-compose restart api

# Reconstruire l'API
docker-compose build api
docker-compose up -d api

# Accéder au conteneur API
docker-compose exec api bash
```

### Frontend

```bash
# Installer les dépendances
cd frontend && npm install

# Démarrer en développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start
```

### Nettoyage

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Nettoyer Docker
docker system prune -a
```

---

## 📊 MÉTRIQUES DU PROJET

### Code

- **Backend :** ~2500 lignes Python
- **Frontend :** ~3000 lignes TypeScript/React
- **SQL :** ~1000 lignes
- **Total :** ~6500 lignes

### Fichiers

- **Backend :** 15 fichiers principaux
- **Frontend :** 30+ composants
- **Documentation :** 10+ fichiers
- **Total :** 60+ fichiers

### Fonctionnalités

- **32 endpoints** API
- **12 pages** frontend
- **12 tables** base de données
- **25 produits** pré-configurés
- **10 pays** supportés

---

## 🎯 PROGRESSION

| Module | Progression | Statut |
|--------|-------------|--------|
| **Backend API** | 100% | ✅ Complet |
| **Base de données** | 100% | ✅ Complet |
| **Frontend Pages** | 67% | 🚧 En cours |
| **Intégration API** | 0% | ⏳ À faire |
| **Tests** | 20% | ⏳ À faire |
| **Documentation** | 90% | ✅ Excellent |
| **GLOBAL** | **82%** | 🟢 Avancé |

---

## 📞 SUPPORT

### Accès aux Services

- **API Swagger :** http://localhost:8080/docs
- **API ReDoc :** http://localhost:8080/redoc
- **Adminer :** http://localhost:8081
- **MinIO Console :** http://localhost:9001
- **MailHog :** http://localhost:8025
- **Frontend :** http://localhost:3000

### Documentation

- Voir `README.md` pour le guide complet
- Voir `QUICK_START.md` pour démarrer rapidement
- Voir `GUIDE_EQUIPE.md` pour l'équipe de développement

---

**📁 Structure du projet FreeFire MVP - Version 2.4.0**

*Dernière mise à jour : 18 décembre 2025*
