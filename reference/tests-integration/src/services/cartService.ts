import { apiClient } from '@/lib/api';
import { CartItem } from '@/components/cart/CartItem';

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
  message?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  itemId: string;
}

export const cartService = {
  // Get user's cart
  async getCart(): Promise<CartResponse> {
    try {
      const response = await apiClient.get('/cart');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du panier');
    }
  },

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<CartResponse> {
    try {
      const response = await apiClient.post('/cart/add', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout au panier');
    }
  },

  // Update cart item quantity
  async updateCartItem(data: UpdateCartItemRequest): Promise<CartResponse> {
    try {
      const response = await apiClient.put(`/cart/update/${data.itemId}`, {
        quantity: data.quantity
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  },

  // Remove item from cart
  async removeFromCart(data: RemoveFromCartRequest): Promise<CartResponse> {
    try {
      const response = await apiClient.delete(`/cart/remove/${data.itemId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  },

  // Clear entire cart
  async clearCart(): Promise<CartResponse> {
    try {
      const response = await apiClient.delete('/cart/clear');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du panier');
    }
  },

  // Get cart item count
  async getCartCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get('/cart/count');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du nombre d\'articles');
    }
  }
};
