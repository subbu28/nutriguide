import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/index.js';
import { api } from '../lib/api.js';
import { mockApi } from '../lib/mockApi.js';

// Use mock API if backend is unavailable
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const apiClient = USE_MOCK ? mockApi : api;

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        apiClient.setToken(token);
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(email, password);
          set({ 
            user: response.user, 
            token: response.token, 
            isLoading: false,
            isAuthenticated: true 
          });
          apiClient.setToken(response.token);
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(email, password, name);
          set({ 
            user: response.user, 
            token: response.token, 
            isLoading: false,
            isAuthenticated: true 
          });
          apiClient.setToken(response.token);
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
          apiClient.setToken(null);
        }
      },

      fetchUser: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        apiClient.setToken(token);
        set({ isLoading: true });
        
        try {
          const user = await apiClient.getMe();
          set({ user, isLoading: false, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isLoading: false, isAuthenticated: false });
          apiClient.setToken(null);
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiClient.updateProfile(data);
          set({ user: { ...get().user!, ...user }, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: !!state.token }),
    }
  )
);
