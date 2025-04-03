'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguageStore } from '../store/language';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language } = useLanguageStore();

  // 기본 언어 설정
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // 로그인 페이지인 경우 배경색을 회색으로 설정
  const isLoginPage = pathname === '/login' || pathname === '/register';
  const backgroundClass = isLoginPage ? 'bg-gray-100' : 'bg-white';

  return (
    <html lang={language}>
      <body className={`${inter.className} ${backgroundClass} h-screen`}>
        {children}
      </body>
    </html>
  );
} 