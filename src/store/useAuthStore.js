import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user:  null,
  token: null,
  login:  (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));