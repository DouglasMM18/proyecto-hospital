import { create } from 'zustand';
import api from '../api/axios';
import type { LoginCredentials, AuthTokens } from '../types/models';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthTokens>('/api/token/', credentials);
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      set({ isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: unknown) {
  const err = error as { response?: { data?: { detail?: string } } };
  const message = err.response?.data?.detail || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('access_token');
    set({ isAuthenticated: !!token });
  },
}));