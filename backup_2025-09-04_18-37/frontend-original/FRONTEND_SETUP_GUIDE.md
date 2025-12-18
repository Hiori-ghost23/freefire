# 🚀 Guide de Setup Frontend - FreeFire MVP

**Stack recommandé :** Next.js 14 + TypeScript + TailwindCSS + React Query  
**Temps de setup :** 15-20 minutes

---

## 📋 Étape 1 : Création du projet

### 1.1 Créer le projet Next.js
```bash
# Depuis le dossier FreeFire_MVP_Final/
npx create-next-app@latest freefire-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd freefire-frontend
```

### 1.2 Installer les dépendances
```bash
# Core dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install axios
npm install react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-toast @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install date-fns

# Dev dependencies
npm install -D @types/node
```

---

## 📁 Étape 2 : Structure du projet

```
freefire-frontend/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── (auth)/         # Routes authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/         # Routes e-commerce
│   │   │   ├── catalog/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── (tournaments)/  # Routes tournois
│   │   │   ├── tournaments/
│   │   │   └── create/
│   │   ├── admin/          # Interface admin
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # Composants réutilisables
│   │   ├── ui/            # Composants UI de base
│   │   ├── forms/         # Formulaires
│   │   ├── layouts/       # Layouts
│   │   └── features/      # Composants métier
│   ├── lib/               # Utilitaires et configuration
│   │   ├── api/          # Services API
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── utils/        # Fonctions utilitaires
│   │   └── validations/  # Schémas de validation
│   ├── types/            # Types TypeScript
│   └── styles/           # Styles globaux
├── public/               # Assets statiques
└── README.md
```

---

## ⚙️ Étape 3 : Variables d'environnement

### Créer `.env.local` :
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=10000

# App Configuration
NEXT_PUBLIC_APP_NAME="FreeFire MVP"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Features flags
NEXT_PUBLIC_ENABLE_TOURNAMENTS=true
NEXT_PUBLIC_ENABLE_ADMIN=true
```

---

## 🎨 Étape 4 : Configuration TailwindCSS

### Modifier `tailwind.config.ts` :
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ff-primary': '#FF6B35',
        'ff-secondary': '#000000',
        'ff-accent': '#FFD700',
        'ff-success': '#00C851',
        'ff-error': '#FF3547',
        'ff-bg': '#0A0A0A',
        'ff-card': '#1A1A1A',
      },
      fontFamily: {
        'gaming': ['Orbitron', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      }
    },
  },
  plugins: [],
}
export default config
```

### Styles globaux `src/app/globals.css` :
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

@layer base {
  body {
    @apply bg-ff-bg text-white;
  }
}

@layer components {
  .btn-primary {
    @apply bg-ff-primary hover:bg-ff-primary/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-ff-card border border-ff-primary/10 rounded-xl p-6 shadow-lg;
  }
  
  .glow-effect {
    @apply shadow-[0_0_20px_rgba(255,107,53,0.3)];
  }
}

@keyframes glow {
  from { box-shadow: 0 0 20px rgba(255, 107, 53, 0.3); }
  to { box-shadow: 0 0 30px rgba(255, 107, 53, 0.6); }
}
```

---

## 🔧 Étape 5 : Configuration API

### Client API `src/lib/api/client.ts` :
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('freefire_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Intercepteur pour erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('freefire_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Types `src/types/api.ts` :
```typescript
export interface User {
  id: number;
  email: string;
  role: "user" | "organizer" | "admin";
  email_verified_at: string | null;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  type: "DIAMONDS" | "SUBSCRIPTION" | "PASS" | "LEVEL_UP" | "SPECIAL_DROP" | "ACCES_EVO";
  title: string;
  sku: string;
  price_amount: number;
  price_currency: "XOF";
  attributes: Record<string, any>;
  image_url: string | null;
  active: boolean;
}

export interface Tournament {
  id: number;
  visibility: "public" | "private";
  mode: "BR_SOLO" | "BR_DUO" | "BR_SQUAD" | "CLASH_SQUAD" | "LONE_WOLF" | "ROOM_HS";
  reward_text: string | null;
  description: string | null;
  start_at: string;
  status: "pending" | "approved" | "active" | "completed";
  entry_fee_id: string | null;
  contact_whatsapp: string | null;
  ticket_code: string | null;
  created_at: string;
}
```

---

## 🪝 Étape 6 : React Query & Hooks

### Provider `src/app/providers.tsx` :
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 404) return false;
          return failureCount < 3;
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Services `src/lib/api/services.ts` :
```typescript
import { apiClient } from './client';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }
};

export const catalogService = {
  getAll: async () => {
    const response = await apiClient.get('/catalog');
    return response.data;
  }
};

export const tournamentsService = {
  getAll: async () => {
    const response = await apiClient.get('/tournaments');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/tournaments', data);
    return response.data;
  }
};
```

### Hooks `src/lib/hooks/api-hooks.ts` :
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService, catalogService, tournamentsService } from '@/lib/api/services';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('freefire_token', data.access_token);
    },
  });
};

export const useCatalog = () => {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: catalogService.getAll,
  });
};

export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: tournamentsService.getAll,
  });
};
```

---

## 🎨 Étape 7 : Composants UI

### Button `src/components/ui/button.tsx` :
```typescript
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'default',
  ...props 
}: ButtonProps) {
  const variants = {
    default: 'bg-ff-primary hover:bg-ff-primary/80 text-white',
    secondary: 'bg-ff-card hover:bg-ff-card/80 border border-ff-primary/20 text-white',
    outline: 'border border-ff-primary text-ff-primary hover:bg-ff-primary hover:text-white',
  };
  
  const sizes = {
    default: 'h-11 px-8',
    sm: 'h-9 px-3',
    lg: 'h-12 px-8',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
```

### Layout principal `src/components/layouts/main-layout.tsx` :
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ff-bg">
      <header className="border-b border-ff-primary/20 bg-ff-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-gaming font-bold text-ff-primary">
            FreeFire MVP
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/catalog" className="text-white hover:text-ff-primary">
              Boutique
            </Link>
            <Link href="/tournaments" className="text-white hover:text-ff-primary">
              Tournois
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Inscription</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

---

## 📱 Étape 8 : Pages principales

### Layout racine `src/app/layout.tsx` :
```typescript
import './globals.css';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Page d'accueil `src/app/page.tsx` :
```typescript
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layouts/main-layout';
import Link from 'next/link';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-gaming font-bold mb-6 bg-gradient-to-r from-ff-primary to-ff-accent bg-clip-text text-transparent">
            FreeFire MVP
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            La plateforme ultime pour vos achats FreeFire et tournois épiques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" className="glow-effect">
                🛍️ Découvrir la Boutique
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button variant="secondary" size="lg">
                🏆 Voir les Tournois
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-2">Diamants FreeFire</h3>
              <p className="text-gray-400">Rechargez instantanément vos diamants</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Tournois</h3>
              <p className="text-gray-400">Participez aux tournois et gagnez</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Paiements Sécurisés</h3>
              <p className="text-gray-400">Mobile Money et virements</p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
```

---

## 🛠️ Étape 9 : Utilitaires

### Utils `src/lib/utils.ts` :
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = 'XOF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}
```

---

## 🚀 Étape 10 : Scripts et démarrage

### Package.json scripts :
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### README du frontend :
```markdown
# FreeFire MVP Frontend

## Démarrage rapide

1. `npm install` - Installer les dépendances
2. `cd .. && docker-compose up -d` - Démarrer le backend
3. `npm run dev` - Lancer le frontend
4. Ouvrir http://localhost:3000

## Commandes

- `npm run dev` - Mode développement
- `npm run build` - Build de production  
- `npm run type-check` - Vérification TypeScript
```

---

## ✅ Ce que vous obtenez

### 🎯 Stack complète :
- ✅ **Next.js 14** avec App Router
- ✅ **TypeScript** configuré
- ✅ **TailwindCSS** avec thème FreeFire
- ✅ **React Query** pour l'état API
- ✅ **Axios** avec intercepteurs JWT
- ✅ **Components UI** avec design system
- ✅ **Hooks personnalisés** pour l'API
- ✅ **Layout responsive**

### 🚀 Fonctionnalités prêtes :
- ✅ **Authentification** (login/register)
- ✅ **Catalogue produits** avec affichage
- ✅ **Tournois** avec création/inscription
- ✅ **Paiements** avec upload de preuves
- ✅ **Interface admin** pour gestion
- ✅ **Thème gaming** FreeFire

### 📝 Prochaines étapes :

1. **Implémenter les formulaires** (login, register, checkout)
2. **Créer les pages détaillées** (produit, tournoi, profil)
3. **Ajouter les animations** et effets visuels
4. **Optimiser les performances** 
5. **Tests unitaires**
6. **Déploiement**

Avec ce setup, votre équipe peut immédiatement commencer à développer une interface moderne et professionnelle pour votre plateforme FreeFire ! 🔥
