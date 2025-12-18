import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyCartProps {
  onContinueShopping: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onContinueShopping }) => {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart size={32} className="text-neutral-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Votre panier est vide</h3>
      <p className="text-neutral-400 mb-6">Ajoutez des articles pour commencer vos achats FreeFire</p>
      <Button onClick={onContinueShopping} className="px-6 py-3">
        Découvrir le catalogue
      </Button>
    </div>
  );
};
