import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/api';

// ============ AUTH SERVICE ============
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<{ user: User; message: string }> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { current_password: string; new_password: string }): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token });
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/request-reset', { email });
  },
};

// ============ CATALOG SERVICE ============
export const catalogService = {
  getAll: async () => {
    const response = await apiClient.get('/catalog');
    return response.data;
  },
  
  getItem: async (id: string) => {
    const response = await apiClient.get(`/catalog/${id}`);
    return response.data;
  },

  getByCategory: async (category: string) => {
    const response = await apiClient.get(`/catalog?category=${category}`);
    return response.data;
  },
};

// ============ TOURNAMENTS SERVICE ============
export const tournamentsService = {
  getAll: async (params?: { mode?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.mode) queryParams.append('mode', params.mode);
    if (params?.status) queryParams.append('status', params.status);
    const response = await apiClient.get(`/tournaments?${queryParams.toString()}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await apiClient.get(`/tournaments/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/tournaments', data);
    return response.data;
  },

  register: async (tournamentId: number, data: { team_name?: string; code?: string }) => {
    const response = await apiClient.post(`/tournaments/${tournamentId}/register`, data);
    return response.data;
  },

  getMyTournaments: async () => {
    const response = await apiClient.get('/tournaments/mine');
    return response.data;
  },

  getMyCreatedTournaments: async () => {
    const response = await apiClient.get('/tournaments/created');
    return response.data;
  },
};

// ============ ORDERS SERVICE ============
export const ordersService = {
  create: async (data: { catalog_item_id: string; uid_freefire: string; quantity?: number }) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await apiClient.get('/orders/mine');
    return response.data;
  },

  getOrder: async (code: string) => {
    const response = await apiClient.get(`/orders/${code}`);
    return response.data;
  },
};

// ============ PAYMENTS SERVICE ============
export const paymentsService = {
  getMethods: async (country: string) => {
    const response = await apiClient.get(`/payments/methods?country=${country}`);
    return response.data;
  },

  checkout: async (data: { order_code: string; method: string; phone?: string }) => {
    const response = await apiClient.post('/payments/checkout', data);
    return response.data;
  },

  uploadProof: async (paymentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/payments/${paymentId}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPaymentStatus: async (paymentId: string) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  },
};

// ============ ADMIN SERVICE ============
export const adminService = {
  // Users
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Orders
  getPendingOrders: async () => {
    const response = await apiClient.get('/admin/orders/pending');
    return response.data;
  },

  deliverOrder: async (orderCode: string) => {
    const response = await apiClient.post(`/admin/orders/${orderCode}/deliver`);
    return response.data;
  },

  // Payments
  getPendingPayments: async () => {
    const response = await apiClient.get('/admin/payments/pending');
    return response.data;
  },

  validatePayment: async (paymentId: string, approved: boolean) => {
    const response = await apiClient.post(`/admin/payments/${paymentId}/validate`, { approved });
    return response.data;
  },

  // Tournaments
  getPendingTournaments: async () => {
    const response = await apiClient.get('/admin/tournaments/pending');
    return response.data;
  },

  approveTournament: async (tournamentId: number) => {
    const response = await apiClient.post(`/admin/tournaments/${tournamentId}/approve`);
    return response.data;
  },

  // Catalog
  createCatalogItem: async (data: any) => {
    const response = await apiClient.post('/admin/catalog', data);
    return response.data;
  },

  updateCatalogItem: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/catalog/${id}`, data);
    return response.data;
  },

  deleteCatalogItem: async (id: string) => {
    const response = await apiClient.delete(`/admin/catalog/${id}`);
    return response.data;
  },
};
