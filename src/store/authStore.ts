// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/user";
import { decodeToken } from "@/components/utils/tokenUtils";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Helper to standardize user object structure
const standardizeUser = (user: any): User | null => {
  if (!user) return null;

  // Ensure user has _id property (might be id in token)
  return {
    ...user,
    _id: user._id || user.id || user.userId || user.user_id,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({
          token,
          user: standardizeUser(user), // Standardize on login
          isAuthenticated: true,
        }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-token",
      partialize: (state) => ({ token: state.token }), // Only store token in localStorage
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          const decodedUser = decodeToken(state.token);
          if (decodedUser) {
            // Update with standardized user info
            state.user = standardizeUser(decodedUser);
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
