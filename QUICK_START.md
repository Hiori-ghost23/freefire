# ⚡ Guide de Démarrage Rapide - FreeFire MVP

**Temps estimé :** 5-10 minutes  
**Objectif :** Démarrer l'application complète FreeFire MVP

---

## 🚀 Démarrage en 4 étapes

### 1️⃣ Vérifier les prérequis
```bash
# Vérifier Docker
docker --version
docker-compose --version

# Si Docker n'est pas installé : https://docs.docker.com/get-docker/
```

### 2️⃣ Démarrer l'application
```bash
# Dans le répertoire FreeFire_MVP_Final
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

### 3️⃣ Initialiser la base de données
```bash
# Appliquer toutes les migrations (copiez-collez tout le bloc)
docker-compose exec db psql -U postgres -d freefire_mvp << 'EOF'
\i /docker-entrypoint-initdb.d/migrations/001_init.sql
\i /docker-entrypoint-initdb.d/migrations/002_entry_fees.sql
\i /docker-entrypoint-initdb.d/migrations/003_tournaments.sql
\i /docker-entrypoint-initdb.d/migrations/004_users.sql
\i /docker-entrypoint-initdb.d/migrations/005_auth_tokens.sql
\i /docker-entrypoint-initdb.d/migrations/006_catalog.sql
\i /docker-entrypoint-initdb.d/seeds/001_entry_fees.sql
\i /docker-entrypoint-initdb.d/seeds/002_catalog.sql
\i /docker-entrypoint-initdb.d/seeds/003_demo_user.sql
EOF
```

### 4️⃣ Valider l'installation
```bash
# Lancer le script de validation
python scripts/tests/validate_setup.py

# Ou tester manuellement
curl http://localhost:8080/health
```

---

## 🌐 Accès aux services

| Service | URL | Description |
|---------|-----|-------------|
| **🔥 API FreeFire** | http://localhost:8080 | API principale |
| **📚 Documentation** | http://localhost:8080/docs | Swagger UI interactif |
| **💾 Base de données** | http://localhost:8081 | Adminer (postgres/postgres) |
| **📁 Stockage** | http://localhost:9001 | MinIO Console (minio/minio12345) |
| **📧 Emails** | http://localhost:8025 | MailHog (emails de développement) |

---

## ⚡ Tests rapides

### Test API
```bash
# Endpoint racine
curl http://localhost:8080/

# Catalogue des produits
curl http://localhost:8080/catalog

# Méthodes de paiement pour le Bénin
curl "http://localhost:8080/payments/methods?country=BJ"
```

### Test avec Postman/Insomnia
Importez la collection OpenAPI : http://localhost:8080/openapi.json

---

## 🛠️ Développement

### Modifier le code
```bash
# Les changements dans api/app/ sont automatiquement pris en compte
# Redémarrer si nécessaire
docker-compose restart api
```

### Voir les logs
```bash
# Tous les logs
docker-compose logs -f

# API seulement
docker-compose logs -f api

# Base de données seulement
docker-compose logs -f db
```

### Accès direct à la base de données
```bash
# Via psql
docker-compose exec db psql -U postgres -d freefire_mvp

# Via Adminer (interface web)
# http://localhost:8081
# Serveur: db, Utilisateur: postgres, Mot de passe: postgres
```

---

## 🎯 Workflow complet

### 1. Créer un utilisateur (test)
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "motdepasse123",
    "display_name": "Testeur",
    "uid_freefire": "123456789",
    "country_code": "BJ"
  }'
```

### 2. Se connecter
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "motdepasse123"
  }'
```

### 3. Récupérer un token et faire des requêtes authentifiées
```bash
# Utiliser le token obtenu à l'étape 2
TOKEN="votre-jwt-token-ici"

# Créer une commande
curl -X POST http://localhost:8080/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "catalogItemId": "abd9e4a7-0c4d-44c6-a563-d6ca303329c1",
    "uidFreeFire": "123456789"
  }'
```

---

## 🆘 Problèmes courants

### Port 8080 déjà utilisé
```bash
# Modifier dans docker-compose.yml
ports:
  - "8090:8080"  # Utiliser port 8090 au lieu de 8080
```

### Services ne démarrent pas
```bash
# Nettoyer et redémarrer
docker-compose down --volumes
docker-compose up -d --build
```

### API ne répond pas
```bash
# Vérifier les logs
docker-compose logs api

# Redémarrer l'API
docker-compose restart api
```

---

## 📱 Interface Frontend (Next.js)

### Démarrer le frontend
```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Accès au frontend
| Service | URL | Description |
|---------|-----|-------------|
| **🌐 Frontend** | http://localhost:3000 | Application Next.js |
| **🏠 Accueil** | http://localhost:3000 | Page d'accueil |
| **🔐 Connexion** | http://localhost:3000/login | Page de connexion |
| **📝 Inscription** | http://localhost:3000/register | Page d'inscription |
| **📊 Dashboard** | http://localhost:3000/dashboard | Tableau de bord |
| **🛒 Catalogue** | http://localhost:3000/catalog | Boutique |
| **🏆 Tournois** | http://localhost:3000/tournaments | Liste des tournois |
| **👤 Profil** | http://localhost:3000/profile | Mon profil |
| **🛍️ Panier** | http://localhost:3000/cart | Mon panier |

### Compte de test
```
Email: demo@freefire.com
Mot de passe: demo123
```

---

## 🎉 Félicitations !

Votre plateforme FreeFire MVP est maintenant opérationnelle avec :

- ✅ **25 produits** dans le catalogue
- ✅ **6 modes de tournois** FreeFire  
- ✅ **10 pays** supportés pour les paiements
- ✅ **Authentification** JWT complète
- ✅ **Base de données** PostgreSQL optimisée
- ✅ **API REST** documentée avec Swagger

**Prochaine étape :** Consultez le [README.md](README.md) complet pour le déploiement en production.

---

*🔥 Prêt à créer la meilleure expérience FreeFire ? Let's go!*
