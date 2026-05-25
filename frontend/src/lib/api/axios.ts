import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const data = response.data;
        if (data && data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;
          
          useAuthStore.getState().setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });

          processQueue(null, newAccessToken);
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
