import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL =
  typeof window === 'undefined'
    ? process.env.API_INTERNAL_URL || 'http://api:3001'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL,
  withCredentials: true, // Send HttpOnly cookies automatically
});

// Track whether a token refresh is already in-flight to prevent cascading retries
let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

function notifySubscribers(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

// Global response error handler — normalise backend message and handle 401 with silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Normalise error message for display
    const message =
      (error?.response?.data as any)?.message ||
      error?.message ||
      'An unexpected error occurred';
    (error as any).displayMessage = message;

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
    const isLoginEndpoint = originalRequest?.url?.includes('/auth/login');

    // Don't retry if this is already a refresh/login request or was already retried
    if (!is401 || isRefreshEndpoint || isLoginEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request to retry once it resolves
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push((success: boolean) => {
          if (success) {
            originalRequest._retry = true;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    // First 401 — attempt silent refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      await api.post('/auth/refresh');
      isRefreshing = false;
      notifySubscribers(true);
      // Retry the original request (new access_token cookie is now set by the browser)
      return api(originalRequest);
    } catch {
      isRefreshing = false;
      notifySubscribers(false);
      // Refresh failed — clear state and redirect to login
      if (typeof window !== 'undefined') {
        const { useAuthStore } = await import('@/store/auth-store');
        useAuthStore.getState().logout().catch(() => {});
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  }
);

export default api;
