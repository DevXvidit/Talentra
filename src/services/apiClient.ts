import axios from 'axios';
import { API_BASE_URL } from '../constants';
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearAuthStorage,
} from '../utils/storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  pendingQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthStorage();
        
        const { useAuthStore } = require('../store/useAuthStore');
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken: string = res.data.accessToken;
        const newRefreshToken: string = res.data.refreshToken;

        setToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        clearAuthStorage();
        const { useAuthStore } = require('../store/useAuthStore');
        useAuthStore.getState().logout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
