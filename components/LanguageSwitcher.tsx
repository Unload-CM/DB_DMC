'use client';

import { useLanguageStore } from '../store/language';
import { Language } from '../utils/getTranslation';
import { useEffect, useState } from 'react';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { language, setLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 렌더링을 위한 처리
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  if (!mounted) {
    return null;
  }

  return (
    <select
      value={language}
      onChange={handleChange}
      className={`rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/30 ${className}`}
    >
      <option value="en">English</option>
      <option value="ko">한국어</option>
      <option value="th">ภาษาไทย</option>
    </select>
  );
};

export default LanguageSwitcher; 