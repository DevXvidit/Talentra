import { create } from 'zustand';
import { User } from '../types';
import { authService, LoginParams, RegisterParams, GoogleLoginParams } from '../services/authService';
import {
  getToken,
  getStoredUser,
  setToken,
  setStoredUser,
  setStoredRole,
  clearAuthStorage,
  setRefreshToken,
} from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginParams) => Promise<void>;
  register: (data: RegisterParams) => Promise<void>;
  googleLogin: (data: GoogleLoginParams) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getToken() || null,
  isAuthenticated: !!getToken(),
  isLoading: false,
  error: null,

  login: async (data: LoginParams) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(data);

      setToken(response.token);
      if (response.refreshToken) setRefreshToken(response.refreshToken);

      // Fetch full user profile (includes profileCompletionPercentage, isProfileComplete, etc.)
      let fullUser = response.user;
      try {
        const meResponse = await authService.getMe();
        fullUser = meResponse.user;
      } catch {
        // fallback to login response user
      }

      setStoredUser(fullUser);
      setStoredRole(fullUser.role);

      set({
        user: fullUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      });
      throw error;
    }
  },

  register: async (data: RegisterParams) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(data);

      setToken(response.token);
      if (response.refreshToken) setRefreshToken(response.refreshToken);

      let fullUser = response.user;
      try {
        const meResponse = await authService.getMe();
        fullUser = meResponse.user;
      } catch {
        // fallback to register response user
      }

      setStoredUser(fullUser);
      setStoredRole(fullUser.role);

      set({
        user: fullUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Registration failed',
      });
      throw error;
    }
  },

  googleLogin: async (data: GoogleLoginParams) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.googleLogin(data);

      setToken(response.token);
      if (response.refreshToken) setRefreshToken(response.refreshToken);

      let fullUser = response.user;
      try {
        const meResponse = await authService.getMe();
        fullUser = meResponse.user;
      } catch {
        // fallback to google login response user
      }

      setStoredUser(fullUser);
      setStoredRole(fullUser.role);

      set({
        user: fullUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Google login failed',
      });
      throw error;
    }
  },

  logout: () => {
    clearAuthStorage();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await authService.getMe();

      setStoredUser(response.user);
      setStoredRole(response.user.role);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      clearAuthStorage();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (user: User) => {
    setStoredUser(user);
    set({ user });
  },
}));
