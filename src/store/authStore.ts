// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { decodeToken } from '@/components/utils/tokenUtils';


interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-token', // Change from 'auth-storage' to 'auth-token'
      partialize: (state) => ({ token: state.token }), // Only store token in localStorage
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          const user = decodeToken(state.token);
          if (user) {
            // Update the state with the decoded user info
            state.user = user;
            state.isAuthenticated = true;
          } else {
            // Token is invalid or expired, clear it
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);