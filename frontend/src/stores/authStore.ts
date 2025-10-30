import { create } from 'zustand';
import { User } from '../config/api';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  permissions: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  permissions: [],
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      await apiClient.login({ email, password });
      const user = await apiClient.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      await useAuthStore.getState().fetchPermissions();
      toast.success('Вход выполнен успешно');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка входа');
      throw error;
    }
  },

  logout: () => {
    apiClient.logout();
    set({ user: null, isAuthenticated: false, isLoading: false, permissions: [] });
    toast.success('Выход выполнен');
  },

  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await apiClient.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      await useAuthStore.getState().fetchPermissions();
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false, permissions: [] });
    }
  },

  fetchPermissions: async () => {
    try {
      const res = await apiClient.getMyRolePermissions();
      // res.permissions — массив объектов { permission: { title } }
      set({ permissions: res.permissions.map((p: any) => p.permission?.title) });
    } catch {
      set({ permissions: [] });
    }
  },
}));

