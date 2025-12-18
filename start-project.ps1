# =============================================================================
# Script de Lancement Automatique - FreeFire MVP
# =============================================================================
# Ce script démarre automatiquement le backend et le frontend
# Utilisation: .\start-project.ps1

Write-Host @"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║             🔥  FREEFIRE MVP - LANCEMENT AUTOMATIQUE  🔥         ║
║                         Version 2.4.0                             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# =============================================================================
# ÉTAPE 1: Vérification des prérequis
# =============================================================================

Write-Host "`n[1/5] 🔍 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Docker
Write-Host "  → Vérification de Docker..." -NoNewline
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ OK" -ForegroundColor Green
        Write-Host "    $dockerVersion" -ForegroundColor Gray
    } else {
        throw "Docker non trouvé"
    }
} catch {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    Write-Host @"
    
    ⚠️  Docker n'est pas installé ou n'est pas dans le PATH.
    
    Pour installer Docker Desktop:
    1. Télécharger depuis: https://www.docker.com/products/docker-desktop/
    2. Installer et redémarrer l'ordinateur
    3. Lancer Docker Desktop
    4. Relancer ce script
    
"@ -ForegroundColor Red
    exit 1
}

# Vérifier Docker Compose
Write-Host "  → Vérification de Docker Compose..." -NoNewline
try {
    $composeVersion = docker-compose --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ OK" -ForegroundColor Green
        Write-Host "    $composeVersion" -ForegroundColor Gray
    } else {
        throw "Docker Compose non trouvé"
    }
} catch {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    Write-Host "    Docker Compose est requis (inclus avec Docker Desktop)" -ForegroundColor Red
    exit 1
}

# Vérifier Node.js
Write-Host "  → Vérification de Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ OK" -ForegroundColor Green
        Write-Host "    $nodeVersion" -ForegroundColor Gray
    } else {
        throw "Node.js non trouvé"
    }
} catch {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    Write-Host @"
    
    ⚠️  Node.js n'est pas installé ou n'est pas dans le PATH.
    
    Pour installer Node.js:
    1. Télécharger depuis: https://nodejs.org/
    2. Choisir la version LTS
    3. Installer et redémarrer PowerShell
    4. Relancer ce script
    
"@ -ForegroundColor Red
    exit 1
}

# Vérifier npm
Write-Host "  → Vérification de npm..." -NoNewline
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ OK" -ForegroundColor Green
        Write-Host "    v$npmVersion" -ForegroundColor Gray
    } else {
        throw "npm non trouvé"
    }
} catch {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    exit 1
}

# =============================================================================
# ÉTAPE 2: Démarrage des services Docker
# =============================================================================

Write-Host "`n[2/5] 🐳 Démarrage des services Docker..." -ForegroundColor Yellow

# Vérifier si Docker Desktop est lancé
Write-Host "  → Vérification que Docker est en cours d'exécution..." -NoNewline
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host " ⚠️ WARNING" -ForegroundColor Yellow
        Write-Host @"
    
    Docker Desktop ne semble pas être lancé.
    Veuillez:
    1. Lancer Docker Desktop
    2. Attendre qu'il affiche "Docker is running"
    3. Appuyer sur Entrée pour continuer...
    
"@ -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host " ✅ OK" -ForegroundColor Green
    }
} catch {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    Write-Host "    Impossible de communiquer avec Docker" -ForegroundColor Red
    exit 1
}

# Démarrer docker-compose
Write-Host "  → Démarrage de docker-compose (cela peut prendre 1-2 minutes)..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "    ❌ Échec du démarrage de docker-compose" -ForegroundColor Red
    exit 1
}

Write-Host "  → Attente du démarrage complet des services..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Vérifier les services
Write-Host "  → Vérification des services..." -NoNewline
$services = docker-compose ps --services
if ($services -match "api" -and $services -match "db") {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ⚠️ WARNING" -ForegroundColor Yellow
}

# =============================================================================
# ÉTAPE 3: Initialisation de la base de données
# =============================================================================

Write-Host "`n[3/5] 💾 Initialisation de la base de données..." -ForegroundColor Yellow

# Attendre que PostgreSQL soit prêt
Write-Host "  → Attente de PostgreSQL..." -NoNewline
$maxRetries = 30
$retry = 0
$dbReady = $false

while ($retry -lt $maxRetries -and -not $dbReady) {
    try {
        docker-compose exec -T db pg_isready -U postgres 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
        } else {
            Start-Sleep -Seconds 2
            $retry++
        }
    } catch {
        Start-Sleep -Seconds 2
        $retry++
    }
}

if ($dbReady) {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ❌ TIMEOUT" -ForegroundColor Red
    Write-Host "    PostgreSQL n'a pas démarré dans le délai imparti" -ForegroundColor Red
    exit 1
}

# Vérifier si la base est déjà initialisée
Write-Host "  → Vérification de l'état de la base..." -NoNewline
$checkTables = docker-compose exec -T db psql -U postgres -d freefire_mvp -c "\dt" 2>&1
if ($checkTables -match "users" -and $checkTables -match "catalog") {
    Write-Host " ✅ Déjà initialisée" -ForegroundColor Green
} else {
    Write-Host " ⚠️ Non initialisée" -ForegroundColor Yellow
    
    # Exécuter les migrations
    Write-Host "  → Application des migrations SQL..." -ForegroundColor Cyan
    
    $migrations = @(
        "001_init.sql",
        "002_entry_fees.sql",
        "003_tournaments.sql",
        "004_users.sql",
        "005_auth_tokens.sql",
        "006_catalog.sql"
    )
    
    foreach ($migration in $migrations) {
        Write-Host "    • $migration" -NoNewline
        docker-compose exec -T db psql -U postgres -d freefire_mvp -f "/docker-entrypoint-initdb.d/migrations/$migration" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌" -ForegroundColor Red
        }
    }
    
    # Insérer les données d'exemple
    Write-Host "  → Insertion des données d'exemple..." -ForegroundColor Cyan
    
    Write-Host "    • 001_entry_fees.sql" -NoNewline
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f "/docker-entrypoint-initdb.d/seeds/001_entry_fees.sql" 2>&1 | Out-Null
    Write-Host " ✅" -ForegroundColor Green
    
    Write-Host "    • 002_catalog.sql" -NoNewline
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f "/docker-entrypoint-initdb.d/seeds/002_catalog.sql" 2>&1 | Out-Null
    Write-Host " ✅" -ForegroundColor Green
}

# =============================================================================
# ÉTAPE 4: Vérification de l'API
# =============================================================================

Write-Host "`n[4/5] 🔥 Vérification de l'API Backend..." -ForegroundColor Yellow

Write-Host "  → Test de l'endpoint /health..." -NoNewline
$maxRetries = 20
$retry = 0
$apiReady = $false

while ($retry -lt $maxRetries -and -not $apiReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2 2>$null
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
        } else {
            Start-Sleep -Seconds 2
            $retry++
        }
    } catch {
        Start-Sleep -Seconds 2
        $retry++
    }
}

if ($apiReady) {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ❌ TIMEOUT" -ForegroundColor Red
    Write-Host "    L'API n'a pas répondu dans le délai imparti" -ForegroundColor Red
    Write-Host "    Vous pouvez vérifier les logs avec: docker-compose logs api" -ForegroundColor Yellow
}

# =============================================================================
# ÉTAPE 5: Démarrage du Frontend
# =============================================================================

Write-Host "`n[5/5] 🎨 Préparation du Frontend..." -ForegroundColor Yellow

# Vérifier si node_modules existe
if (Test-Path "frontend/node_modules") {
    Write-Host "  → Dépendances déjà installées" -ForegroundColor Green
} else {
    Write-Host "  → Installation des dépendances (première fois, ~2-3 minutes)..." -ForegroundColor Cyan
    Push-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ❌ Échec de l'installation des dépendances" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "    ✅ Dépendances installées" -ForegroundColor Green
}

Write-Host "  → Démarrage du serveur de développement..." -ForegroundColor Cyan

# =============================================================================
# RÉSUMÉ FINAL
# =============================================================================

Write-Host @"

╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                   ✅  LANCEMENT RÉUSSI  ✅                       ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

🌐  Services disponibles:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   🎮  Application Frontend    → http://localhost:3000
   🔥  API Backend             → http://localhost:8080
   📚  Documentation API       → http://localhost:8080/docs
   💾  Base de données         → http://localhost:8081
   📁  Stockage MinIO          → http://localhost:9001
   📧  Emails (MailHog)        → http://localhost:8025

📋  Prochaines étapes:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   1. Le frontend va se lancer dans une nouvelle fenêtre
   2. Ouvrir http://localhost:3000 dans ton navigateur
   3. Créer un compte utilisateur sur /register
   4. Explorer les tournois et le catalogue
   
🛑  Pour arrêter les services:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   docker-compose down
   Ctrl+C dans le terminal du frontend

🔥  Bon développement !

"@ -ForegroundColor Green

# Lancer le frontend dans une nouvelle fenêtre PowerShell
Write-Host "Lancement du frontend dans une nouvelle fenêtre..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host "`nAppuyez sur Entrée pour ouvrir le navigateur..." -ForegroundColor Yellow
Read-Host

# Ouvrir les pages dans le navigateur
Start-Process "http://localhost:3000"
Start-Process "http://localhost:8080/docs"

Write-Host "✅ Script terminé avec succès !" -ForegroundColor Green
