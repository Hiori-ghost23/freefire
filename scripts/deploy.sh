#!/bin/bash
# =================================================================
# Script de déploiement FreeFire MVP
# Usage: ./scripts/deploy.sh [dev|prod]
# =================================================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    log_info "✓ Prérequis OK"
}

# Déploiement en développement
deploy_dev() {
    log_info "Déploiement en mode DÉVELOPPEMENT..."
    
    # Arrêter les conteneurs existants
    docker-compose down
    
    # Construire et démarrer
    docker-compose up -d --build
    
    # Attendre que la DB soit prête
    log_info "Attente de la base de données..."
    sleep 10
    
    # Appliquer les migrations
    log_info "Application des migrations..."
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/001_init.sql 2>/dev/null || true
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/002_entry_fees.sql 2>/dev/null || true
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/003_tournaments.sql 2>/dev/null || true
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/004_users.sql 2>/dev/null || true
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/005_auth_tokens.sql 2>/dev/null || true
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/migrations/006_catalog.sql 2>/dev/null || true
    
    # Appliquer les seeds
    log_info "Application des seeds..."
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/001_entry_fees.sql 2>/dev/null || true
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/002_catalog.sql 2>/dev/null || true
    docker-compose exec -T db psql -U postgres -d freefire_mvp -f /docker-entrypoint-initdb.d/seeds/003_demo_user.sql 2>/dev/null || true
    
    log_info "✓ Déploiement DEV terminé!"
    log_info ""
    log_info "Services disponibles:"
    log_info "  - API: http://localhost:8080"
    log_info "  - API Docs: http://localhost:8080/docs"
    log_info "  - Adminer: http://localhost:8081"
    log_info "  - MinIO: http://localhost:9001"
    log_info "  - MailHog: http://localhost:8025"
    log_info ""
    log_info "Pour le frontend, exécutez:"
    log_info "  cd frontend && npm install && npm run dev"
}

# Déploiement en production
deploy_prod() {
    log_info "Déploiement en mode PRODUCTION..."
    
    # Vérifier les fichiers de configuration
    if [ ! -f "api/.env.production" ]; then
        log_error "Fichier api/.env.production manquant"
        exit 1
    fi
    
    if [ ! -f "frontend/.env.production" ]; then
        log_error "Fichier frontend/.env.production manquant"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        log_error "Fichier .env manquant (DB_USER, DB_PASSWORD, etc.)"
        exit 1
    fi
    
    # Arrêter les conteneurs existants
    docker-compose -f docker-compose.prod.yml down
    
    # Construire et démarrer
    docker-compose -f docker-compose.prod.yml up -d --build
    
    log_info "✓ Déploiement PROD terminé!"
    log_info ""
    log_info "Vérifiez les logs avec:"
    log_info "  docker-compose -f docker-compose.prod.yml logs -f"
}

# Main
main() {
    local env=${1:-dev}
    
    echo "=========================================="
    echo "  FreeFire MVP - Déploiement"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    
    case $env in
        dev|development)
            deploy_dev
            ;;
        prod|production)
            deploy_prod
            ;;
        *)
            log_error "Environnement inconnu: $env"
            echo "Usage: $0 [dev|prod]"
            exit 1
            ;;
    esac
}

main "$@"
