# =================================================================
# Dockerfile pour l'API FreeFire MVP
# Image basée sur Python 3.11 officielle
# =================================================================

FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

# Exposer le port de l'API (Render utilise une variable PORT dynamique)
EXPOSE 8080

# Commande par défaut pour démarrer l'application
# Utiliser la variable PORT de Render ou 8080 par défaut
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
