# =================================================================
# Script de déploiement FreeFire MVP (Windows PowerShell)
# Usage: .\scripts\deploy.ps1 [-Env dev|prod]
# =================================================================

param(
    [Parameter()]
    [ValidateSet("dev", "prod", "development", "production")]
    [string]$Env = "dev"
)

$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Info "Vérification des prérequis..."
    
    try {
        docker --version | Out-Null
    } catch {
        Write-Err "Docker n'est pas installé"
        exit 1
    }
    
    try {
        docker-compose --version | Out-Null
    } catch {
        Write-Err "Docker Compose n'est pas installé"
        exit 1
    }
    
    Write-Info "✓ Prérequis OK"
}

function Deploy-Dev {
    Write-Info "Déploiement en mode DÉVELOPPEMENT..."
    
    # Arrêter les conteneurs existants
    docker-compose down
    
    # Construire et démarrer
    docker-compose up -d --build
    
    # Attendre que la DB soit prête
    Write-Info "Attente de la base de données..."
    Start-Sleep -Seconds 10
    
    # Appliquer les migrations
    Write-Info "Application des migrations..."
    $migrations = @(
        "001_init.sql",
        "002_entry_fees.sql",
        "003_tournaments.sql",
        "004_users.sql",
        "005_auth_tokens.sql",
        "006_catalog.sql"
    )
    
    foreach ($migration in $migrations) {
        docker-compose exec -T db psql -U postgres -d freefire_mvp -f "/docker-entrypoint-initdb.d/migrations/$migration" 2>$null
    }
    
    # Appliquer les seeds
    Write-Info "Application des seeds..."
    $seeds = @(
        "001_entry_fees.sql",
        "002_catalog.sql",
        "003_demo_user.sql"
    )
    
    foreach ($seed in $seeds) {
        docker-compose exec -T db psql -U postgres -d freefire_mvp -f "/docker-entrypoint-initdb.d/seeds/$seed" 2>$null
    }
    
    Write-Info "✓ Déploiement DEV terminé!"
    Write-Host ""
    Write-Info "Services disponibles:"
    Write-Host "  - API: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  - API Docs: http://localhost:8080/docs" -ForegroundColor Cyan
    Write-Host "  - Adminer: http://localhost:8081" -ForegroundColor Cyan
    Write-Host "  - MinIO: http://localhost:9001" -ForegroundColor Cyan
    Write-Host "  - MailHog: http://localhost:8025" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "Pour le frontend, exécutez:"
    Write-Host "  cd frontend; npm install; npm run dev" -ForegroundColor Cyan
}

function Deploy-Prod {
    Write-Info "Déploiement en mode PRODUCTION..."
    
    # Vérifier les fichiers de configuration
    if (-not (Test-Path "api/.env.production")) {
        Write-Err "Fichier api/.env.production manquant"
        exit 1
    }
    
    if (-not (Test-Path "frontend/.env.production")) {
        Write-Err "Fichier frontend/.env.production manquant"
        exit 1
    }
    
    if (-not (Test-Path ".env")) {
        Write-Err "Fichier .env manquant (DB_USER, DB_PASSWORD, etc.)"
        exit 1
    }
    
    # Arrêter les conteneurs existants
    docker-compose -f docker-compose.prod.yml down
    
    # Construire et démarrer
    docker-compose -f docker-compose.prod.yml up -d --build
    
    Write-Info "✓ Déploiement PROD terminé!"
    Write-Host ""
    Write-Info "Vérifiez les logs avec:"
    Write-Host "  docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Cyan
}

# Main
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "  FreeFire MVP - Déploiement" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

Test-Prerequisites

switch ($Env) {
    { $_ -in "dev", "development" } {
        Deploy-Dev
    }
    { $_ -in "prod", "production" } {
        Deploy-Prod
    }
}
