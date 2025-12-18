import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCartCount } from '@/hooks/useCartAPI';

interface CartBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ 
  className = '', 
  showIcon = true 
}) => {
  const router = useRouter();
  const { data: cartCount, isLoading } = useCartCount();
  const count = cartCount?.count || 0;

  const handleClick = () => {
    router.push('/cart');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`relative p-2 ${className}`}
      disabled={isLoading}
    >
      {showIcon && <ShoppingCart size={20} />}
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
      
      {isLoading && (
        <span className="absolute -top-1 -right-1 bg-neutral-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </span>
      )}
    </Button>
  );
};
