import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koCommon from '../../public/locales/ko/common.json';
import enCommon from '../../public/locales/en/common.json';
import thCommon from '../../public/locales/th/common.json';

// 브라우저의 로컬 스토리지에서 언어 설정 가져오기
const getStoredLanguage = () => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('language');
    if (storedLang && ['ko', 'en', 'th'].includes(storedLang)) {
      return storedLang;
    }
    
    // 브라우저 언어 감지
    const browserLang = navigator.language.substring(0, 2);
    if (['ko', 'en', 'th'].includes(browserLang)) {
      return browserLang;
    }
  }
  return 'ko'; // 기본값
};

// i18next 초기화
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: {
        common: koCommon
      },
      en: {
        common: enCommon
      },
      th: {
        common: thCommon
      }
    },
    lng: getStoredLanguage(),
    fallbackLng: 'ko',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    },
    react: {
      useSuspense: false, // React Suspense와 함께 사용 시 문제 방지
    }
  });

// 언어 변경 이벤트 리스너
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = ['ar', 'he'].includes(lng) ? 'rtl' : 'ltr';
    localStorage.setItem('language', lng);
  });
}

export default i18n; 