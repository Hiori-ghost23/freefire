import { apiClient } from './client';
import type { 
  UserLogin,
  UserCreate,
  TokenResponse,
  CatalogItemResponse,
  TournamentResponse,
  TournamentCreate,
  TournamentRegistrationRequest,
  TournamentRegistrationResponse,
  CreateOrderRequest,
  OrderResponse,
  CheckoutRequest,
  CheckoutResponse,
  PaymentResponse,
  MethodsResponse,
  EntryFeeResponse,
  HealthResponse,
  SuccessResponse,
  User
} from '@/types/api';

// ============================================================================
// SERVICES D'AUTHENTIFICATION (alignés avec /auth/*)
// ============================================================================

export const authAPI = {
  // POST /auth/login
  login: async (data: UserLogin): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // POST /auth/register 
  register: async (data: UserCreate): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // GET /auth/me
  me: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // POST /auth/logout
  logout: async (): Promise<SuccessResponse> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // POST /auth/verify-email
  verifyEmail: async (token: string): Promise<SuccessResponse> => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // POST /auth/forgot-password
  forgotPassword: async (email: string): Promise<SuccessResponse> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // POST /auth/reset-password
  resetPassword: async (token: string, password: string): Promise<SuccessResponse> => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// ============================================================================
// SERVICES DU CATALOGUE (alignés avec /catalog/*)
// ============================================================================

export const catalogAPI = {
  // GET /catalog
  getItems: async (): Promise<CatalogItemResponse[]> => {
    const response = await apiClient.get('/catalog');
    return response.data;
  },

  // GET /catalog/{id}
  getItem: async (id: string): Promise<CatalogItemResponse> => {
    const response = await apiClient.get(`/catalog/${id}`);
    return response.data;
  },

  // Note: La route /catalog/types n'existe pas encore côté backend
  // Pour l'instant, on peut filtrer côté client ou créer la route backend
  getTypes: async (): Promise<string[]> => {
    // Pour l'instant, retourner les types connus
    // TODO: Créer la route backend /catalog/types si nécessaire
    return ['DIAMONDS', 'SUBSCRIPTION', 'PASS', 'SPECIAL'];
  },
};

// ============================================================================
// SERVICES DES COMMANDES (alignés avec /orders/*)
// ============================================================================

export const orderAPI = {
  // POST /orders
  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  // GET /orders/mine (mes commandes)
  getMy: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get('/orders/mine');
    return response.data;
  },

  // GET /orders/{order_code}
  getById: async (orderCode: string): Promise<OrderResponse> => {
    const response = await apiClient.get(`/orders/${orderCode}`);
    return response.data;
  },
};

// ============================================================================
// SERVICES DES PAIEMENTS (alignés avec /payments/*)
// ============================================================================

export const paymentAPI = {
  // POST /payments/checkout
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await apiClient.post('/payments/checkout', data);
    return response.data;
  },

  // GET /payments/{id}
  getById: async (id: string): Promise<PaymentResponse> => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  // GET /payments/methods?country=XX
  getMethods: async (country: string): Promise<MethodsResponse> => {
    const response = await apiClient.get(`/payments/methods`, { params: { country } });
    return response.data;
  },

  // POST /payments/{payment_id}/proof (upload de preuve)
  uploadProof: async (paymentId: string, file: File): Promise<SuccessResponse> => {
    const formData = new FormData();
    formData.append('proof_file', file);
    
    const response = await apiClient.post(`/payments/${paymentId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET /payments (mes paiements)
  getMy: async (): Promise<PaymentResponse[]> => {
    const response = await apiClient.get('/payments');
    return response.data;
  },
};

// ============================================================================
// SERVICES DES TOURNOIS (alignés avec /tournaments/*)
// ============================================================================

export const tournamentAPI = {
  // GET /tournaments (tournois publics)
  getPublic: async (params?: {
    mode?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<TournamentResponse[]> => {
    const response = await apiClient.get('/tournaments', { params });
    return response.data;
  },

  // GET /tournaments/{id}
  getById: async (id: string): Promise<TournamentResponse> => {
    const response = await apiClient.get(`/tournaments/${id}`);
    return response.data;
  },

  // POST /tournaments (créer un tournoi)
  create: async (data: TournamentCreate): Promise<TournamentResponse> => {
    const response = await apiClient.post('/tournaments', data);
    return response.data;
  },

  // GET /tournaments/my (mes tournois)
  getMy: async (): Promise<TournamentResponse[]> => {
    const response = await apiClient.get('/tournaments/my');
    return response.data;
  },

  // POST /tournaments/{tournament_id}/register (s'inscrire à un tournoi)
  register: async (tournamentId: string, data: TournamentRegistrationRequest): Promise<TournamentRegistrationResponse> => {
    const response = await apiClient.post(`/tournaments/${tournamentId}/register`, data);
    return response.data;
  },

  // GET /tournaments/my/registrations (mes inscriptions)
  getMyRegistrations: async (): Promise<TournamentRegistrationResponse[]> => {
    const response = await apiClient.get('/tournaments/my/registrations');
    return response.data;
  },
};

// ============================================================================
// SERVICES DES FRAIS D'INSCRIPTION
// ============================================================================

export const entryFeeAPI = {
  // GET /entry-fees
  getAll: async (): Promise<EntryFeeResponse[]> => {
    const response = await apiClient.get('/entry-fees');
    return response.data;
  },
};

// ============================================================================
// SERVICES GÉNÉRIQUES
// ============================================================================

export const systemAPI = {
  // GET /health
  health: async (): Promise<HealthResponse> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // GET / (root)
  root: async (): Promise<HealthResponse> => {
    const response = await apiClient.get('/');
    return response.data;
  },

  // Test de connexion
  testConnection: async (): Promise<boolean> => {
    try {
      await systemAPI.root();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },
};

// Export groupé pour faciliter l'utilisation
export const api = {
  auth: authAPI,
  catalog: catalogAPI,
  orders: orderAPI,
  payments: paymentAPI,
  tournaments: tournamentAPI,
  entryFees: entryFeeAPI,
  system: systemAPI,
};

export default api;
