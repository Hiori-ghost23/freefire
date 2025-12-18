import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  authService, 
  catalogService, 
  tournamentsService, 
  ordersService, 
  paymentsService 
} from '@/lib/api/services';
import { LoginFormData, RegisterFormData } from '@/lib/validations/auth';
import { setStorageItem, removeStorageItem, getStorageItem } from '@/lib/utils';
import type { LoginResponse, User } from '@/types/api';

// ============ AUTH HOOKS ============
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginFormData) =>
      authService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      setStorageItem('freefire_token', data.access_token);
      queryClient.setQueryData(['user'], data.user);
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register(data),
    onError: (error: Error) => {
      console.error('Register error:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      removeStorageItem('freefire_token');
      queryClient.clear();
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getProfile,
    retry: false,
    enabled: !!getStorageItem('freefire_token'),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => authService.updateProfile(data),
    onSuccess: (data: User) => {
      queryClient.setQueryData(['user'], data);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      authService.changePassword(data),
  });
};

// ============ CATALOG HOOKS ============
export const useCatalog = () => {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: catalogService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCatalogItem = (id: string) => {
  return useQuery({
    queryKey: ['catalog', id],
    queryFn: () => catalogService.getItem(id),
    enabled: !!id,
  });
};

// ============ TOURNAMENT HOOKS ============
export const useTournaments = (params?: { mode?: string; status?: string }) => {
  return useQuery({
    queryKey: ['tournaments', params],
    queryFn: () => tournamentsService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTournament = (id: number) => {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentsService.getById(id),
    enabled: !!id,
  });
};

export const useMyTournaments = () => {
  return useQuery({
    queryKey: ['tournaments', 'mine'],
    queryFn: tournamentsService.getMyTournaments,
    enabled: !!getStorageItem('freefire_token'),
  });
};

export const useMyCreatedTournaments = () => {
  return useQuery({
    queryKey: ['tournaments', 'created'],
    queryFn: tournamentsService.getMyCreatedTournaments,
    enabled: !!getStorageItem('freefire_token'),
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => tournamentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

export const useRegisterTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tournamentId, data }: { tournamentId: number; data: any }) =>
      tournamentsService.register(tournamentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

// ============ ORDERS HOOKS ============
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { catalog_item_id: string; uid_freefire: string; quantity?: number }) =>
      ordersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useMyOrders = () => {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: ordersService.getMyOrders,
    enabled: !!getStorageItem('freefire_token'),
  });
};

export const useOrder = (code: string) => {
  return useQuery({
    queryKey: ['orders', code],
    queryFn: () => ordersService.getOrder(code),
    enabled: !!code,
  });
};

// ============ PAYMENTS HOOKS ============
export const usePaymentMethods = (country: string) => {
  return useQuery({
    queryKey: ['payments', 'methods', country],
    queryFn: () => paymentsService.getMethods(country),
    enabled: !!country,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: (data: { order_code: string; method: string; phone?: string }) =>
      paymentsService.checkout(data),
  });
};

export const useUploadProof = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, file }: { paymentId: string; file: File }) =>
      paymentsService.uploadProof(paymentId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const usePaymentStatus = (paymentId: string) => {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: () => paymentsService.getPaymentStatus(paymentId),
    enabled: !!paymentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
