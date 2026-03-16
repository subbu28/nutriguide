import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import { wsClient } from '../lib/websocket';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email, password) => {
        const { user, token } = await api.login({ email, password });
        set({ user, isAuthenticated: true });
        
        // Connect WebSocket after login
        const families = await api.getFamilies();
        wsClient.connect(user.id, families.families.map((f: any) => f.id));
      },

      register: async (email, password, name) => {
        const { user } = await api.register({ email, password, name });
        set({ user, isAuthenticated: true });
        wsClient.connect(user.id, []);
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
          // Ignore API errors during logout - still clear local state
        }
        wsClient.disconnect();
        // Clear persisted storage
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const { user } = await api.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
          
          // Connect WebSocket
          const families = await api.getFamilies();
          wsClient.connect(user.id, families.families.map((f: any) => f.id));
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateProfile: async (data) => {
        const { user } = await api.updateProfile(data);
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
