# 🚀 Guide de Déploiement sur Vercel - FreeFire MVP Frontend

Ce guide explique comment déployer le frontend Next.js sur Vercel.

## 📋 Prérequis

- Un compte Vercel (gratuit) : https://vercel.com
- Le projet sur GitHub
- L'API backend déjà déployée sur Render

## 🔧 Étapes de Déploiement

### 1. Créer le Projet Vercel

1. Aller sur https://vercel.com/new
2. **Import Git Repository** → Sélectionner ton repo GitHub
3. Configuration du projet :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `frontend` ⚠️ **IMPORTANT**
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `npm install` (par défaut)

### 2. Configurer les Variables d'Environnement

Dans **Settings** → **Environment Variables** :

#### Variable Obligatoire :

```
NEXT_PUBLIC_API_BASE_URL = https://ton-service-api.onrender.com
```
*(Remplacer par l'URL réelle de ton API Render)*

⚠️ **Important** : 
- Le préfixe `NEXT_PUBLIC_` est obligatoire pour exposer la variable au client
- Définir cette variable pour au moins l'environnement **Production**
- Optionnellement aussi pour **Preview** (branches de test)

### 3. Déployer

1. Cliquer sur **Deploy**
2. Attendre la fin du build (2-5 minutes)
3. Une fois terminé, Vercel fournit une URL : `https://ton-projet.vercel.app`

### 4. Vérifier le Déploiement

1. Ouvrir l'URL fournie par Vercel
2. Tester les pages principales :
   - `/` - Page d'accueil
   - `/register` - Inscription
   - `/login` - Connexion
   - `/catalog` - Catalogue produits
   - `/tournaments` - Liste des tournois

### 5. Configurer CORS sur Render

Une fois le frontend déployé, retourner sur Render pour autoriser l'origine Vercel :

1. Sur Render Dashboard → Ton service API → **Environment**
2. Modifier `CORS_ORIGINS` :
   ```
   CORS_ORIGINS = https://ton-projet.vercel.app
   ```
   *(Ou plusieurs URLs séparées par des virgules)*
3. Redéployer le service API (Render redéploie automatiquement)

## ⚠️ Problèmes Courants

### Erreur : "API request failed" ou CORS error

**Solution** :
- Vérifier que `NEXT_PUBLIC_API_BASE_URL` est bien configurée sur Vercel
- Vérifier que `CORS_ORIGINS` sur Render inclut l'URL Vercel
- Vérifier que l'API Render fonctionne : `curl https://ton-api.onrender.com/health`

### Erreur : "Cannot find module" lors du build

**Solution** :
- Vérifier que **Root Directory** = `frontend` dans Vercel
- Vérifier que `package.json` existe dans `frontend/`
- Vérifier les logs de build sur Vercel pour plus de détails

### Erreur : "Environment variable not found"

**Solution** :
- S'assurer que la variable commence par `NEXT_PUBLIC_`
- Vérifier qu'elle est définie pour l'environnement **Production**
- Redéployer après avoir ajouté/modifié une variable

### Build échoue avec erreurs TypeScript

**Solution** :
- Le `next.config.js` ignore déjà les erreurs TypeScript en build (`ignoreBuildErrors: true`)
- Si ça persiste, vérifier les logs de build pour l'erreur exacte

## 🔗 Prochaines Étapes

1. **Tester l'intégration complète** :
   - Créer un compte utilisateur
   - Se connecter
   - Parcourir le catalogue
   - Créer une commande
   - Créer/rejoindre un tournoi

2. **Configurer un domaine personnalisé** (optionnel) :
   - Vercel → Settings → Domains
   - Ajouter ton domaine
   - Suivre les instructions DNS

3. **Optimiser les performances** :
   - Vérifier les métriques Vercel Analytics
   - Optimiser les images Next.js
   - Configurer le caching si nécessaire

## 📚 Ressources

- Documentation Vercel : https://vercel.com/docs
- Next.js Deployment : https://nextjs.org/docs/deployment
- Support Vercel : https://vercel.com/support


