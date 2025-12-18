import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type CartItemStatus = 'purchased' | 'pending' | 'delivered';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: CartItemStatus;
  imageEmoji: string;
  imageGradient: string;
}

interface CartItemComponentProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  isRemoving?: boolean;
}

const statusConfig = {
  purchased: {
    label: 'Acheté',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  pending: {
    label: 'En attente',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  delivered: {
    label: 'Livré',
    className: 'bg-green-500/20 text-green-300 border-green-500/30'
  }
};

export const CartItemComponent: React.FC<CartItemComponentProps> = ({ 
  item, 
  onRemove, 
  isRemoving = false 
}) => {
  const status = statusConfig[item.status];

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 ${
      isRemoving ? 'opacity-0 transform -translate-x-5' : ''
    }`}>
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <div className={`w-16 h-16 ${item.imageGradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl">{item.imageEmoji}</span>
        </div>
        
        {/* Product Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <p className="text-sm text-neutral-400">{item.description}</p>
          <p className="text-sm text-neutral-500">{item.category}</p>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${status.className}`}>
            {status.label}
          </span>
          
          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-lg">{item.price.toLocaleString()},00</p>
            <p className="text-xs text-neutral-400">XOF</p>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
