import axios from 'axios';

const baseURL =
  typeof window === 'undefined'
    ? process.env.API_INTERNAL_URL || 'http://api:3001'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL });

// Attach token from Zustand persist storage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('auth-storage');
      const token = stored ? JSON.parse(stored)?.state?.token : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore parse errors
    }
  }
  return config;
});

// Fix #4: Global response error handler — extract backend message for display
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred';
    // Attach a normalized message so callers can use: err.displayMessage
    error.displayMessage = message;
    return Promise.reject(error);
  }
);

export default api;
