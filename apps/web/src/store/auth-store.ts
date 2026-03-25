import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        // Sync token to cookie for Middleware visibility with stricter security
        Cookies.set('auth_token', token, { 
          expires: 1, 
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });
        set({ user, token });
      },
      logout: () => {
        Cookies.remove('auth_token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
