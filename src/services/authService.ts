import { apiClient } from './apiClient';
import { User, UserRole } from '../types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  refreshToken?: string;
  user: User;
}

export interface GetMeResponse {
  success: boolean;
  user: User;
}

export interface LoginParams {
  email: string;
  password?: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface GoogleLoginParams {
  idToken: string;
  role?: UserRole;
}

export const authService = {
  login: async (data: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/login', data);
    return {
      success: response.data.success,
      message: response.data.message,
      token: response.data.accessToken || response.data.token,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    };
  },

  register: async (data: RegisterParams): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/register', data);
    return {
      success: response.data.success,
      message: response.data.message,
      token: response.data.accessToken || response.data.token,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    };
  },

  googleLogin: async (data: GoogleLoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/google', data);
    return {
      success: response.data.success,
      message: response.data.message,
      token: response.data.accessToken || response.data.token,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    };
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return {
      success: response.data.success,
      user: response.data.data,
    };
  },
};
