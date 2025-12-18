# 🚀 Guide d'Installation et de Lancement - Windows

**FreeFire MVP - Version 2.4.0**  
Guide complet pour installer et lancer le projet sur Windows

---

## 📋 Prérequis à Installer

### 1️⃣ Docker Desktop pour Windows

Docker est nécessaire pour faire fonctionner le backend (API + base de données).

**Installation :**

1. Télécharger Docker Desktop depuis : https://www.docker.com/products/docker-desktop/
2. Exécuter l'installateur
3. Redémarrer l'ordinateur si demandé
4. Lancer Docker Desktop
5. Vérifier l'installation dans PowerShell :
   ```powershell
   docker --version
   docker-compose --version
   ```

**Note :** Docker Desktop nécessite Windows 10/11 Pro, Enterprise, ou Education avec WSL 2.
Si tu as Windows Home, tu devras activer WSL 2 d'abord.

**Activation WSL 2 (si nécessaire) :**
```powershell
# Ouvrir PowerShell en tant qu'Administrateur
wsl --install
# Redémarrer l'ordinateur
```

### 2️⃣ Node.js (version 18 ou supérieure)

Node.js est nécessaire pour faire fonctionner le frontend Next.js.

**Installation :**

1. Télécharger Node.js depuis : https://nodejs.org/
2. Choisir la version **LTS** (Long Term Support)
3. Exécuter l'installateur (laisser les options par défaut)
4. Vérifier l'installation dans PowerShell :
   ```powershell
   node --version
   npm --version
   ```

---

## 🎯 Lancement du Projet - Méthode Simple

### Étape 1 : Démarrer le Backend avec Docker

Ouvrir PowerShell dans le dossier du projet :

```powershell
# Se placer dans le répertoire du projet
cd D:\Downloads\FreeFire_MVP_Final

# Démarrer tous les services Docker
docker-compose up -d

# Attendre que tous les services soient prêts (environ 30 secondes)
Start-Sleep -Seconds 30
```

### Étape 2 : Initialiser la Base de Données

```powershell
# Exécuter toutes les migrations SQL
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/001_init.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/002_entry_fees.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/003_tournaments.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/004_users.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/005_auth_tokens.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/006_catalog.sql

# Insérer les données d'exemple
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/001_entry_fees.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/002_catalog.sql
```

**Alternative - Script unique (copier-coller dans PowerShell) :**
```powershell
$migrations = @(
  "001_init.sql",
  "002_entry_fees.sql",
  "003_tournaments.sql",
  "004_users.sql",
  "005_auth_tokens.sql",
  "006_catalog.sql"
)

foreach ($migration in $migrations) {
  Write-Host "Exécution de la migration : $migration" -ForegroundColor Green
  docker-compose exec db psql -U postgres -d freefire_mvp -f "/docker-entrypoint-initdb.d/migrations/$migration"
}

Write-Host "Insertion des données d'exemple..." -ForegroundColor Green
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/001_entry_fees.sql
docker-compose exec db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/002_catalog.sql
```

### Étape 3 : Vérifier que l'API fonctionne

```powershell
# Tester l'API
Invoke-WebRequest -Uri http://localhost:8080/health -UseBasicParsing
```

Tu devrais voir une réponse JSON avec `"status": "ok"`.

### Étape 4 : Installer les dépendances du Frontend

```powershell
# Se placer dans le dossier frontend
cd frontend

# Installer les dépendances Node.js
npm install
```

### Étape 5 : Démarrer le Frontend

```powershell
# Toujours dans le dossier frontend
npm run dev
```

Le frontend sera accessible sur : **http://localhost:3000**

---

## 🌐 Accès aux Services

Une fois tout lancé, tu peux accéder à :

| Service | URL | Identifiants |
|---------|-----|--------------|
| **🎮 Application Frontend** | http://localhost:3000 | - |
| **🔥 API Backend** | http://localhost:8080 | - |
| **📚 Documentation API** | http://localhost:8080/docs | - |
| **💾 Base de données (Adminer)** | http://localhost:8081 | postgres / postgres |
| **📁 Stockage (MinIO)** | http://localhost:9001 | minio / minio12345 |
| **📧 Emails (MailHog)** | http://localhost:8025 | - |

---

## 🧪 Test de Validation Rapide

### Test 1 : Backend API
```powershell
# Ouvrir un navigateur
Start-Process "http://localhost:8080/docs"
```

Tu devrais voir la documentation interactive Swagger.

### Test 2 : Frontend
```powershell
# Ouvrir un navigateur
Start-Process "http://localhost:3000"
```

Tu devrais voir la page d'accueil FreeFire MVP.

### Test 3 : Créer un compte utilisateur

1. Aller sur http://localhost:3000/register
2. Remplir le formulaire d'inscription
3. Te connecter sur http://localhost:3000/login
4. Explorer les tournois et le catalogue

---

## 🛑 Arrêter les Services

Pour arrêter proprement tous les services :

```powershell
# Depuis le dossier racine du projet
cd D:\Downloads\FreeFire_MVP_Final

# Arrêter Docker Compose
docker-compose down

# Dans le terminal du frontend (Ctrl+C)
# Puis fermer le terminal
```

---

## 🔧 Dépannage

### Problème : Docker ne démarre pas

**Solution :**
1. Vérifier que Docker Desktop est lancé (icône dans la barre des tâches)
2. Attendre que Docker Desktop affiche "Docker is running"
3. Redémarrer Docker Desktop si nécessaire

### Problème : Port 8080 déjà utilisé

**Solution :**
```powershell
# Trouver le processus utilisant le port 8080
netstat -ano | findstr :8080

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

Ou modifier le port dans `docker-compose.yml` :
```yaml
api:
  ports:
    - "8090:8080"  # Utiliser 8090 au lieu de 8080
```

### Problème : Port 3000 déjà utilisé

**Solution :**
Démarrer le frontend sur un autre port :
```powershell
npm run dev -- -p 3001
```

### Problème : npm install échoue

**Solutions :**
```powershell
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Problème : Erreur de connexion API depuis le frontend

**Vérifications :**
1. L'API est bien lancée : http://localhost:8080/health
2. Le fichier `.env.local` du frontend contient :
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```
3. Redémarrer le frontend après modification du .env.local

---

## 📊 Logs et Debugging

### Voir les logs du backend

```powershell
# Tous les services
docker-compose logs -f

# Seulement l'API
docker-compose logs -f api

# Seulement la base de données
docker-compose logs -f db
```

### Voir les logs du frontend

Les logs s'affichent directement dans le terminal où tu as lancé `npm run dev`.

### Accéder à la base de données

**Via Adminer (Interface Web) :**
1. Aller sur http://localhost:8081
2. Serveur : `db`
3. Utilisateur : `postgres`
4. Mot de passe : `postgres`
5. Base : `freefire_mvp`

**Via ligne de commande :**
```powershell
docker-compose exec db psql -U postgres -d freefire_mvp
```

---

## 🎉 Félicitations !

Si tu as suivi toutes les étapes, ton projet FreeFire MVP est maintenant :

- ✅ Backend API fonctionnel
- ✅ Base de données initialisée avec données d'exemple
- ✅ Frontend Next.js opérationnel
- ✅ Communication frontend-backend établie
- ✅ Prêt pour le développement et les tests

**Prochaines étapes :**
1. Créer un compte utilisateur
2. Explorer le catalogue de produits
3. Créer ou rejoindre un tournoi
4. Tester le système de paiement

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs Docker : `docker-compose logs -f`
2. Vérifier les logs frontend dans le terminal
3. Consulter la documentation API : http://localhost:8080/docs
4. Vérifier les issues GitHub du projet

**Bon développement ! 🚀**
