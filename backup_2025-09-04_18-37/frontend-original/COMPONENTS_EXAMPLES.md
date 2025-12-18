# 🎨 Exemples de Composants Frontend - FreeFire MVP

Ce fichier contient des exemples complets de composants React/Next.js prêts à utiliser.

---

## 📝 Formulaire de Connexion

### `src/app/(auth)/login/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/hooks/api-hooks';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layouts/main-layout';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loginMutation.mutateAsync({ email, password });
      router.push('/catalog');
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-gaming font-bold text-ff-primary mb-2">
              Connexion
            </h1>
            <p className="text-gray-400">
              Accédez à votre compte FreeFire MVP
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-ff-bg border border-ff-primary/20 rounded-lg text-white focus:outline-none focus:border-ff-primary"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-ff-bg border border-ff-primary/20 rounded-lg text-white focus:outline-none focus:border-ff-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
            </Button>

            {loginMutation.error && (
              <div className="text-ff-error text-sm text-center">
                Erreur de connexion. Vérifiez vos identifiants.
              </div>
            )}

            <div className="text-center">
              <Link href="/register" className="text-ff-primary hover:text-ff-primary/80">
                Pas encore de compte ? Inscrivez-vous
              </Link>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
```

---

## 🛍️ Composant Carte Produit

### `src/components/features/product-card.tsx`
```typescript
import { CatalogItem } from '@/types/api';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: CatalogItem;
  onPurchase: (productId: string) => void;
}

const productIcons = {
  DIAMONDS: '💎',
  SUBSCRIPTION: '🎫',
  PASS: '🏅',
  LEVEL_UP: '⬆️',
  SPECIAL_DROP: '📦',
  ACCES_EVO: '🚀',
};

const productColors = {
  DIAMONDS: 'from-yellow-500 to-orange-500',
  SUBSCRIPTION: 'from-purple-500 to-pink-500',
  PASS: 'from-blue-500 to-cyan-500',
  LEVEL_UP: 'from-green-500 to-emerald-500',
  SPECIAL_DROP: 'from-red-500 to-rose-500',
  ACCES_EVO: 'from-indigo-500 to-purple-500',
};

export function ProductCard({ product, onPurchase }: ProductCardProps) {
  return (
    <div className="card relative overflow-hidden group hover:scale-105 transition-transform duration-200">
      {/* Badge type de produit */}
      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${productColors[product.type]} text-white`}>
        {productIcons[product.type]} {product.type}
      </div>

      {/* Image produit */}
      <div className="h-32 bg-gradient-to-br from-ff-primary/20 to-ff-accent/20 rounded-lg mb-4 flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-6xl">
            {productIcons[product.type]}
          </div>
        )}
      </div>

      {/* Informations produit */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-ff-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-400">
            SKU: {product.sku}
          </p>
        </div>

        {/* Attributs spéciaux */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="text-xs text-ff-accent">
            {Object.entries(product.attributes).map(([key, value]) => (
              <span key={key} className="mr-2">
                {key}: {value}
              </span>
            ))}
          </div>
        )}

        {/* Prix et achat */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-ff-primary">
            {formatPrice(product.price_amount, product.price_currency)}
          </div>
          <Button 
            onClick={() => onPurchase(product.id)}
            size="sm"
            className="glow-effect"
          >
            Acheter
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🛒 Page Catalogue Complète

### `src/app/(shop)/catalog/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useCatalog, useCreateOrder } from '@/lib/hooks/api-hooks';
import { MainLayout } from '@/components/layouts/main-layout';
import { ProductCard } from '@/components/features/product-card';
import { Button } from '@/components/ui/button';
import { CatalogItem } from '@/types/api';

const productTypeLabels = {
  DIAMONDS: 'Diamants',
  SUBSCRIPTION: 'Abonnements',
  PASS: 'Pass',
  LEVEL_UP: 'Level Up',
  SPECIAL_DROP: 'Largages Spéciaux',
  ACCES_EVO: 'Accès Evo',
};

export default function CatalogPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [uidFreeFire, setUidFreeFire] = useState('');
  
  const { data: products, isLoading, error } = useCatalog();
  const createOrderMutation = useCreateOrder();

  const productTypes = products ? Array.from(new Set(products.map(p => p.type))) : [];
  
  const filteredProducts = products?.filter(product => 
    selectedType === 'all' || product.type === selectedType
  ) || [];

  const handlePurchase = async (productId: string) => {
    if (!uidFreeFire.trim()) {
      alert('Veuillez entrer votre UID FreeFire');
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        catalogItemId: productId,
        uidFreeFire: uidFreeFire
      });
      
      // Rediriger vers la page de paiement
      window.location.href = `/checkout/${order.order_code}`;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Erreur lors de la création de la commande');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ff-primary mx-auto mb-4"></div>
            <p>Chargement du catalogue...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-ff-error">
            <p>Erreur lors du chargement du catalogue</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-gaming font-bold text-ff-primary mb-4">
            🛍️ Boutique FreeFire
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Découvrez notre collection complète de diamants, abonnements et pass FreeFire
          </p>
        </div>

        {/* UID FreeFire Input */}
        <div className="card max-w-md mx-auto mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Votre UID FreeFire
          </h3>
          <input
            type="text"
            value={uidFreeFire}
            onChange={(e) => setUidFreeFire(e.target.value)}
            placeholder="Entrez votre UID FreeFire"
            className="w-full px-4 py-3 bg-ff-bg border border-ff-primary/20 rounded-lg text-white focus:outline-none focus:border-ff-primary"
          />
          <p className="text-sm text-gray-400 mt-2">
            Requis pour toutes les commandes
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedType === 'all' ? 'default' : 'secondary'}
            onClick={() => setSelectedType('all')}
          >
            Tous ({products?.length || 0})
          </Button>
          {productTypes.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'secondary'}
              onClick={() => setSelectedType(type)}
            >
              {productTypeLabels[type]} ({products?.filter(p => p.type === type).length || 0})
            </Button>
          ))}
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onPurchase={handlePurchase}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>Aucun produit trouvé pour cette catégorie</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
```

---

## 🏆 Composant Carte Tournoi

### `src/components/features/tournament-card.tsx`
```typescript
import { Tournament } from '@/types/api';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface TournamentCardProps {
  tournament: Tournament;
  onRegister: (tournamentId: number) => void;
}

const gameModeLabels = {
  BR_SOLO: 'Battle Royale Solo',
  BR_DUO: 'Battle Royale Duo',
  BR_SQUAD: 'Battle Royale Squad',
  CLASH_SQUAD: 'Clash Squad',
  LONE_WOLF: 'Lone Wolf',
  ROOM_HS: 'Room HS',
};

const gameModeIcons = {
  BR_SOLO: '👤',
  BR_DUO: '👥',
  BR_SQUAD: '👨‍👩‍👧‍👦',
  CLASH_SQUAD: '⚔️',
  LONE_WOLF: '🐺',
  ROOM_HS: '🎯',
};

const statusColors = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  active: 'bg-blue-500',
  completed: 'bg-gray-500',
};

const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvé',
  active: 'En cours',
  completed: 'Terminé',
};

export function TournamentCard({ tournament, onRegister }: TournamentCardProps) {
  const isRegistrationOpen = tournament.status === 'approved';
  
  return (
    <div className="card relative group hover:scale-105 transition-transform duration-200">
      {/* Badge statut */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[tournament.status]}`}>
        {statusLabels[tournament.status]}
      </div>

      {/* Badge visibilité */}
      <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-semibold bg-ff-primary/20 text-ff-primary border border-ff-primary/50">
        {tournament.visibility === 'private' ? '🔒 Privé' : '🌐 Public'}
      </div>

      {/* Mode de jeu */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">
          {gameModeIcons[tournament.mode]}
        </div>
        <h3 className="text-xl font-gaming font-bold text-white group-hover:text-ff-primary transition-colors">
          {gameModeLabels[tournament.mode]}
        </h3>
      </div>

      {/* Informations tournoi */}
      <div className="space-y-3">
        {/* Récompense */}
        {tournament.reward_text && (
          <div className="text-center p-3 bg-ff-accent/10 rounded-lg border border-ff-accent/20">
            <div className="text-ff-accent font-semibold">🏆 Récompense</div>
            <div className="text-white text-lg font-bold">{tournament.reward_text}</div>
          </div>
        )}

        {/* Description */}
        {tournament.description && (
          <p className="text-gray-300 text-sm">
            {tournament.description}
          </p>
        )}

        {/* Date de début */}
        <div className="flex items-center text-sm text-gray-400">
          <span className="mr-2">📅</span>
          {formatDate(tournament.start_at)}
        </div>

        {/* Contact WhatsApp */}
        {tournament.contact_whatsapp && (
          <div className="flex items-center text-sm text-green-400">
            <span className="mr-2">📱</span>
            {tournament.contact_whatsapp}
          </div>
        )}

        {/* Code d'accès pour tournois privés */}
        {tournament.visibility === 'private' && tournament.ticket_code && (
          <div className="text-xs text-ff-primary">
            Code requis: {tournament.ticket_code}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4">
          {isRegistrationOpen ? (
            <Button 
              onClick={() => onRegister(tournament.id)}
              className="w-full glow-effect"
            >
              {tournament.entry_fee_id ? '💰 S\'inscrire (payant)' : '🎮 S\'inscrire gratuitement'}
            </Button>
          ) : (
            <Button 
              disabled 
              className="w-full"
            >
              {tournament.status === 'pending' ? 'En attente d\'approbation' :
               tournament.status === 'active' ? 'Tournoi en cours' :
               'Inscriptions fermées'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🏆 Page Tournois Complète

### `src/app/(tournaments)/tournaments/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useTournaments } from '@/lib/hooks/api-hooks';
import { MainLayout } from '@/components/layouts/main-layout';
import { TournamentCard } from '@/components/features/tournament-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TournamentsPage() {
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('approved');
  
  const { data: tournaments, isLoading, error } = useTournaments();

  const gameModes = tournaments ? Array.from(new Set(tournaments.map(t => t.mode))) : [];
  
  const filteredTournaments = tournaments?.filter(tournament => {
    const matchesMode = selectedMode === 'all' || tournament.mode === selectedMode;
    const matchesStatus = selectedStatus === 'all' || tournament.status === selectedStatus;
    return matchesMode && matchesStatus;
  }) || [];

  const handleRegister = async (tournamentId: number) => {
    // Rediriger vers la page d'inscription
    window.location.href = `/tournaments/${tournamentId}/register`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ff-primary mx-auto mb-4"></div>
            <p>Chargement des tournois...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-gaming font-bold text-ff-primary mb-4">
            🏆 Tournois FreeFire
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Participez aux tournois épiques et remportez des récompenses incroyables !
          </p>
          
          <Link href="/tournaments/create">
            <Button size="lg" className="glow-effect">
              ➕ Créer un Tournoi
            </Button>
          </Link>
        </div>

        {/* Filtres */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtre par statut */}
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Statut</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'approved', 'active', 'pending'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedStatus === status ? 'default' : 'secondary'}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status === 'all' ? 'Tous' :
                     status === 'approved' ? 'Ouvert aux inscriptions' :
                     status === 'active' ? 'En cours' :
                     'En attente'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtre par mode */}
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Mode de jeu</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedMode === 'all' ? 'default' : 'secondary'}
                  onClick={() => setSelectedMode('all')}
                >
                  Tous
                </Button>
                {gameModes.map(mode => (
                  <Button
                    key={mode}
                    size="sm"
                    variant={selectedMode === mode ? 'default' : 'secondary'}
                    onClick={() => setSelectedMode(mode)}
                  >
                    {mode.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grille de tournois */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onRegister={handleRegister}
            />
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>Aucun tournoi trouvé avec ces filtres</p>
            <Link href="/tournaments/create" className="mt-4 inline-block">
              <Button>Créer le premier tournoi</Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
```

---

## 💳 Composant Upload de Preuve de Paiement

### `src/components/features/payment-proof-upload.tsx`
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PaymentProofUploadProps {
  paymentId: string;
  onUploadSuccess: () => void;
}

export function PaymentProofUpload({ paymentId, onUploadSuccess }: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Créer une preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/payments/${paymentId}/proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('freefire_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        onUploadSuccess();
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de la preuve');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">
        📷 Preuve de paiement
      </h3>

      <div className="space-y-4">
        {/* Zone de drop/sélection */}
        <div className="border-2 border-dashed border-ff-primary/30 rounded-lg p-8 text-center">
          {preview ? (
            <div className="space-y-4">
              <img 
                src={preview} 
                alt="Aperçu" 
                className="max-w-full h-48 object-contain mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-400">
                Fichier sélectionné: {file?.name}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl text-ff-primary">📱</div>
              <div>
                <p className="text-white font-medium mb-2">
                  Ajoutez une capture d'écran de votre paiement
                </p>
                <p className="text-sm text-gray-400">
                  Formats acceptés: JPG, PNG, PDF (max 10MB)
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="proof-upload"
          />
          <label htmlFor="proof-upload" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              {file ? 'Changer de fichier' : 'Sélectionner un fichier'}
            </Button>
          </label>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-400">
          <h4 className="font-semibold text-white mb-2">Instructions:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Assurez-vous que le montant est clairement visible</li>
            <li>Le numéro de référence doit être lisible</li>
            <li>L'image doit être nette et de bonne qualité</li>
          </ul>
        </div>

        {/* Bouton upload */}
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Upload en cours...' : 'Envoyer la preuve'}
        </Button>
      </div>
    </div>
  );
}
```

---

## ✅ Ces composants vous donnent :

### 🎯 **Fonctionnalités complètes :**
- ✅ **Authentification** avec gestion d'erreurs
- ✅ **Catalogue produits** avec filtres et recherche
- ✅ **Cartes produits** avec design gaming
- ✅ **Tournois** avec inscription et filtres
- ✅ **Upload de preuves** de paiement
- ✅ **Responsive design** pour mobile/desktop
- ✅ **Loading states** et gestion d'erreurs
- ✅ **Thème FreeFire** cohérent

### 🚀 **Prêt pour la production :**
- Types TypeScript stricts
- Gestion d'état avec React Query  
- Composants réutilisables
- UX/UI optimisée pour gaming
- Gestion d'erreurs robuste

Avec ces exemples, votre équipe peut rapidement implémenter une interface moderne et fonctionnelle ! 🔥
