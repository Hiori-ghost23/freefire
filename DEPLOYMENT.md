# 🚀 Guide de Déploiement - FreeFire MVP

## 📋 Prérequis

### Serveur
- **OS**: Ubuntu 20.04+ ou Debian 11+
- **RAM**: Minimum 2GB (4GB recommandé)
- **CPU**: 2 vCPUs minimum
- **Stockage**: 20GB minimum
- **Ports ouverts**: 80, 443

### Logiciels requis
```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

---

## 🔧 Configuration

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/freefire-mvp.git
cd freefire-mvp
```

### 2. Configurer les variables d'environnement

#### Backend (api/.env.production)
```bash
cp api/.env api/.env.production
nano api/.env.production
```

**Variables importantes à modifier:**
```env
# Base de données
DATABASE_URL=postgresql://freefire_user:STRONG_PASSWORD@db:5432/freefire_mvp

# Sécurité (GÉNÉRER DES CLÉS UNIQUES!)
JWT_SECRET=votre-cle-jwt-super-secrete-min-32-caracteres
PAYMENTS_HMAC_SECRET=votre-cle-hmac-secrete
ADMIN_TOKEN=votre-token-admin-secret

# Email SMTP
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre-user
SMTP_PASSWORD=votre-password
SMTP_FROM=noreply@votre-domaine.com

# Monitoring (optionnel)
SENTRY_DSN=https://votre-sentry-dsn
```

#### Frontend (frontend/.env.production)
```bash
nano frontend/.env.production
```

```env
NEXT_PUBLIC_API_BASE_URL=https://votre-domaine.com/api
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### 3. Configurer Nginx
```bash
nano nginx/nginx.conf
```
Remplacer `votre-domaine.com` par votre vrai domaine.

### 4. Créer le fichier .env pour Docker Compose
```bash
cat > .env << EOF
DB_USER=freefire_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_DB_FORT
MINIO_USER=minio_admin
MINIO_PASSWORD=VOTRE_MOT_DE_PASSE_MINIO_FORT
EOF
```

---

## 🔐 Certificat SSL (Let's Encrypt)

### Première installation
```bash
# Créer les dossiers
mkdir -p nginx/ssl nginx/certbot

# Démarrer nginx temporairement sans SSL
docker-compose -f docker-compose.prod.yml up -d nginx

# Obtenir le certificat
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d votre-domaine.com \
  -d www.votre-domaine.com \
  --email votre@email.com \
  --agree-tos \
  --no-eff-email

# Redémarrer nginx avec SSL
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 🚀 Déploiement

### Démarrer tous les services
```bash
# Build et démarrage
docker-compose -f docker-compose.prod.yml up -d --build

# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Initialiser la base de données
```bash
# Appliquer les migrations
docker-compose -f docker-compose.prod.yml exec db psql -U freefire_user -d freefire_mvp << 'EOF'
\i /docker-entrypoint-initdb.d/migrations/001_init.sql
\i /docker-entrypoint-initdb.d/migrations/002_entry_fees.sql
\i /docker-entrypoint-initdb.d/migrations/003_tournaments.sql
\i /docker-entrypoint-initdb.d/migrations/004_users.sql
\i /docker-entrypoint-initdb.d/migrations/005_auth_tokens.sql
\i /docker-entrypoint-initdb.d/migrations/006_catalog.sql
\i /docker-entrypoint-initdb.d/seeds/001_entry_fees.sql
\i /docker-entrypoint-initdb.d/seeds/002_catalog.sql
EOF
```

### Vérifier le déploiement
```bash
# Test API
curl https://votre-domaine.com/api/health

# Test Frontend
curl https://votre-domaine.com
```

---

## 📊 Monitoring et Maintenance

### Voir les logs
```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Service spécifique
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Redémarrer un service
```bash
docker-compose -f docker-compose.prod.yml restart api
docker-compose -f docker-compose.prod.yml restart frontend
```

### Mise à jour
```bash
# Pull les dernières modifications
git pull origin main

# Rebuild et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup de la base de données
```bash
# Créer un backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U freefire_user freefire_mvp > backup_$(date +%Y%m%d).sql

# Restaurer un backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U freefire_user freefire_mvp < backup_20241218.sql
```

---

## 🔒 Sécurité

### Checklist de sécurité
- [ ] Changer tous les mots de passe par défaut
- [ ] Générer des clés JWT et HMAC uniques
- [ ] Configurer le firewall (UFW)
- [ ] Activer fail2ban
- [ ] Configurer les backups automatiques
- [ ] Activer le monitoring (Sentry, etc.)

### Configuration Firewall
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 🆘 Dépannage

### L'API ne répond pas
```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs api

# Redémarrer
docker-compose -f docker-compose.prod.yml restart api
```

### Erreur de connexion à la base de données
```bash
# Vérifier que la DB est up
docker-compose -f docker-compose.prod.yml ps db

# Tester la connexion
docker-compose -f docker-compose.prod.yml exec db psql -U freefire_user -d freefire_mvp -c "SELECT 1"
```

### Certificat SSL expiré
```bash
# Renouveler manuellement
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📞 Support

- **Email**: support@votre-domaine.com
- **WhatsApp**: +229 01 51 10 45

---

*Dernière mise à jour: Décembre 2024*
