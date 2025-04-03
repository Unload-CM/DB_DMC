'use client';

import { ReactNode, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState({ ko: '대시보드', en: 'Dashboard', th: 'แดชบอร์ด' });
  
  // 현재 경로에 따라 페이지 타이틀 설정
  useEffect(() => {
    if (pathname.includes('/dashboard/inventory')) {
      setPageTitle({ 
        ko: '재고관리', 
        en: 'Inventory', 
        th: 'การจัดการสินค้าคงคลัง' 
      });
    } else if (pathname.includes('/dashboard/purchase')) {
      setPageTitle({ 
        ko: '구매관리', 
        en: 'Purchase', 
        th: 'การจัดซื้อ' 
      });
    } else if (pathname.includes('/dashboard/production')) {
      setPageTitle({ 
        ko: '생산관리', 
        en: 'Production', 
        th: 'การผลิต' 
      });
    } else if (pathname.includes('/dashboard/shipping')) {
      setPageTitle({ 
        ko: '출하관리', 
        en: 'Shipping', 
        th: 'การจัดส่ง' 
      });
    } else if (pathname.includes('/dashboard/settings')) {
      setPageTitle({ 
        ko: '설정', 
        en: 'Settings', 
        th: 'การตั้งค่า' 
      });
    } else if (pathname.includes('/dashboard/admin')) {
      setPageTitle({ 
        ko: '관리자 패널', 
        en: 'Admin Panel', 
        th: 'แผงผู้ดูแลระบบ' 
      });
    } else {
      setPageTitle({ 
        ko: '대시보드', 
        en: 'Dashboard', 
        th: 'แดชบอร์ด' 
      });
    }
  }, [pathname]);

  // 현재 언어에 맞는 타이틀과 보조 타이틀 가져오기
  const getCurrentTitle = () => {
    const currentLang = i18n.language.substring(0, 2);
    const mainLang = currentLang === 'ko' ? 'ko' : (currentLang === 'en' ? 'en' : 'th');
    const subLang = mainLang === 'ko' ? 'th' : (mainLang === 'en' ? 'th' : 'en');
    
    return {
      main: pageTitle[mainLang as keyof typeof pageTitle] || pageTitle.en,
      sub: pageTitle[subLang as keyof typeof pageTitle] || pageTitle.en
    };
  };
  
  const { main: mainTitle, sub: subTitle } = getCurrentTitle();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 사이드바 */}
      <Sidebar />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 ml-0 md:ml-20 lg:ml-64 min-h-screen">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center h-16 px-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                {mainTitle}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{subTitle}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="py-2 pl-10 pr-4 w-full md:w-64 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
              
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 