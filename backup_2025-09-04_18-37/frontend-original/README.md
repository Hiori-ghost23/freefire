# 🔥 Frontend FreeFire MVP - Guide Équipe

**Version :** 1.0.0  
**Stack :** Next.js 14 + TypeScript + TailwindCSS + React Query  
**Backend API :** http://localhost:8080

---

## 🚀 Démarrage rapide

### 1. Prérequis
- **Node.js** v18+ installé
- **Backend FreeFire MVP** en fonctionnement (voir README principal)
- **Terminal** avec accès PowerShell/Bash

### 2. Installation en 5 minutes
```bash
# 1. Depuis le dossier FreeFire_MVP_Final/
npx create-next-app@latest freefire-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd freefire-frontend

# 2. Installer les dépendances
npm install @tanstack/react-query @tanstack/react-query-devtools axios react-hook-form @hookform/resolvers zod @radix-ui/react-toast @radix-ui/react-dialog @radix-ui/react-dropdown-menu lucide-react class-variance-authority clsx tailwind-merge date-fns

# 3. Démarrer le backend (autre terminal)
cd ../
docker-compose up -d

# 4. Lancer le frontend
npm run dev
```

### 3. Accès
- **Frontend :** http://localhost:3000
- **API Backend :** http://localhost:8080
- **API Docs :** http://localhost:8080/docs

---

## 📁 Structure du projet

```
freefire-frontend/
├── src/
│   ├── app/                    # App Router Next.js 14
│   │   ├── (auth)/            # 🔐 Pages d'authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/            # 🛍️ E-commerce
│   │   │   ├── catalog/       # Catalogue produits
│   │   │   ├── checkout/      # Processus de paiement
│   │   │   └── orders/        # Historique commandes
│   │   ├── (tournaments)/     # 🏆 Tournois
│   │   │   ├── tournaments/   # Liste des tournois
│   │   │   ├── create/        # Création tournoi
│   │   │   └── [id]/         # Détail tournoi
│   │   ├── admin/             # 👨‍💼 Interface admin
│   │   ├── profile/           # 👤 Profil utilisateur
│   │   ├── layout.tsx         # Layout global
│   │   ├── page.tsx           # Page d'accueil
│   │   └── providers.tsx      # Providers React
│   ├── components/
│   │   ├── ui/               # 🎨 Composants de base
│   │   ├── features/         # 🔧 Composants métier
│   │   ├── forms/           # 📝 Formulaires
│   │   └── layouts/         # 📐 Layouts
│   ├── lib/
│   │   ├── api/             # 🌐 Services API
│   │   ├── hooks/           # 🪝 Hooks personnalisés
│   │   ├── utils/           # 🛠️ Utilitaires
│   │   └── validations/     # ✅ Schémas validation
│   └── types/               # 📝 Types TypeScript
└── public/                  # 📷 Assets statiques
```

---

## 🎯 Fonctionnalités à implémenter

### ✅ **Déjà fourni dans les guides :**
- [x] Configuration complète Next.js + TypeScript
- [x] Services API avec authentification JWT
- [x] Hooks React Query personnalisés
- [x] Composants UI avec thème FreeFire
- [x] Exemples de pages (login, catalog, tournaments)
- [x] Gestion d'erreurs centralisée
- [x] Types TypeScript complets

### 🔧 **À développer par l'équipe :**

#### **Phase 1 - Core (Semaine 1-2)**
- [ ] **Authentification complète**
  - Page login (exemple fourni)
  - Page register avec validation
  - Reset mot de passe
  - Vérification email
  
- [ ] **Navigation principale**
  - Header avec menu utilisateur
  - Navigation mobile responsive
  - Footer avec liens utiles
  
- [ ] **Page d'accueil**
  - Hero section avec animations
  - Statistiques en temps réel
  - Témoignages utilisateurs

#### **Phase 2 - E-commerce (Semaine 3-4)**
- [ ] **Catalogue avancé**
  - Recherche de produits
  - Filtres avancés (prix, type)
  - Pagination/infinite scroll
  
- [ ] **Processus de commande**
  - Panier d'achats
  - Page checkout complète
  - Confirmation de commande
  
- [ ] **Paiements**
  - Sélection méthode de paiement
  - Instructions de paiement détaillées
  - Upload de preuves (exemple fourni)

#### **Phase 3 - Tournois (Semaine 5-6)**
- [ ] **Gestion des tournois**
  - Création de tournoi avec formulaire complet
  - Inscription aux tournois
  - Interface organisateur
  
- [ ] **Suivi des tournois**
  - Tableau de bord joueur
  - Historique des participations
  - Classements et résultats

#### **Phase 4 - Administration (Semaine 7-8)**
- [ ] **Dashboard admin**
  - Statistiques globales
  - Gestion des utilisateurs
  - Modération des tournois
  
- [ ] **Interface de gestion**
  - CRUD produits catalogue
  - Gestion des paiements
  - Support client

---

## 🛠️ Technologies et outils

### **Stack technique**
```json
{
  "framework": "Next.js 14",
  "language": "TypeScript",
  "styling": "TailwindCSS",
  "state": "React Query + Zustand",
  "forms": "React Hook Form + Zod",
  "ui": "Radix UI + Lucide Icons",
  "deployment": "Vercel/Netlify"
}
```

### **Dépendances principales**
```json
{
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@radix-ui/react-*": "^1.0.0",
  "lucide-react": "^0.292.0",
  "tailwindcss": "^3.3.0"
}
```

---

## 🎨 Design System FreeFire

### **Couleurs**
```css
/* Palette principale */
--ff-primary: #FF6B35;      /* Orange FreeFire */
--ff-secondary: #000000;    /* Noir */
--ff-accent: #FFD700;       /* Or diamants */
--ff-success: #00C851;      /* Vert succès */
--ff-error: #FF3547;        /* Rouge erreur */
--ff-bg: #0A0A0A;          /* Arrière-plan */
--ff-card: #1A1A1A;        /* Cartes */
```

### **Typography**
```css
/* Police gaming pour titres */
font-family: 'Orbitron', monospace;

/* Tailles */
text-7xl: 72px    /* Hero titles */
text-4xl: 36px    /* Page titles */  
text-xl: 20px     /* Section titles */
text-base: 16px   /* Body text */
text-sm: 14px     /* Small text */
```

### **Composants de base**
- **Buttons :** 3 variants (default, secondary, outline)
- **Cards :** Arrière-plan sombre avec bordures lumineuses
- **Forms :** Champs avec focus states orange
- **Modals :** Overlays avec animations
- **Toast :** Notifications système

---

## 🌐 Intégration API

### **Configuration de base**
```typescript
// .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=10000
```

### **Services disponibles**
```typescript
// Tous les services sont documentés dans API_INTEGRATION_GUIDE.md
import {
  authService,      // Login, register, logout
  catalogService,   // Produits FreeFire
  ordersService,    // Commandes utilisateur
  paymentsService,  // Paiements et preuves
  tournamentsService // Tournois et inscriptions
} from '@/lib/api/services';
```

### **Hooks React Query**
```typescript
// Hooks prêts à utiliser
import {
  useLogin, useRegister,      // Authentification
  useCatalog, useCatalogItem, // Produits
  useCreateOrder, useMyOrders,// Commandes
  useTournaments, useCreateTournament // Tournois
} from '@/lib/hooks/api-hooks';
```

---

## 🧪 Tests et qualité

### **Configuration ESLint/Prettier**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### **Tests recommandés**
```bash
# Installation outils de test
npm install -D jest @testing-library/react @testing-library/jest-dom

# Structure tests
src/
├── __tests__/           # Tests unitaires
├── components/
│   └── __tests__/      # Tests composants
└── lib/
    └── __tests__/      # Tests utilitaires
```

---

## 🚀 Déploiement

### **Build local**
```bash
npm run build        # Build de production
npm run start        # Serveur local
npm run type-check   # Vérification TypeScript
```

### **Déploiement Vercel**
```bash
# Installation CLI
npm i -g vercel

# Déploiement
vercel --prod
```

### **Variables d'environnement production**
```env
NEXT_PUBLIC_API_BASE_URL=https://votre-api.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GOOGLE_ANALYTICS=your-ga-id
```

---

## 📝 Convention de code

### **Nommage**
```typescript
// Composants: PascalCase
export function ProductCard() {}

// Hooks: camelCase avec prefix "use"
export function useProductData() {}

// Types: PascalCase avec suffix approprié  
interface User {}
type ProductType = string;

// Constants: UPPER_SNAKE_CASE
const API_ENDPOINTS = {};
```

### **Structure des composants**
```typescript
// Template de composant
interface Props {
  // Props typées
}

export function ComponentName({ prop }: Props) {
  // 1. Hooks
  // 2. State local
  // 3. Effects
  // 4. Handlers
  // 5. Early returns
  // 6. Render
}
```

### **Organisation des imports**
```typescript
// 1. React et Next.js
import React from 'react';
import { useState } from 'react';

// 2. Librairies externes
import axios from 'axios';

// 3. Composants internes
import { Button } from '@/components/ui/button';

// 4. Hooks et utilitaires
import { useLogin } from '@/lib/hooks/api-hooks';

// 5. Types
import type { User } from '@/types/api';
```

---

## 🆘 Support et ressources

### **Documentation**
- **API Integration :** `API_INTEGRATION_GUIDE.md`
- **Setup Frontend :** `FRONTEND_SETUP_GUIDE.md` 
- **Exemples Composants :** `COMPONENTS_EXAMPLES.md`
- **Next.js Docs :** https://nextjs.org/docs

### **Outils de développement**
- **VS Code Extensions :**
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux snippets
  - Auto Rename Tag

### **Debugging**
```bash
# Logs détaillés
npm run dev -- --debug

# Analyse du bundle
npm run build -- --analyze

# Tests de performance
npm run lighthouse
```

---

## 🎉 Checklist finale

Avant de livrer une fonctionnalité :

- [ ] **Code ✅**
  - [ ] Types TypeScript corrects
  - [ ] Composants testés manuellement
  - [ ] Pas d'erreurs ESLint
  - [ ] Performance optimisée

- [ ] **UX/UI ✅**
  - [ ] Responsive (mobile/desktop)
  - [ ] Loading states implémentés
  - [ ] Messages d'erreur clairs
  - [ ] Thème FreeFire respecté

- [ ] **Fonctionnel ✅**
  - [ ] API intégrée correctement
  - [ ] Gestion d'erreurs robuste
  - [ ] États de chargement
  - [ ] Navigation intuitive

---

## 🔥 Vous êtes prêts !

Avec cette documentation complète, votre équipe a tout ce qu'il faut pour développer un frontend moderne et professionnel pour FreeFire MVP !

### **Next steps :**
1. **Suivre le FRONTEND_SETUP_GUIDE.md** pour initialiser le projet
2. **Utiliser les exemples** dans COMPONENTS_EXAMPLES.md
3. **Intégrer l'API** avec API_INTEGRATION_GUIDE.md
4. **Commencer par la Phase 1** (authentification + navigation)

**Let's build something amazing! 🚀**
