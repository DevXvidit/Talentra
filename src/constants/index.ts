import { Platform } from 'react-native';

export * from './screens';
export * from './jobs';
export * from './theme';
export * from './onboarding';
export * from './images';

import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

export const API_BASE_URL = ENV_API_BASE_URL || 'https://talentra-backend-7mg5.onrender.com/api/v1';

export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  ROLE: 'role',
} as const;

export const USER_ROLES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
} as const;

export const AUTH_PROVIDERS = {
  GOOGLE: 'Google',
  LINKEDIN: 'LinkedIn',
} as const;
