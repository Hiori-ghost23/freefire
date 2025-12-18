# 📁 NOUVELLE STRUCTURE FRONTEND - FreeFire MVP

## 🎯 Structure Consolidée Recommandée

```
FreeFire_MVP_Final/
├── 📁 frontend/                          # 🔥 FRONTEND PRINCIPAL UNIFIÉ
│   ├── 📁 src/                          
│   │   ├── 📁 app/                      # 🚀 Pages Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx       # ✅ Page de connexion
│   │   │   │   └── register/page.tsx    # ✅ Page d'inscription
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # ✅ Dashboard utilisateur
│   │   │   ├── tournaments/
│   │   │   │   ├── page.tsx            # ✅ Liste des tournois
│   │   │   │   ├── create/page.tsx     # ✅ Création tournoi (migré)
│   │   │   │   ├── my/page.tsx         # ✅ Mes tournois (migré)
│   │   │   │   └── [id]/page.tsx       # ✅ Détail tournoi (migré)
│   │   │   ├── catalog/
│   │   │   │   ├── page.tsx            # 🚧 Liste produits
│   │   │   │   └── [id]/page.tsx       # 🚧 Détail produit
│   │   │   ├── cart/
│   │   │   │   └── page.tsx            # ✅ Panier (hooks existants)
│   │   │   ├── payments/
│   │   │   │   └── page.tsx            # 🚧 Interface paiements
│   │   │   ├── profile/
│   │   │   │   └── page.tsx            # 🚧 Profil utilisateur
│   │   │   ├── admin/
│   │   │   │   └── page.tsx            # 🚧 Backoffice admin
│   │   │   ├── layout.tsx              # ✅ Layout principal
│   │   │   └── page.tsx                # ✅ Page d'accueil
│   │   ├── 📁 components/               # 🧩 Composants réutilisables
│   │   │   ├── ui/                     # ✅ Composants UI de base
│   │   │   │   ├── button.tsx          # ✅ Composant bouton
│   │   │   │   ├── input.tsx           # ✅ Composant input
│   │   │   │   ├── toast.tsx           # ✅ Système de notifications
│   │   │   │   ├── label.tsx           # ✅ Labels de formulaire
│   │   │   │   └── select.tsx          # ✅ Sélecteurs
│   │   │   ├── layout/                 # 🚧 Composants de layout
│   │   │   │   ├── Header.tsx          
│   │   │   │   ├── Sidebar.tsx         
│   │   │   │   └── Footer.tsx          
│   │   │   ├── tournaments/            # ✅ Composants tournois
│   │   │   │   ├── TournamentCard.tsx  
│   │   │   │   ├── TournamentForm.tsx  
│   │   │   │   └── TournamentFilters.tsx
│   │   │   ├── catalog/                # 🚧 Composants e-commerce
│   │   │   │   ├── ProductCard.tsx     
│   │   │   │   └── ProductGrid.tsx     
│   │   │   ├── cart/                   # ✅ Composants panier
│   │   │   │   └── CartItem.tsx        # ✅ Déjà présent
│   │   │   └── auth/                   # 🚧 Composants auth
│   │   │       ├── LoginForm.tsx       
│   │   │       └── RegisterForm.tsx    
│   │   ├── 📁 lib/                     # ⚙️ Utilitaires et services
│   │   │   ├── api/                    # ✅ Services API
│   │   │   │   ├── client.ts           # ✅ Client Axios configuré
│   │   │   │   └── services.ts         # ✅ Services auth, catalog, tournaments
│   │   │   ├── hooks/                  # ✅ Hooks personnalisés
│   │   │   │   ├── api-hooks.ts        # ✅ Hooks React Query
│   │   │   │   ├── useCart.ts          # ✅ Gestion panier
│   │   │   │   ├── useCartAPI.ts       # ✅ API panier
│   │   │   │   └── useToast.ts         # ✅ Notifications
│   │   │   ├── validations/            # ✅ Schémas de validation
│   │   │   │   └── auth.ts             # ✅ Validation Zod auth
│   │   │   └── utils/                  # ✅ Fonctions utilitaires
│   │   │       └── index.ts            # ✅ Utilitaires généraux
│   │   ├── 📁 types/                   # 📋 Types TypeScript
│   │   │   └── api.ts                  # ✅ Types API complets
│   │   └── 📁 styles/                  # 🎨 Styles globaux
│   │       └── globals.css             # ✅ Styles Tailwind
│   ├── 📄 package.json                 # ✅ Dépendances Next.js
│   ├── 📄 tsconfig.json               # ✅ Configuration TypeScript
│   ├── 📄 tailwind.config.ts          # ✅ Configuration Tailwind
│   └── 📄 next.config.js              # ✅ Configuration Next.js
│
├── 📁 reference/                       # 📚 RESSOURCES DE RÉFÉRENCE
│   ├── 📁 maquettes-html/             # 🎨 Maquettes HTML statiques
│   │   ├── connexion.html             # ✅ Référence design login
│   │   ├── inscription.html           # ✅ Référence design register
│   │   ├── maquette.html             # ✅ Référence dashboard
│   │   ├── Tournois.html             # ✅ Référence liste tournois
│   │   ├── Detail\ tournoi.html       # ✅ Référence détail tournoi
│   │   ├── Creer\ un\ tournoi.html    # ✅ Référence création
│   │   ├── Mes\ tournois.html         # ✅ Référence mes tournois
│   │   ├── panier.html               # ✅ Référence panier
│   │   ├── Paiements.html            # ✅ Référence paiements
│   │   ├── Profil.html               # ✅ Référence profil
│   │   └── Backoffice_paiements_en_revue.html # ✅ Référence admin
│   ├── 📁 pages-react/                # ⚛️ Pages React développées
│   │   ├── CreateTournamentPage.tsx   # ✅ À migrer vers Next.js
│   │   ├── MyTournamentsPage.tsx      # ✅ À migrer vers Next.js
│   │   └── TournamentDetailPage.tsx   # ✅ À migrer vers Next.js
│   └── 📁 tests-integration/          # 🧪 Tests d'intégration
│       ├── integration-test.html      
│       └── test-cart.html             
│
├── 📁 api/                            # 🔥 BACKEND FASTAPI (déjà complet)
└── 📁 database/                       # 💾 BASE DE DONNÉES (déjà complète)
```

## 🔄 Migration des Fichiers Existants

### ✅ Fichiers à Conserver (Déjà bien placés)
- `freefire-frontend/src/lib/` → Garder tel quel
- `freefire-frontend/src/components/ui/` → Garder tel quel  
- `freefire-frontend/src/types/` → Garder tel quel

### 📦 Fichiers à Migrer
1. **Pages React vers Next.js App Router :**
   - `frontend/src/pages/CreateTournamentPage.tsx` → `frontend/src/app/tournaments/create/page.tsx`
   - `frontend/src/pages/MyTournamentsPage.tsx` → `frontend/src/app/tournaments/my/page.tsx`
   - `frontend/src/pages/TournamentDetailPage.tsx` → `frontend/src/app/tournaments/[id]/page.tsx`

2. **Services et Hooks :**
   - `frontend/nextjs/src/hooks/useCart.ts` → `frontend/src/lib/hooks/useCart.ts`
   - `frontend/nextjs/src/services/cartService.ts` → `frontend/src/lib/api/cartService.ts`

3. **Pages NextJS existantes :**
   - `frontend/nextjs/src/app/page.tsx` → Fusionner avec `freefire-frontend/src/app/page.tsx`

### 🗂️ Fichiers à Archiver (Référence)
- Toutes les maquettes HTML → `reference/maquettes-html/`
- Tests d'intégration → `reference/tests-integration/`
- Pages React originales → `reference/pages-react/`

## 📊 État Actuel vs Objectif

| Fonctionnalité | État Actuel | Objectif | Action |
|----------------|-------------|----------|--------|
| **Pages Tournois** | ✅ React complet | ✅ Next.js | 🔄 Migration |
| **Authentification** | ✅ Services/Hooks | 🚧 Pages UI | 📝 Création |
| **Dashboard** | ✅ Page basique | 🚧 Dashboard complet | 📝 Développement |
| **E-commerce** | ✅ Hooks panier | 🚧 Pages UI | 📝 Création |
| **UI Components** | ✅ Composants base | ✅ Système complet | ✅ Prêt |
| **API Integration** | ✅ Services complets | ✅ Hooks React Query | ✅ Prêt |

## 🎯 Priorités de Développement

### 🔥 Phase 1 - Structure et Migration (1 semaine)
1. Créer la nouvelle structure de dossiers
2. Migrer les 3 pages React vers Next.js
3. Créer les composants de layout (Header, Footer)
4. Tester la navigation

### 🚀 Phase 2 - Pages Principales (2 semaines)  
1. Créer les pages d'authentification (Login/Register)
2. Développer la page catalogue produits
3. Créer la page panier/checkout
4. Développer la page profil utilisateur

### 📈 Phase 3 - Pages Avancées (1 semaine)
1. Interface de paiements
2. Backoffice administration  
3. Pages de gestion utilisateur
4. Optimisations et tests

## 🔧 Technologies Consolidées

### ✅ Stack Technique Unifiée
- **Framework :** Next.js 14 (App Router)
- **Language :** TypeScript
- **Styling :** TailwindCSS + Composants UI custom
- **State Management :** React Query + Context API
- **Forms :** React Hook Form + Zod validation
- **HTTP Client :** Axios avec intercepteurs JWT
- **Icons :** Lucide React
- **Notifications :** Système toast custom

### ✅ Dépendances Principales
```json
{
  "next": "14.2.5",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.3.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "lucide-react": "^0.292.0"
}
```
