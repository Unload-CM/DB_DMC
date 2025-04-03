// @ts-ignore
import en from '../locales/en.json';
// @ts-ignore
import ko from '../locales/ko.json';
// @ts-ignore
import th from '../locales/th.json';

export type Language = 'en' | 'ko' | 'th';
const translations = { en, ko, th };

/**
 * 주어진 언어와 키에 따라 번역된 문자열을 반환합니다.
 * @param lang 언어 코드 ('en', 'ko', 'th')
 * @param key 번역 키 (점 표기법을 사용하여 중첩된 객체에 접근 가능)
 * @param defaultValue 번역이 없을 경우 반환할 기본값 (선택사항)
 */
export const getTranslation = (
  lang: Language, 
  key: string, 
  defaultValue: string = key
): string => {
  try {
    const keys = key.split('.');
    let value: any = translations[lang];

    // 중첩된 객체 탐색 (예: 'inventory.tab.in')
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return typeof value === 'string' ? value : defaultValue;
  } catch (error) {
    console.error(`Translation error for key: ${key}`, error);
    return defaultValue;
  }
}; 