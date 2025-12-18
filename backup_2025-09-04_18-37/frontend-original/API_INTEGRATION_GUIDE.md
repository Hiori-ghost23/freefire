# 🚀 Guide d'intégration API - FreeFire MVP Frontend

**Version API :** 2.4.0  
**Base URL :** http://localhost:8080  
**Documentation interactive :** http://localhost:8080/docs

---

## 📋 Vue d'ensemble des endpoints

### 🔐 **Authentification** (`/auth`)
- `POST /auth/register` - Créer un compte utilisateur
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/verify-email` - Vérifier l'email
- `POST /auth/reset-password` - Reset mot de passe

### 🛍️ **Catalogue** (`/catalog`)
- `GET /catalog` - Liste tous les produits FreeFire
- `GET /catalog/{id}` - Détail d'un produit
- `POST /admin/catalog` - Ajouter un produit (admin)

### 🛒 **Commandes** (`/orders`)
- `POST /orders` - Créer une commande
- `GET /orders/mine` - Mes commandes
- `POST /admin/orders/{code}/deliver` - Marquer livré (admin)

### 💳 **Paiements** (`/payments`)
- `GET /payments/methods?country=BJ` - Méthodes de paiement
- `POST /payments/checkout` - Initier un paiement
- `POST /payments/{id}/proof` - Uploader preuve de paiement

### 🏆 **Tournois** (`/tournaments`)
- `GET /tournaments` - Liste des tournois
- `POST /tournaments` - Créer un tournoi
- `POST /tournaments/{id}/register` - S'inscrire à un tournoi

---

## 🔑 Authentification JWT

### Headers requis pour les requêtes authentifiées :
```typescript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Exemple de connexion :
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: {
    id: number;
    email: string;
    role: "user" | "organizer" | "admin";
    email_verified_at: string | null;
    created_at: string;
  };
}
```

---

## 🛍️ Types TypeScript pour le Catalogue

### Produits FreeFire disponibles :
```typescript
type ProductType = 
  | "DIAMONDS" 
  | "SUBSCRIPTION" 
  | "PASS" 
  | "LEVEL_UP" 
  | "SPECIAL_DROP" 
  | "ACCES_EVO";

interface CatalogItem {
  id: string;
  type: ProductType;
  title: string;
  sku: string;
  price_amount: number;
  price_currency: "XOF";
  attributes: Record<string, any>;
  image_url: string | null;
  active: boolean;
}

// Exemples de produits :
// - 💎 Diamants: 300-16500 XOF
// - 🎫 Abonnements: 1700-7200 XOF  
// - 🏅 Pass: 300-700 XOF
```

---

## 🏆 Types TypeScript pour les Tournois

### Modes de jeu FreeFire :
```typescript
type GameMode = 
  | "BR_SOLO" 
  | "BR_DUO" 
  | "BR_SQUAD" 
  | "CLASH_SQUAD" 
  | "LONE_WOLF" 
  | "ROOM_HS";

type TournamentVisibility = "public" | "private";
type TournamentStatus = "pending" | "approved" | "active" | "completed";

interface Tournament {
  id: number;
  visibility: TournamentVisibility;
  mode: GameMode;
  reward_text: string | null;
  description: string | null;
  start_at: string; // ISO date
  status: TournamentStatus;
  entry_fee_id: string | null;
  contact_whatsapp: string | null;
  ticket_code: string | null; // Pour tournois privés
  created_at: string;
}
```

---

## 💳 Types TypeScript pour les Paiements

### Pays supportés :
```typescript
type SupportedCountry = 
  | "BJ" | "CI" | "TG" | "BF" | "ML" 
  | "NE" | "SN" | "GW" | "NG" | "FR";

type PaymentMethod = 
  | "MTN_MOMO" | "MOOV_MONEY" | "CELTIIS_CASH"
  | "REMITLY" | "WORLDREMIT" | "WESTERN_UNION" 
  | "RIA" | "MONEYGRAM" | "TAPTAP_SEND";

interface PaymentCheckout {
  type: "order" | "entry_fee";
  targetId: string;
  country: SupportedCountry;
  method?: PaymentMethod;
}

interface PaymentResponse {
  paymentId: string;
  reference: string;
  amount: number;
  currency: string;
  instructions: {
    title: string;
    steps: string[];
  };
  proofUploadUrl: string;
  status: string;
  expiresAt: string;
}
```

---

## 🛒 Workflow complet E-commerce

### 1. Afficher le catalogue
```typescript
const catalog = await fetch('/catalog').then(r => r.json());
```

### 2. Créer une commande
```typescript
const order = await fetch('/orders', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    catalogItemId: "uuid-du-produit",
    uidFreeFire: "123456789" // UID FreeFire du joueur
  })
});
```

### 3. Initier le paiement
```typescript
const payment = await fetch('/payments/checkout', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    type: "order",
    targetId: order.order_code,
    country: "BJ", 
    method: "MTN_MOMO"
  })
});
```

### 4. Uploader la preuve de paiement
```typescript
const formData = new FormData();
formData.append('file', proofFile);

await fetch(`/payments/${paymentId}/proof`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## 🏆 Workflow complet Tournois

### 1. Créer un tournoi (organizer/admin)
```typescript
const tournament = await fetch('/tournaments', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    visibility: "public",
    mode: "BR_SQUAD",
    reward_text: "100 000 XOF",
    description: "Tournoi squad hebdomadaire",
    start_at: "2025-08-30T20:00:00Z",
    entry_fee_id: "uuid-frais",
    contact_whatsapp: "+2290151104575"
  })
});
```

### 2. S'inscrire au tournoi
```typescript
const registration = await fetch(`/tournaments/${tournamentId}/register`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    tournament_id: tournamentId,
    ticket_code: "CODE123" // Si tournoi privé
  })
});
```

### 3. Payer les frais d'inscription (si requis)
```typescript
const payment = await fetch('/payments/checkout', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    type: "entry_fee",
    targetId: registrationId,
    country: "BJ"
  })
});
```

---

## 🎨 Assets et UI/UX

### Thème couleurs FreeFire :
```css
:root {
  --ff-primary: #FF6B35;      /* Orange FreeFire */
  --ff-secondary: #000000;    /* Noir */
  --ff-accent: #FFD700;       /* Or pour les diamants */
  --ff-success: #00C851;      /* Vert pour succès */
  --ff-error: #FF3547;        /* Rouge pour erreurs */
  --ff-bg: #0A0A0A;          /* Arrière-plan sombre */
  --ff-card: #1A1A1A;        /* Cartes sombres */
}
```

### Images suggérées :
- Logo FreeFire (fond transparent)
- Icônes des modes de jeu (BR, Clash Squad, etc.)
- Images des produits (diamants, pass, etc.)
- Drapeaux des pays pour les paiements
- Icônes des méthodes de paiement

---

## 🔒 Gestion des rôles

### Permissions par rôle :
```typescript
interface UserPermissions {
  user: {
    // Peut acheter, s'inscrire aux tournois
    canPurchase: true;
    canJoinTournaments: true;
    canCreateTournaments: false;
    canAdminister: false;
  };
  organizer: {
    // Peut créer des tournois en plus
    canPurchase: true;
    canJoinTournaments: true;
    canCreateTournaments: true;
    canAdminister: false;
  };
  admin: {
    // Accès complet
    canPurchase: true;
    canJoinTournaments: true;
    canCreateTournaments: true;
    canAdminister: true;
  };
}
```

---

## 🚨 Gestion des erreurs

### Codes d'erreur courants :
```typescript
interface APIError {
  error: string;
  detail?: string;
  code?: number;
}

// Erreurs typiques :
// 401 - Token expiré/invalide
// 403 - Permissions insuffisantes  
// 404 - Ressource non trouvée
// 409 - Conflit (ex: email déjà utilisé)
// 422 - Validation échoue
// 500 - Erreur serveur
```

---

## ✅ URLs importantes

- **API Base :** http://localhost:8080
- **Swagger Docs :** http://localhost:8080/docs  
- **ReDoc :** http://localhost:8080/redoc
- **Health Check :** http://localhost:8080/health
- **OpenAPI Schema :** http://localhost:8080/openapi.json

---

## 🎯 Recommandations pour l'implémentation

1. **Utilisez React Query** pour la gestion des états et cache API
2. **Implémentez un intercepteur axios** pour la gestion automatique des tokens
3. **Créez des hooks personnalisés** pour chaque module (useAuth, useCatalog, etc.)
4. **Gérez les erreurs de façon centralisée** avec un contexte d'erreurs
5. **Utilisez des types TypeScript stricts** pour éviter les erreurs
6. **Implémentez un système de notifications** pour les retours utilisateur

Cette API est complète et prête pour le développement frontend ! 🚀
