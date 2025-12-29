# 🚀 Guide de Déploiement sur Render - FreeFire MVP API

Ce guide explique comment déployer l'API FreeFire MVP sur Render.

## 📋 Prérequis

- Un compte Render (gratuit) : https://render.com
- Le projet sur GitHub
- Les corrections de déploiement appliquées

## 🔧 Étapes de Déploiement

### 1. Créer la Base de Données PostgreSQL

1. Sur Render Dashboard → **New +** → **PostgreSQL**
2. Configuration :
   - **Name** : `freefire-db`
   - **Database** : `freefire_mvp`
   - **User** : `freefire_user`
   - **Plan** : **Free** (pour commencer)
3. Cliquer sur **Create Database**
4. **Important** : Copier l'**Internal Database URL** (format `postgres://...`)

### 2. Créer le Service Web (API)

1. Sur Render Dashboard → **New +** → **Web Service**
2. Connecter ton repo GitHub et sélectionner le projet
3. Configuration du service :
   - **Name** : `freefire-api` (ou autre nom)
   - **Environment** : **Docker**
   - **Root Directory** : `api` ⚠️ **IMPORTANT**
   - **Dockerfile Path** : `api/Dockerfile` (ou laisser vide si Root Directory = api)
   - **Docker Context** : `api` (ou `.` si Root Directory = api)
   - **Build Command** : (laisser vide, Docker gère ça)
   - **Start Command** : (laisser vide, utilise le CMD du Dockerfile)
   - **Plan** : **Free**

### 3. Configurer les Variables d'Environnement

Dans l'onglet **Environment** du service web :

#### Variables Obligatoires :

```
DATABASE_URL = postgres://user:pass@host:port/db
```
*(Utiliser l'Internal Database URL de la DB créée à l'étape 1)*

```
JWT_SECRET = [Générer une clé longue et aléatoire]
```
Exemple : `openssl rand -hex 32` ou utiliser un générateur en ligne

```
PAYMENTS_HMAC_SECRET = [Générer une clé longue et aléatoire]
```

```
ADMIN_TOKEN = [Générer un token admin sécurisé]
```

#### Variables Optionnelles :

```
CORS_ORIGINS = https://ton-projet.vercel.app
```
*(À remplacer par l'URL de ton frontend Vercel une fois déployé)*

```
PORT = 8080
```
*(Render définit automatiquement PORT, mais on peut le spécifier)*

### 4. Initialiser la Base de Données

Une fois la DB et l'API déployées, il faut exécuter les migrations SQL.

#### Option A : Via psql en local

```bash
# Installer psql si nécessaire
# Windows : https://www.postgresql.org/download/windows/
# Mac : brew install postgresql
# Linux : sudo apt-get install postgresql-client

# Utiliser l'External Database URL (pas Internal) depuis Render
psql "postgres://user:pass@host:port/db" -f database/migrations/001_init.sql
psql "postgres://user:pass@host:port/db" -f database/migrations/002_entry_fees.sql
psql "postgres://user:pass@host:port/db" -f database/migrations/003_tournaments.sql
psql "postgres://user:pass@host:port/db" -f database/migrations/004_users.sql
psql "postgres://user:pass@host:port/db" -f database/migrations/005_auth_tokens.sql
psql "postgres://user:pass@host:port/db" -f database/migrations/006_catalog.sql

# Insérer les données d'exemple
psql "postgres://user:pass@host:port/db" -f database/seeds/001_entry_fees.sql
psql "postgres://user:pass@host:port/db" -f database/seeds/002_catalog.sql
```

#### Option B : Via Render Shell

1. Sur Render Dashboard → Ton service web → **Shell**
2. Exécuter les commandes SQL directement

### 5. Vérifier le Déploiement

1. Attendre que le build soit terminé (peut prendre 5-10 minutes la première fois)
2. Vérifier les logs : Dashboard → Service → **Logs**
3. Tester l'API :
   ```bash
   curl https://ton-service.onrender.com/health
   curl https://ton-service.onrender.com/catalog
   ```
4. Accéder à la documentation Swagger :
   `https://ton-service.onrender.com/docs`

## ⚠️ Problèmes Courants

### Erreur : "Cannot connect to database"

**Solution** :
- Vérifier que `DATABASE_URL` utilise l'**Internal Database URL** (pas External)
- Vérifier que la DB est bien démarrée sur Render
- Attendre quelques minutes après la création de la DB

### Erreur : "Port already in use"

**Solution** :
- Le Dockerfile a été corrigé pour utiliser `${PORT:-8080}`
- Render définit automatiquement `PORT`, donc ça devrait fonctionner

### Erreur : "Static files directory not found"

**Solution** :
- Le code a été corrigé pour gérer le cas où `app/static` n'existe pas
- Cette erreur ne devrait plus apparaître

### Build échoue

**Solution** :
- Vérifier que **Root Directory** = `api` dans les paramètres Render
- Vérifier les logs de build pour voir l'erreur exacte
- S'assurer que `requirements.txt` est présent dans `api/`

## 🔗 Prochaines Étapes

1. **Déployer le frontend sur Vercel** (voir `DEPLOYMENT_VERCEL.md`)
2. **Configurer CORS_ORIGINS** avec l'URL Vercel
3. **Tester l'intégration complète** frontend ↔ backend
4. **Configurer un domaine personnalisé** (optionnel)

## 📚 Ressources

- Documentation Render : https://render.com/docs
- Support Render : https://render.com/docs/support


