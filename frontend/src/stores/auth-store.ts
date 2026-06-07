import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { useCartStore } from './cart-store';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setTokens: (tokens: { accessToken: string; refreshToken: string; role?: string }) => void;
  setRole: (role: string | null) => void;
  clearSession: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const getCookieOptions = (expires: number) => ({
  expires,
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      hasHydrated: false,
      setTokens: (tokens) => {
        // Update cookies for Server-side Next.js Middleware/Server Components
        Cookies.set('accessToken', tokens.accessToken, getCookieOptions(7));
        Cookies.set('refreshToken', tokens.refreshToken, getCookieOptions(30));
        if (tokens.role) {
          Cookies.set('role', tokens.role, getCookieOptions(7));
        }
        
        set((state) => ({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          role: tokens.role !== undefined ? tokens.role : state.role,
          isAuthenticated: true,
        }));
      },
      setRole: (role) => {
        if (role) {
          Cookies.set('role', role, getCookieOptions(7));
        } else {
          Cookies.remove('role');
        }
        set({ role });
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
      clearSession: () => {
        // Clear cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('role');
        
        // Clear cart store and localStorage
        useCartStore.getState().clearCart();
        
        set({
          accessToken: null,
          refreshToken: null,
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'hh-education-auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (null as any))),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
