import { create } from 'zustand';

export const useLangStore = create((set) => ({
  lang: 'English',
  setLang: (lang) => set({ lang }),
}));