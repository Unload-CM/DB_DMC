'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobeAsia, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../lib/i18n';

interface LanguageSelectorProps {
  isCollapsed: boolean;
}

export default function LanguageSelector({ isCollapsed }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ko');

  // 초기 언어 설정 로드
  useEffect(() => {
    setCurrentLang(i18n.language.substring(0, 2));
  }, [i18n.language]);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' }
  ];

  const changeLanguage = (locale: string) => {
    // 현재 언어와 같으면 변경하지 않음
    if (locale === currentLang) {
      setIsOpen(false);
      return;
    }

    i18n.changeLanguage(locale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', locale);
      // 언어 변경 후 상태 업데이트
      setCurrentLang(locale);
    }
    setIsOpen(false);

    // 언어 변경 후 페이지 새로고침 (옵션)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const getCurrentLanguageFlag = () => {
    const lang = languages.find(lang => lang.code === currentLang);
    return lang ? lang.flag : '🌐';
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find(lang => lang.code === currentLang);
    return lang ? lang.name : 'Language';
  };

  return (
    <div className="relative mt-2 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors
          ${isCollapsed ? 'justify-center' : 'justify-between'}
          text-white bg-blue-700/30 hover:bg-blue-700/50`}
        aria-label="언어 선택"
      >
        <div className="flex items-center">
          <span className="mr-2">{getCurrentLanguageFlag()}</span>
          {!isCollapsed && (
            <span className="truncate">{getCurrentLanguageName()}</span>
          )}
        </div>
        {!isCollapsed && (
          isOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${isCollapsed ? 'left-full ml-2' : 'inset-x-0'} bottom-full mb-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-200 dark:border-gray-700`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors
                ${currentLang === lang.code ? 'bg-blue-100 dark:bg-blue-900/40 font-medium' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <span className="mr-2">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 