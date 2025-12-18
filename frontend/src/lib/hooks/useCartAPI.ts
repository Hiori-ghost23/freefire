import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  cartService, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  RemoveFromCartRequest 
} from '@/services/cartService';
import { useToast } from '@/hooks/useToast';

export const CART_QUERY_KEY = ['cart'];

export const useCartAPI = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get cart data
  const {
    data: cartData,
    isLoading,
    error
  } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: cartService.getCart,
    staleTime: 30000, // 30 seconds
    retry: 3
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast({
        title: 'Article ajouté',
        description: 'L\'article a été ajouté à votre panier',
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error'
      });
    }
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: cartService.updateCartItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast({
        title: 'Article mis à jour',
        description: 'La quantité a été modifiée',
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error'
      });
    }
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: cartService.removeFromCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast({
        title: 'Article supprimé',
        description: 'L\'article a été supprimé de votre panier',
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error'
      });
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast({
        title: 'Panier vidé',
        description: 'Tous les articles ont été supprimés',
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error'
      });
    }
  });

  // Convenience methods
  const addToCart = (data: AddToCartRequest) => {
    addToCartMutation.mutate(data);
  };

  const updateCartItem = (data: UpdateCartItemRequest) => {
    updateCartItemMutation.mutate(data);
  };

  const removeFromCart = (itemId: string) => {
    removeFromCartMutation.mutate({ itemId });
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  return {
    // Data
    cartData,
    items: cartData?.data?.items || [],
    total: cartData?.data?.total || 0,
    itemCount: cartData?.data?.itemCount || 0,
    isEmpty: !cartData?.data?.items?.length,

    // Loading states
    isLoading,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingItem: updateCartItemMutation.isPending,
    isRemovingItem: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,

    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,

    // Error
    error: error?.message
  };
};

// Hook for cart count only (lighter weight)
export const useCartCount = () => {
  return useQuery({
    queryKey: ['cartCount'],
    queryFn: cartService.getCartCount,
    staleTime: 30000
  });
};
