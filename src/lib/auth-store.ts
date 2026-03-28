import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conserje } from '@shared/types';
interface AuthState {
  user: Omit<Conserje, 'password'> | null;
  token: string | null;
  setSession: (user: Omit<Conserje, 'password'>, token: string) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);