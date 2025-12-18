# FreeFire MVP Frontend

Interface utilisateur moderne pour la plateforme FreeFire MVP développée avec Next.js 14, TypeScript et TailwindCSS.

## 🚀 Démarrage rapide

### Prérequis
- Node.js v18+ 
- NPM ou Yarn
- Backend API FreeFire MVP en fonctionnement (http://localhost:8080)

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

### Scripts disponibles

```bash
npm run dev          # Mode développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification ESLint
npm run type-check   # Vérification TypeScript
```

## 🏗️ Architecture

```
src/
├── app/                    # App Router Next.js 14
│   ├── (auth)/
│   │   └── login/         # Page de connexion
│   ├── dashboard/         # Tableau de bord
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx          # Page d'accueil
│   └── providers.tsx     # Providers React
├── components/
│   └── ui/               # Composants UI réutilisables
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── toast.tsx
├── lib/
│   ├── api/              # Services API
│   │   ├── client.ts     # Client Axios
│   │   └── services.ts   # Services métier
│   ├── hooks/            # Hooks React Query
│   ├── utils/            # Utilitaires
│   └── validations/      # Schémas Zod
├── types/                # Types TypeScript
└── ...
```

## 🎨 Design System

### Couleurs
- **Primary:** `#6366F1` (Indigo-500)
- **Background:** `#0A0A0A` (Neutral-950)
- **Cards:** `#FFFFFF/5%` avec backdrop blur
- **Error:** `#EF4444`
- **Success:** `#10B981`

### Composants
- **Button:** 4 variants (default, secondary, outline, ghost)
- **Input:** Champs avec validation et states d'erreur
- **Toast:** Système de notifications
- **Card:** Conteneurs avec effet glassmorphism

## 🔐 Authentification

### Fonctionnalités
- ✅ Connexion avec email/password
- ✅ Validation des formulaires (Zod)
- ✅ Gestion JWT avec localStorage
- ✅ Redirection automatique
- ✅ Toast notifications
- ✅ États de chargement

### Identifiants de démonstration
```
Email: demo@freefire.com
Mot de passe: demo123
```

## 🌐 API Integration

### Services disponibles
- `authService`: Authentification (login, register, logout)
- `catalogService`: Catalogue produits
- `tournamentsService`: Gestion des tournois

### Hooks React Query
- `useLogin()`: Hook de connexion
- `useLogout()`: Hook de déconnexion
- `useProfile()`: Profil utilisateur
- `useCatalog()`: Liste des produits
- `useTournaments()`: Liste des tournois

### Configuration
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=10000
```

## 📱 Fonctionnalités

### Page de connexion
- Design fidèle à la maquette
- Validation en temps réel
- Affichage/masquage du mot de passe
- Messages d'erreur contextuels
- Animation de chargement
- Responsive design

### Page d'inscription
- Formulaire complet avec validation avancée
- Validation mot de passe temps réel (8+ car, maj/min, chiffre)
- Sélection pays avec indicatif téléphonique automatique
- Validation UID FreeFire (8-12 chiffres)
- Conditions d'utilisation intégrées
- Design cohérent avec la maquette fournie

### Dashboard (exemple)
- Interface simple post-connexion
- Bouton de déconnexion
- Cartes de fonctionnalités
- Messages de félicitations

## 🛠️ Technologies utilisées

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** React Query + Zustand
- **Forms:** React Hook Form + Zod
- **UI Components:** Radix UI + Lucide Icons
- **HTTP Client:** Axios

## 🚀 Prochaines étapes

1. **Ajouter d'autres pages**
   - Page d'inscription
   - Catalogue produits
   - Détails tournois
   - Interface admin

2. **Améliorer l'UX**
   - Navigation principale
   - Menu utilisateur
   - Breadcrumbs
   - Loading skeletons

3. **Tests**
   - Tests unitaires (Jest)
   - Tests d'intégration
   - Tests e2e (Playwright)

4. **Optimisations**
   - Code splitting
   - Image optimization
   - Bundle analysis

## 🤝 Développement

### Convention de code
- **Composants:** PascalCase
- **Hooks:** camelCase avec prefix "use"
- **Types:** PascalCase
- **Constants:** UPPER_SNAKE_CASE

### Structure des composants
```typescript
// 1. Imports (React, libs, components, utils, types)
// 2. Interfaces/Types
// 3. Composant principal
// 4. Hooks et state
// 5. Effects et handlers
// 6. Early returns
// 7. Render
```

## 📞 Support

En cas de problème :
1. Vérifiez que le backend est démarré
2. Consultez la console pour les erreurs
3. Vérifiez les variables d'environnement
4. Référez-vous à la documentation API

---

**🔥 Prêt à développer une interface moderne pour FreeFire MVP !**
