import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      useAuthStore.getState().clearSession();
      if (typeof window !== 'undefined') {
        const callbackUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.href = `/login?callbackUrl=${callbackUrl}`;
      }
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });

      const data = response.data;
      if (data && data.success) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;
        
        useAuthStore.getState().setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        return newAccessToken;
      } else {
        throw new Error('Refresh token response success is false');
      }
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      if (typeof window !== 'undefined') {
        const callbackUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.href = `/login?callbackUrl=${callbackUrl}`;
      }
      throw refreshError;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to manage API envelopes and perform token rotation
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true) {
      return response;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    const serverError = error.response?.data?.error;
    const errorCode = serverError?.code;
    const isTokenExpired = errorCode === 'ACCESS_TOKEN_EXPIRED';
    
    if (error.response?.status === 401 && isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (serverError) {
      return Promise.reject({
        ...error,
        message: serverError.message || error.message,
        code: serverError.code || 'UNKNOWN_ERROR',
        details: serverError.details || null,
      });
    }

    return Promise.reject(error);
  }
);
