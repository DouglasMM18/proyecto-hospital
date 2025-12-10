import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import type { LoginCredentials, AuthTokens, DecodedToken } from '../types/models';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rol: string | null;
  username: string | null;
  login: (credentials: LoginCredentials) => Promise<string | null>;
  logout: () => void;
  checkAuth: () => void;
  getRol: () => string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
  rol: null,
  username: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthTokens>('/api/token/', credentials);
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Decodificar token para obtener rol
      const decoded: DecodedToken = jwtDecode(access);
      
      set({ 
        isAuthenticated: true, 
        isLoading: false,
        rol: decoded.rol,
        username: decoded.username,
      });
      
      return decoded.rol; // Retornamos el rol para redirigir
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const message = err.response?.data?.detail || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ isAuthenticated: false, rol: null, username: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        set({ 
          isAuthenticated: true, 
          rol: decoded.rol,
          username: decoded.username,
        });
      } catch {
        set({ isAuthenticated: false, rol: null, username: null });
      }
    } else {
      set({ isAuthenticated: false, rol: null, username: null });
    }
  },

  getRol: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.rol;
      } catch {
        return null;
      }
    }
    return null;
  },
}));