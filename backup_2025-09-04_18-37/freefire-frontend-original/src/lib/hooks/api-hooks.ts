import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, catalogService, tournamentsService } from '@/lib/api/services';
import { LoginFormData, RegisterFormData } from '@/lib/validations/auth';
import { setStorageItem, removeStorageItem } from '@/lib/utils';

// Auth Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginFormData) =>
      authService.login(credentials),
    onSuccess: (data) => {
      setStorageItem('freefire_token', data.access_token);
      queryClient.setQueryData(['user'], data.user);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register(data),
    onError: (error) => {
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
  });
};

// Catalog Hooks
export const useCatalog = () => {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: catalogService.getAll,
  });
};

export const useCatalogItem = (id: string) => {
  return useQuery({
    queryKey: ['catalog', id],
    queryFn: () => catalogService.getItem(id),
    enabled: !!id,
  });
};

// Tournament Hooks
export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: tournamentsService.getAll,
  });
};

export const useTournament = (id: number) => {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentsService.getById(id),
    enabled: !!id,
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
