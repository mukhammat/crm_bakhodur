import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Универсальное хранилище, которое использует:
 * - SecureStore для iOS/Android (безопасное хранилище)
 * - localStorage для веб (так как SecureStore не поддерживается)
 */
class Storage {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.warn('SecureStore error:', error);
        return null;
      }
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.warn('SecureStore error:', error);
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn('SecureStore error:', error);
      }
    }
  }
}

export const storage = new Storage();

