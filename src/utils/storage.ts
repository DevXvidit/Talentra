import { createMMKV } from 'react-native-mmkv';
import { STORAGE_KEYS, USER_ROLES } from '../constants';
import { User, UserRole } from '../types';

let localInstance: any;
try {
  localInstance = createMMKV({ id: 'talentra-storage' });
} catch (e) {
  console.warn('MMKV native module not found, using memory fallback:', e);
  const memoryCache = new Map<string, string>();
  localInstance = {
    set: (key: string, value: string | number | boolean) => {
      memoryCache.set(key, String(value));
    },
    getString: (key: string) => {
      return memoryCache.get(key);
    },
    remove: (key: string) => {
      memoryCache.delete(key);
    },
  };
}

export const storage = localInstance;

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    return storage.getString(key) || null;
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const getToken = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.JWT_TOKEN);
};

export const setToken = (token: string): void => {
  storage.set(STORAGE_KEYS.JWT_TOKEN, token);
};

export const removeToken = (): void => {
  storage.remove(STORAGE_KEYS.JWT_TOKEN);
};

export const getRefreshToken = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setRefreshToken = (token: string): void => {
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const removeRefreshToken = (): void => {
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
};

export const getStoredUser = (): User | null => {
  const raw = storage.getString(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  storage.remove(STORAGE_KEYS.USER);
};

export const getStoredRole = (): UserRole | null => {
  const role = storage.getString(STORAGE_KEYS.ROLE);
  return (role === USER_ROLES.CANDIDATE || role === USER_ROLES.RECRUITER) ? role as UserRole : null;
};

export const setStoredRole = (role: UserRole): void => {
  storage.set(STORAGE_KEYS.ROLE, role);
};

export const removeStoredRole = (): void => {
  storage.remove(STORAGE_KEYS.ROLE);
};

export const clearAuthStorage = (): void => {
  removeToken();
  removeRefreshToken();
  removeStoredUser();
  removeStoredRole();
};

export const getHasCompletedOnboarding = (): boolean => {
  return storage.getString('has_completed_onboarding') === 'true';
};

export const setHasCompletedOnboarding = (val: boolean): void => {
  storage.set('has_completed_onboarding', val ? 'true' : 'false');
};

