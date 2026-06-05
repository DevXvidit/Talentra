import { create } from 'zustand';
import { storage } from '../utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'app_theme_preference';

const getInitialTheme = (): ThemeMode => {
  const storedTheme = storage.getString(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    return storedTheme;
  }
  return 'light'; 
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme: ThemeMode) => {
    storage.set(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
}));
