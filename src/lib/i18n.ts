import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koCommon from '../../public/locales/ko/common.json';
import enCommon from '../../public/locales/en/common.json';
import thCommon from '../../public/locales/th/common.json';

// 브라우저의 로컬 스토리지에서 언어 설정 가져오기
const getStoredLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'ko';
  }
  return 'ko';
};

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
    }
  });

export default i18n; 