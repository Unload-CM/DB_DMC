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

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' }
  ];

  const changeLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', locale);
    }
    setIsOpen(false);
  };

  const getCurrentLanguageFlag = () => {
    const lang = languages.find(lang => lang.code === i18n.language.substring(0, 2));
    return lang ? lang.flag : '🌐';
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find(lang => lang.code === i18n.language.substring(0, 2));
    return lang ? lang.name : 'Language';
  };

  return (
    <div className="relative mt-2 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors
          ${isCollapsed ? 'justify-center' : 'justify-between'}
          hover:bg-gray-200 dark:hover:bg-gray-700`}
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
        <div className={`absolute ${isCollapsed ? 'left-full ml-2' : 'inset-x-0'} bottom-full mb-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center w-full px-3 py-2 text-sm text-left
                ${i18n.language.substring(0, 2) === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''}
                hover:bg-gray-200 dark:hover:bg-gray-700`}
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