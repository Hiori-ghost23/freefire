'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Diamond,
  Zap,
  Star,
  Package,
  Tag,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Percent
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';

// Categories mapping
const categories = {
  DIAMONDS: { name: 'Diamants', icon: Diamond, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  SUBSCRIPTION: { name: 'Abonnement', icon: Zap, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  PASS: { name: 'Pass', icon: Star, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  SPECIAL: { name: 'Spécial', icon: Package, color: 'text-pink-400', bgColor: 'bg-pink-400/10' },
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: keyof typeof categories;
  bonus?: string;
}

// Helper to get cart from localStorage
const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem('freefire_cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

// Helper to save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('freefire_cart', JSON.stringify(items));
};

export default function CartPage() {
  const { state: authState } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    setCartItems(getCartFromStorage());
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  // Get user for AppLayout
  const user = authState.user ? {
    id: authState.user.id,
    email: authState.user.email,
    display_name: authState.user.display_name || authState.user.email?.split('@')[0] || 'Utilisateur',
    role: authState.user.role as 'user' | 'admin' | 'organizer',
  } : null;

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = promoApplied ? Math.round(subtotal * promoDiscount) : 0;
  const total = subtotal - discount;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }
    
    if (newQuantity > 10) {
      addToast({
        type: 'warning',
        message: 'Quantité maximale: 10 par article',
      });
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    const item = cartItems.find(i => i.id === itemId);
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    
    addToast({
      type: 'success',
      message: `${item?.name} retiré du panier`,
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoApplied(false);
    setPromoCode('');
    setPromoDiscount(0);
    
    addToast({
      type: 'success',
      message: 'Panier vidé',
    });
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      addToast({
        type: 'error',
        message: 'Veuillez entrer un code promo',
      });
      return;
    }

    setIsApplyingPromo(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock promo codes
    const promoCodes: Record<string, number> = {
      'FREEFIRE10': 0.10,
      'WELCOME20': 0.20,
      'VIP15': 0.15,
    };

    const discountRate = promoCodes[promoCode.toUpperCase()];
    
    if (discountRate) {
      setPromoDiscount(discountRate);
      setPromoApplied(true);
      addToast({
        type: 'success',
        title: 'Code promo appliqué !',
        message: `Réduction de ${discountRate * 100}% appliquée`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Code invalide',
        message: 'Ce code promo n\'existe pas ou a expiré',
      });
    }
    
    setIsApplyingPromo(false);
  };

  const removePromoCode = () => {
    setPromoApplied(false);
    setPromoCode('');
    setPromoDiscount(0);
    
    addToast({
      type: 'info',
      message: 'Code promo retiré',
    });
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      addToast({
        type: 'error',
        message: 'Votre panier est vide',
      });
      return;
    }
    
    // Store cart data in localStorage for payment page
    localStorage.setItem('checkout_cart', JSON.stringify({
      items: cartItems,
      subtotal,
      discount,
      total,
      promoCode: promoApplied ? promoCode : null,
    }));
    
    router.push('/payment');
  };

  const formatXOF = (amount: number) => {
    return `${amount.toLocaleString()} XOF`;
  };

  return (
    <AppLayout user={user}>
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuer mes achats
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                  Mon Panier
                </h1>
                <p className="mt-2 text-neutral-400">
                  {itemCount} article{itemCount > 1 ? 's' : ''} dans votre panier
                </p>
              </div>
              
              {cartItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vider le panier
                </Button>
              )}
            </div>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="card text-center py-16">
              <ShoppingBag className="w-16 h-16 text-neutral-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-white mb-3">Votre panier est vide</h2>
              <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                Découvrez notre catalogue de produits FreeFire et ajoutez vos articles préférés.
              </p>
              <Button asChild>
                <Link href="/catalog">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Voir le catalogue
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const categoryConfig = categories[item.category];
                  const CategoryIcon = categoryConfig.icon;

                  return (
                    <div
                      key={item.id}
                      className="card flex flex-col sm:flex-row gap-4"
                    >
                      {/* Product Image/Icon */}
                      <div className={`w-full sm:w-24 h-24 rounded-xl ${categoryConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <CategoryIcon className={`w-10 h-10 ${categoryConfig.color}`} />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className={`text-xs font-medium ${categoryConfig.color}`}>
                              {categoryConfig.name}
                            </span>
                            <h3 className="text-lg font-semibold text-white mt-1">
                              {item.name}
                            </h3>
                            {item.bonus && (
                              <div className="inline-flex items-center mt-2 px-2 py-1 rounded-md bg-green-400/10 text-green-400 text-xs font-medium">
                                <Tag className="w-3 h-3 mr-1" />
                                {item.bonus}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-white font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              {formatXOF(item.price * item.quantity)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-neutral-400">
                                {formatXOF(item.price)} / unité
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Promo Code Section */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    Code promo
                  </h3>
                  
                  {promoApplied ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-green-400" />
                        <span className="font-medium text-green-400">{promoCode.toUpperCase()}</span>
                        <span className="text-green-300">(-{promoDiscount * 100}%)</span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Input
                        placeholder="Entrez votre code promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo}
                        variant="outline"
                      >
                        {isApplyingPromo ? 'Vérification...' : 'Appliquer'}
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-xs text-neutral-500 mt-3">
                    Codes de test: FREEFIRE10, WELCOME20, VIP15
                  </p>
                </div>
              </div>


              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="card sticky top-8">
                  <h2 className="text-lg font-semibold text-white mb-6">Résumé de la commande</h2>
                  
                  {/* Items Summary */}
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-neutral-400">
                          {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                        </span>
                        <span className="text-white">{formatXOF(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Sous-total</span>
                      <span className="text-white">{formatXOF(subtotal)}</span>
                    </div>

                    {/* Discount */}
                    {promoApplied && discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Réduction ({promoDiscount * 100}%)</span>
                        <span>-{formatXOF(discount)}</span>
                      </div>
                    )}

                    {/* Shipping */}
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Livraison</span>
                      <span className="text-green-400">Gratuite</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-2xl font-bold text-primary">{formatXOF(total)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={proceedToCheckout}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Procéder au paiement
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* Security Info */}
                  <div className="mt-6 p-4 rounded-lg bg-white/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-neutral-400">
                        <p className="font-medium text-white mb-1">Paiement sécurisé</p>
                        <p>
                          Vos informations de paiement sont protégées. Nous acceptons Mobile Money et les transferts internationaux.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Continue Shopping */}
                  <div className="mt-4 text-center">
                    <Link
                      href="/catalog"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Continuer mes achats
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Products */}
          {cartItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-white mb-6">Vous pourriez aussi aimer</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: '4', name: '5450 Diamants', price: 5000, category: 'DIAMONDS' as const },
                  { id: '8', name: 'Abonnement Mensuel', price: 7200, category: 'SUBSCRIPTION' as const },
                  { id: '11', name: 'Largage Spécial', price: 900, category: 'SPECIAL' as const },
                  { id: '10', name: 'Level Up Pass', price: 300, category: 'PASS' as const },
                ].map((product) => {
                  const categoryConfig = categories[product.category];
                  const CategoryIcon = categoryConfig.icon;
                  const isInCart = cartItems.some(item => item.id === product.id);

                  return (
                    <div
                      key={product.id}
                      className="card p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className={`w-full h-20 rounded-lg ${categoryConfig.bgColor} flex items-center justify-center mb-3`}>
                        <CategoryIcon className={`w-8 h-8 ${categoryConfig.color}`} />
                      </div>
                      <h3 className="font-medium text-white text-sm mb-1">{product.name}</h3>
                      <p className="text-primary font-semibold mb-3">{formatXOF(product.price)}</p>
                      <Button
                        size="sm"
                        variant={isInCart ? "outline" : "default"}
                        className="w-full"
                        onClick={() => {
                          if (!isInCart) {
                            setCartItems(prev => [...prev, {
                              ...product,
                              quantity: 1,
                              bonus: undefined
                            }]);
                            addToast({
                              type: 'success',
                              message: `${product.name} ajouté au panier`,
                            });
                          }
                        }}
                        disabled={isInCart}
                      >
                        {isInCart ? 'Dans le panier' : 'Ajouter'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
