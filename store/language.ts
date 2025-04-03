import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'en' | 'ko' | 'th';
  setLanguage: (lang: 'en' | 'ko' | 'th') => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ko', // 기본 언어를 한국어로 설정
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'language-storage', // localStorage에 저장될 키 이름
    }
  )
); 