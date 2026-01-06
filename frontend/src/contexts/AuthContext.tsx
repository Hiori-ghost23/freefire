'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/apiServices';
import { useToast } from '@/components/ui/toast';
import type { User, UserLogin, UserCreate, TokenResponse } from '@/types/api';

// Types pour l'état d'authentification
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Types pour les actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Interface du contexte
interface AuthContextType {
  state: AuthState;
  login: (credentials: UserLogin) => Promise<boolean>;
  register: (userData: UserCreate) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

// État initial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer pour gérer l'état
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    default:
      return state;
  }
};

// Utilitaires pour localStorage
const getStoredAuth = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };
  
  try {
    const token = localStorage.getItem('freefire_token');
    const userStr = localStorage.getItem('freefire_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return { user, token };
  } catch (error) {
    console.error('Error parsing stored auth:', error);
    return { user: null, token: null };
  }
};

const setStoredAuth = (user: User, token: string) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('freefire_token', token);
  localStorage.setItem('freefire_user', JSON.stringify(user));
};

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('freefire_token');
  localStorage.removeItem('freefire_user');
};

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider du contexte
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const { addToast } = useToast();

  // Initialisation - récupérer l'auth depuis localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const { user, token } = getStoredAuth();
      
      if (user && token) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        
        // Optionnel: vérifier que le token est toujours valide
        try {
          const currentUser = await authAPI.me();
          dispatch({
            type: 'UPDATE_USER',
            payload: currentUser
          });
        } catch (error) {
          console.warn('Token expired, clearing auth');
          dispatch({ type: 'AUTH_LOGOUT' });
          clearStoredAuth();
        }
      }
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials: UserLogin): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response: TokenResponse = await authAPI.login(credentials);
      const { access_token, user } = response;

      // Stocker l'authentification
      setStoredAuth(user, access_token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: access_token }
      });

      addToast({
        type: 'success',
        title: 'Connexion réussie',
        message: `Bienvenue ${user.email} !`,
      });

      return true;
    } catch (error: any) {
      // Handle validation errors from Pydantic (422)
      let errorMessage = 'Erreur de connexion';
      
      const detail = error?.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        errorMessage = detail.msg || detail.message || JSON.stringify(detail);
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });

      addToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: errorMessage,
      });

      return false;
    }
  };

  // Fonction d'inscription
  const register = async (userData: UserCreate): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response: TokenResponse = await authAPI.register(userData);
      const { access_token, user } = response;

      // Stocker l'authentification
      setStoredAuth(user, access_token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: access_token }
      });

      addToast({
        type: 'success',
        title: 'Inscription réussie',
        message: `Bienvenue ${user.email} !`,
      });

      return true;
    } catch (error: any) {
      // Handle validation errors from Pydantic (422)
      let errorMessage = 'Erreur d\'inscription';
      
      const detail = error?.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors are arrays of objects
        errorMessage = detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        errorMessage = detail.msg || detail.message || JSON.stringify(detail);
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });

      addToast({
        type: 'error',
        title: 'Erreur d\'inscription',
        message: errorMessage,
      });

      return false;
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      // Appeler l'API de logout (optionnel)
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }

    // Nettoyer l'état local
    dispatch({ type: 'AUTH_LOGOUT' });
    clearStoredAuth();

    addToast({
      type: 'info',
      title: 'Déconnexion',
      message: 'Vous avez été déconnecté avec succès.',
    });

    // Rediriger vers la page de connexion
    router.push('/login');
  };

  // Fonction pour nettoyer les erreurs
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Fonction pour mettre à jour l'utilisateur
  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('freefire_user', JSON.stringify(user));
    }
  };

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook pour vérifier si l'utilisateur est connecté
export const useRequireAuth = (): AuthContextType => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.state.isLoading && !auth.state.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.state.isAuthenticated, auth.state.isLoading, router]);

  return auth;
};

export default AuthContext;
