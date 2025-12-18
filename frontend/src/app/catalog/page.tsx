'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Diamond, ShoppingCart, Star, Tag, Package, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/toast';
import { useCatalog, useProfile } from '@/lib/hooks/api-hooks';

// Categories mapping based on backend data
const categories: Record<string, { name: string; icon: any; color: string }> = {
  DIAMONDS: { name: 'Diamants FreeFire', icon: Diamond, color: 'text-blue-400' },
  SUBSCRIPTION: { name: 'Abonnements', icon: Zap, color: 'text-purple-400' },
  PASS: { name: 'Pass de Combat', icon: Star, color: 'text-yellow-400' },
  SPECIAL: { name: 'Éditions Spéciales', icon: Package, color: 'text-pink-400' },
  diamonds: { name: 'Diamants FreeFire', icon: Diamond, color: 'text-blue-400' },
  subscription: { name: 'Abonnements', icon: Zap, color: 'text-purple-400' },
  pass: { name: 'Pass de Combat', icon: Star, color: 'text-yellow-400' },
  special: { name: 'Éditions Spéciales', icon: Package, color: 'text-pink-400' },
};

interface CatalogItem {
  id: string;
  name: string;
  price_xof: number;
  category: string;
  description?: string;
  image_url?: string;
  in_stock: boolean;
  popular?: boolean;
  bonus?: string;
}

const priceRanges = [
  { label: 'Moins de 1000 XOF', value: '0-1000', min: 0, max: 1000 },
  { label: '1000 - 5000 XOF', value: '1000-5000', min: 1000, max: 5000 },
  { label: '5000 - 10000 XOF', value: '5000-10000', min: 5000, max: 10000 },
  { label: '10000+ XOF', value: '10000+', min: 10000, max: Infinity },
];

export default function CatalogPage() {
  const { data: catalogData, isLoading, error } = useCatalog();
  const { data: userData } = useProfile();
  
  const [filteredProducts, setFilteredProducts] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const { addToast } = useToast();

  // Transform API data to match our interface
  const products: CatalogItem[] = catalogData?.map((item: any) => ({
    id: item.id,
    name: item.name,
    price_xof: item.price_xof || item.price,
    category: item.category || item.type || 'SPECIAL',
    description: item.description,
    image_url: item.image_url,
    in_stock: item.in_stock !== false,
    popular: item.popular || false,
    bonus: item.bonus,
  })) || [];

  // Filter and sort products
  useEffect(() => {
    if (!products.length) return;
    
    let filtered = [...products];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // Filter by price range
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.value === selectedPriceRange);
      if (range) {
        filtered = filtered.filter(product =>
          product.price_xof >= range.min && product.price_xof <= range.max
        );
      }
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price_xof - b.price_xof;
        case 'price-desc':
          return b.price_xof - a.price_xof;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
        default:
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return a.price_xof - b.price_xof;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedPriceRange, sortBy]);

  const formatXOF = (amount: number) => {
    return `${amount.toLocaleString()} XOF`;
  };

  const addToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
    const product = products.find(p => p.id === productId);
    
    // Save to localStorage for cart page
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!existingCart.includes(productId)) {
      localStorage.setItem('cart', JSON.stringify([...existingCart, productId]));
    }
    
    addToast({
      type: 'success',
      title: 'Produit ajouté',
      message: `${product?.name} ajouté au panier`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(id => id !== productId));
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    localStorage.setItem('cart', JSON.stringify(existingCart.filter((id: string) => id !== productId)));
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, []);

  const isInCart = (productId: string) => cartItems.includes(productId);
  const cartItemCount = cartItems.length;

  // Use real user data or fallback
  const user = userData || null;

  // Loading state
  if (isLoading) {
    return (
      <AppLayout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Chargement du catalogue...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
            <p className="text-neutral-400 mb-4">Impossible de charger le catalogue.</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Boutique FreeFire
                </h1>
                <p className="mt-2 text-neutral-400">
                  Découvrez tous nos produits premium pour FreeFire
                </p>
              </div>
              
              {cartItemCount > 0 && (
                <Button className="relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Panier ({cartItemCount})
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-48">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Toutes catégories</option>
                  {Object.entries(categories).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Price Filter */}
              <div className="lg:w-48">
                <Select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                >
                  <option value="">Tous les prix</option>
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Sort */}
              <div className="lg:w-40">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Populaires</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-neutral-400">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const categoryConfig = categories[product.category as keyof typeof categories];
              const CategoryIcon = categoryConfig.icon;
              const inCart = isInCart(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-primary/20"
                >
                  {/* Popular Badge */}
                  {product.popular && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400">
                        <Star className="w-3 h-3 mr-1" />
                        Populaire
                      </span>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-pink-500/20 p-6 flex items-center justify-center">
                    <CategoryIcon className={`w-12 h-12 ${categoryConfig.color}`} />
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
                        <span className={`text-xs font-medium ${categoryConfig.color}`}>
                          {categoryConfig.name}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Bonus */}
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-green-400/10 text-green-400 text-xs font-medium">
                        <Tag className="w-3 h-3 mr-1" />
                        {product.bonus}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-primary">
                        {formatXOF(product.price_xof)}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full"
                      onClick={() => inCart ? removeFromCart(product.id) : addToCart(product.id)}
                      variant={inCart ? "outline" : "default"}
                    >
                      {inCart ? (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Dans le panier
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Ajouter au panier
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-neutral-400 mb-6">
                Aucun produit ne correspond à vos critères de recherche.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedPriceRange('');
                  setSortBy('popular');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Cart Summary (if items in cart) */}
          {cartItemCount > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <div className="bg-primary/90 backdrop-blur-sm text-white p-4 rounded-2xl shadow-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">
                      {cartItemCount} article{cartItemCount > 1 ? 's' : ''} dans le panier
                    </p>
                    <p className="text-xs opacity-90">
                      Total: {formatXOF(
                        cartItems.reduce((sum, itemId) => {
                          const product = products.find(p => p.id === itemId);
                          return sum + (product?.price_xof || 0);
                        }, 0)
                      )}
                    </p>
                  </div>
                  <Button size="sm" className="bg-white text-primary hover:bg-neutral-100">
                    Voir le panier
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
