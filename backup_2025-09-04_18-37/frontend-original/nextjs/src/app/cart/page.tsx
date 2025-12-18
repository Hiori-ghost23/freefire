'use client';

import React from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CartItemComponent } from '@/components/cart/CartItem';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useCart } from '@/hooks/useCart';
import { useCartAPI } from '@/hooks/useCartAPI';

// Mock data for development/testing
const mockCartItems = [
  {
    id: '1',
    name: 'Pack Diamants Premium',
    description: '2180 diamants + 200 bonus',
    category: 'FreeFire - Recharge instantanée',
    price: 15999,
    status: 'purchased' as const,
    imageEmoji: '💎',
    imageGradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
  },
  {
    id: '2',
    name: 'Pass Elite Saison',
    description: 'Saison 2024 - Récompenses exclusives',
    category: 'FreeFire - Pass de bataille',
    price: 8500,
    status: 'pending' as const,
    imageEmoji: '🎖️',
    imageGradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
  },
  {
    id: '3',
    name: 'Bundle Armes Légendaires',
    description: 'Pack 5 skins d\'armes épiques',
    category: 'FreeFire - Objets cosmétiques',
    price: 12000,
    status: 'delivered' as const,
    imageEmoji: '🔫',
    imageGradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
  },
  {
    id: '4',
    name: 'Tenue Dragon Noir',
    description: 'Ensemble complet 4 pièces',
    category: 'FreeFire - Édition limitée',
    price: 7500,
    status: 'purchased' as const,
    imageEmoji: '👕',
    imageGradient: 'bg-gradient-to-br from-orange-500/20 to-red-500/20'
  }
];

export default function CartPage() {
  const router = useRouter();
  
  // Option 1: Use local state management (current)
  const { items, orderSummary, removeItem, isRemoving, isEmpty, addItem } = useCart();
  
  // Option 2: Use API-based cart management (uncomment to switch)
  // const { 
  //   items, 
  //   total, 
  //   itemCount, 
  //   isEmpty, 
  //   removeFromCart, 
  //   isRemovingItem, 
  //   isLoading 
  // } = useCartAPI();
  
  // Calculate order summary for API version
  // const orderSummary = React.useMemo(() => {
  //   const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  //   const shipping = 0;
  //   const tax = Math.round(subtotal * 0.1667);
  //   return {
  //     subtotal,
  //     itemCount: items.length,
  //     shipping,
  //     tax,
  //     total: subtotal + shipping + tax
  //   };
  // }, [items]);

  // Initialize with mock data if cart is empty (for development)
  React.useEffect(() => {
    if (isEmpty && process.env.NODE_ENV === 'development') {
      mockCartItems.forEach(item => addItem(item));
    }
  }, [isEmpty, addItem]);

  const handleContinueShopping = () => {
    router.push('/catalog'); // Redirect to catalog page
  };

  const handleProceedToPayment = () => {
    // TODO: Implement payment flow
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Mon panier</h1>
          </div>

          {isEmpty ? (
            <EmptyCart onContinueShopping={handleContinueShopping} />
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    isRemoving={isRemoving(item.id)}
                  />
                ))}
              </div>

              {/* Order Summary */}
              <OrderSummary data={orderSummary} />

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="flex-1 inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Continuer mes achats
                </Button>
                
                <Button 
                  onClick={handleProceedToPayment}
                  className="flex-1 inline-flex items-center justify-center gap-2"
                  disabled={isEmpty}
                >
                  <CreditCard size={20} />
                  Procéder au paiement
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
