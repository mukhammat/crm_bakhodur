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
      
      // Register for push notifications after login
      try {
        console.log('[AuthStore] Attempting to get FCM token after login...');
        const { getFCMToken, sendTokenToBackend } = await import('../lib/notifications');
        const token = await getFCMToken();
        console.log('[AuthStore] FCM token result:', token ? 'Token received' : 'No token');
        if (token) {
          console.log('[AuthStore] Sending FCM token to backend...');
          const saved = await sendTokenToBackend(token);
          console.log('[AuthStore] Token save result:', saved ? 'Success' : 'Failed');
        } else {
          console.warn('[AuthStore] FCM token not available. Check console for details.');
        }
      } catch (error) {
        console.error('[AuthStore] Error registering for push notifications:', error);
      }
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
      
      // Register for push notifications after fetching user
      try {
        console.log('[AuthStore] Attempting to get FCM token on fetchUser...');
        const { getFCMToken, sendTokenToBackend } = await import('../lib/notifications');
        const fcmToken = await getFCMToken();
        console.log('[AuthStore] FCM token result:', fcmToken ? 'Token received' : 'No token');
        if (fcmToken) {
          console.log('[AuthStore] Sending FCM token to backend...');
          const saved = await sendTokenToBackend(fcmToken);
          console.log('[AuthStore] Token save result:', saved ? 'Success' : 'Failed');
        } else {
          console.warn('[AuthStore] FCM token not available. Check console for details.');
        }
      } catch (error) {
        console.error('[AuthStore] Error registering for push notifications:', error);
      }
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

