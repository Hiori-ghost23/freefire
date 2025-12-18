import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/api';

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
  }
};

export const catalogService = {
  getAll: async () => {
    const response = await apiClient.get('/catalog');
    return response.data;
  },
  
  getItem: async (id: string) => {
    const response = await apiClient.get(`/catalog/${id}`);
    return response.data;
  }
};

export const tournamentsService = {
  getAll: async () => {
    const response = await apiClient.get('/tournaments');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await apiClient.get(`/tournaments/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/tournaments', data);
    return response.data;
  }
};
