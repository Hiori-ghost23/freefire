import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/useToast';
import { CartItem } from '@/components/cart/CartItem';

// Tax rate (16.67% VAT)
const TAX_RATE = 0.1667;

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Calculate order summary
  const orderSummary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const itemCount = items.length;
    const shipping = 0; // Free shipping
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      itemCount,
      shipping,
      tax,
      total
    };
  }, [items]);

  // Add item to cart
  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      // Check if item already exists
      const exists = prev.some(existingItem => existingItem.id === item.id);
      if (exists) {
        toast({
          title: 'Article déjà dans le panier',
          description: `${item.name} est déjà dans votre panier`,
          variant: 'info'
        });
        return prev;
      }

      toast({
        title: 'Article ajouté',
        description: `${item.name} a été ajouté à votre panier`,
        variant: 'success'
      });

      return [...prev, item];
    });
  }, [toast]);

  // Remove item from cart
  const removeItem = useCallback((itemId: string) => {
    // Find the item to get its name for the toast
    const itemToRemove = items.find(item => item.id === itemId);
    
    // Add to removing set for animation
    setRemovingItems(prev => new Set([...prev, itemId]));

    // Remove after animation delay
    setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== itemId));
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });

      if (itemToRemove) {
        toast({
          title: 'Article supprimé',
          description: `${itemToRemove.name} a été supprimé du panier`,
          variant: 'success'
        });
      }
    }, 300); // Match animation duration
  }, [items, toast]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    setRemovingItems(new Set());
    toast({
      title: 'Panier vidé',
      description: 'Tous les articles ont été supprimés du panier',
      variant: 'success'
    });
  }, [toast]);

  // Update item (for quantity changes, status updates, etc.)
  const updateItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, ...updates }
          : item
      )
    );
  }, []);

  // Get item by ID
  const getItem = useCallback((itemId: string) => {
    return items.find(item => item.id === itemId);
  }, [items]);

  // Check if item is in cart
  const isInCart = useCallback((itemId: string) => {
    return items.some(item => item.id === itemId);
  }, [items]);

  // Check if item is being removed (for animation)
  const isRemoving = useCallback((itemId: string) => {
    return removingItems.has(itemId);
  }, [removingItems]);

  return {
    items,
    orderSummary,
    addItem,
    removeItem,
    clearCart,
    updateItem,
    getItem,
    isInCart,
    isRemoving,
    isEmpty: items.length === 0
  };
};
