'use client';

import { useLanguageStore } from '../store/language';
import { getTranslation } from '../utils/getTranslation';

/**
 * useTranslation 훅은 현재 선택된 언어를 기반으로 번역된 텍스트를 가져오는 기능을 제공합니다.
 * @returns { t } - t 함수는 번역 키를 받아 번역된 텍스트를 반환합니다.
 */
export const useTranslation = () => {
  const { language } = useLanguageStore();

  /**
   * 번역 키를 받아 현재 선택된 언어에 대응하는 번역을 반환합니다.
   * @param key 번역 키 (점 표기법을 사용하여 중첩된 객체에 접근 가능)
   * @param defaultValue 번역이 없을 경우 반환할 기본값 (선택사항)
   */
  const t = (key: string, defaultValue?: string) => {
    return getTranslation(language, key, defaultValue);
  };

  return { t, language };
}; 