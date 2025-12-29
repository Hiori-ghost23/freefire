# 🔧 Corrections pour le Déploiement

## Problèmes Résolus

### 1. ✅ Dépendance PyJWT manquante (Backend)
**Erreur**: `ModuleNotFoundError: No module named 'jwt'`

**Cause**: Le code utilise `import jwt` mais `PyJWT` n'était pas dans `requirements.txt`

**Solution**: Ajout de `PyJWT==2.8.0` dans `api/requirements.txt`

---

### 2. ✅ Import AuthToken inexistant (Backend)
**Erreur**: `ImportError: cannot import name 'AuthToken' from 'app.models'`

**Cause**: Le fichier `auth_service.py` importait un modèle `AuthToken` qui n'existe pas. Le projet utilise `EmailVerification` et `PasswordReset` à la place.

**Fichiers corrigés**:
- `api/app/services/auth_service.py`
  - Import corrigé: `from app.models import User, UserProfile, EmailVerification, PasswordReset`
  - Fonction `create_email_verification_token()` utilise maintenant `EmailVerification`
  - Fonction `verify_email_token()` utilise maintenant `EmailVerification`
  - Fonction `create_password_reset_token()` utilise maintenant `PasswordReset`
  - Fonction `reset_password()` utilise maintenant `PasswordReset`

---

### 3. ✅ Champs User inexistants (Backend)
**Erreur**: Références à des champs qui n'existent pas dans le modèle `User`

**Cause**: Le modèle `User` ne contient que les champs d'authentification. Les informations de profil sont dans `UserProfile`.

**Fichiers corrigés**:
- `api/app/routers/auth.py`
  - Import ajouté: `UserProfile`
  - Fonction `register()`: Utilise `email_verified_at is not None`
  - Fonction `login()`: Utilise `email_verified_at is not None`
  - Fonction `get_profile()`: Récupère le profil depuis `UserProfile`

- `api/app/routers/admin.py`
  - Import ajouté: `UserProfile`
  - Fonction `list_users()`: Récupère les profils pour chaque utilisateur

- `api/app/services/auth_service.py`
  - Fonction `create_user()`: Crée séparément `User` et `UserProfile`
  - Fonction `verify_email_token()`: Utilise `email_verified_at` au lieu de `email_verified`

---

### 4. ✅ Classe Tailwind CSS inexistante (Frontend)
**Erreur**: `The 'border-border' class does not exist`

**Cause**: Le fichier `globals.css` utilisait `@apply border-border` mais la couleur `border` n'était pas définie dans le thème Tailwind.

**Solution**: Remplacé `border-border` par `border-white/10` dans `frontend/src/app/globals.css`

---

### 5. ✅ Import lucide-react invalide (Frontend)
**Erreur**: `'SquarePen' is not exported from 'lucide-react'`

**Cause**: L'icône `SquarePen` n'existe pas dans lucide-react (version utilisée).

**Solution**: Remplacé toutes les occurrences de `SquarePen` par `Edit2` dans `frontend/src/app/tournaments/my/page.tsx`

---

## Structure des Modèles

### User (Authentification)
```python
- id: UUID
- email: String
- password_hash: String
- role: String (user|organizer|admin)
- email_verified_at: DateTime (nullable)
- created_at: DateTime
- updated_at: DateTime
```

### UserProfile (Informations)
```python
- user_id: UUID (FK vers User)
- display_name: String
- uid_freefire: String
- phone_msisdn: String
- country_code: String
- created_at: DateTime
- updated_at: DateTime
```

---

## Prochaines Étapes

1. **Commit les changements**:
   ```bash
   git add .
   git commit -m "fix: resolve deployment errors (PyJWT, AuthToken, User fields)"
   git push
   ```

2. **Redéployer sur Railway/Render**:
   - Le push déclenchera automatiquement un nouveau déploiement
   - Vérifier les logs pour confirmer que l'API démarre correctement

3. **Tester l'API**:
   ```bash
   curl https://votre-api.up.railway.app/health
   curl https://votre-api.up.railway.app/catalog
   ```

4. **Déployer le Frontend sur Vercel**:
   - Suivre les instructions dans `VERCEL_DEPLOYMENT.md`
   - Configurer `NEXT_PUBLIC_API_BASE_URL` avec l'URL de l'API

---

## Vérification Locale (Optionnel)

Si vous voulez tester localement avant de déployer:

```bash
# Installer les dépendances
cd api
pip install -r requirements.txt

# Démarrer l'API
uvicorn app.main:app --reload --port 8080

# Dans un autre terminal, tester
curl http://localhost:8080/health
```

---

## Support

Si vous rencontrez d'autres erreurs, vérifiez:
1. Les logs de déploiement sur Railway/Render
2. Que toutes les variables d'environnement sont configurées
3. Que la base de données est accessible depuis l'API
