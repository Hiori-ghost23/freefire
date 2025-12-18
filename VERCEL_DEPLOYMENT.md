# 🚀 Déploiement sur Vercel - FreeFire MVP

## 📋 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Railway/      │────▶│   Supabase/     │
│   (Frontend)    │     │   Render (API)  │     │   Neon (DB)     │
│   Next.js       │     │   FastAPI       │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🗄️ Étape 1 : Base de données (Supabase - Gratuit)

### 1.1 Créer un compte Supabase
1. Aller sur https://supabase.com
2. Créer un compte (gratuit)
3. Créer un nouveau projet

### 1.2 Récupérer l'URL de connexion
1. Aller dans **Settings** → **Database**
2. Copier l'**URI** (Connection string)
3. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

### 1.3 Exécuter les migrations
Dans l'éditeur SQL de Supabase, exécuter dans l'ordre :
1. Contenu de `database/migrations/001_init.sql`
2. Contenu de `database/migrations/002_entry_fees.sql`
3. Contenu de `database/migrations/003_tournaments.sql`
4. Contenu de `database/migrations/004_users.sql`
5. Contenu de `database/migrations/005_auth_tokens.sql`
6. Contenu de `database/migrations/006_catalog.sql`
7. Contenu de `database/seeds/001_entry_fees.sql`
8. Contenu de `database/seeds/002_catalog.sql`
9. Contenu de `database/seeds/003_demo_user.sql`

---

## 🔧 Étape 2 : Backend API (Railway - Gratuit)

### 2.1 Créer un compte Railway
1. Aller sur https://railway.app
2. Se connecter avec GitHub

### 2.2 Déployer l'API
1. Cliquer sur **New Project** → **Deploy from GitHub repo**
2. Sélectionner votre repo
3. Configurer le **Root Directory** : `api`
4. Railway détectera automatiquement Python/FastAPI

### 2.3 Configurer les variables d'environnement
Dans Railway, aller dans **Variables** et ajouter :

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
JWT_SECRET=votre-secret-jwt-super-long-min-32-caracteres
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
APP_ENV=production
APP_DEBUG=false
CORS_ORIGINS=https://votre-app.vercel.app
```

### 2.4 Récupérer l'URL de l'API
Une fois déployé, Railway vous donne une URL comme :
`https://freefire-api-production.up.railway.app`

---

## 🌐 Étape 3 : Frontend (Vercel - Gratuit)

### 3.1 Préparer le repo
Assurez-vous que le dossier `frontend/` est à la racine du repo.

### 3.2 Déployer sur Vercel

#### Option A : Via l'interface web
1. Aller sur https://vercel.com
2. Se connecter avec GitHub
3. Cliquer sur **Add New** → **Project**
4. Importer votre repo GitHub
5. Configurer :
   - **Framework Preset** : Next.js
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`

#### Option B : Via CLI
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer depuis le dossier frontend
cd frontend
vercel
```

### 3.3 Configurer les variables d'environnement
Dans Vercel, aller dans **Settings** → **Environment Variables** :

```env
NEXT_PUBLIC_API_BASE_URL=https://votre-api.up.railway.app
NEXT_PUBLIC_APP_NAME=FreeFire MVP
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NEXT_PUBLIC_SUPPORT_EMAIL=support@votre-domaine.com
NEXT_PUBLIC_WHATSAPP_ADMIN=+22901511045
```

### 3.4 Redéployer
Après avoir ajouté les variables, redéployer :
- Via l'interface : **Deployments** → **Redeploy**
- Via CLI : `vercel --prod`

---

## ✅ Étape 4 : Vérification

### Tester l'API
```bash
curl https://votre-api.up.railway.app/health
curl https://votre-api.up.railway.app/catalog
```

### Tester le Frontend
Ouvrir https://votre-app.vercel.app dans le navigateur.

### Comptes de test
```
Email: demo@freefire.com
Mot de passe: demo123
```

---

## 🔄 Mises à jour

### Déploiement automatique
- **Vercel** : Chaque push sur `main` déclenche un déploiement
- **Railway** : Chaque push sur `main` déclenche un déploiement

### Déploiement manuel
```bash
# Frontend
cd frontend
vercel --prod

# Backend (via Railway CLI)
railway up
```

---

## 💰 Coûts estimés

| Service | Plan Gratuit | Limites |
|---------|--------------|---------|
| **Vercel** | Gratuit | 100GB bandwidth/mois |
| **Railway** | $5 crédit/mois | ~500h d'exécution |
| **Supabase** | Gratuit | 500MB DB, 1GB storage |

**Total : 0€/mois** pour commencer !

---

## 🆘 Dépannage

### Erreur CORS
Vérifier que `CORS_ORIGINS` dans Railway inclut votre domaine Vercel.

### API ne répond pas
1. Vérifier les logs dans Railway
2. Vérifier que `DATABASE_URL` est correct

### Frontend ne charge pas les données
1. Vérifier `NEXT_PUBLIC_API_BASE_URL` dans Vercel
2. Ouvrir la console du navigateur pour voir les erreurs

---

## 📞 Support

- **Vercel Docs** : https://vercel.com/docs
- **Railway Docs** : https://docs.railway.app
- **Supabase Docs** : https://supabase.com/docs
