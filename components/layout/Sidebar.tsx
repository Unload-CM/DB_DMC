'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import {
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronLeftIcon,
  CogIcon,
  HomeIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTranslation } from '../../hooks';
import LanguageSwitcher from '../../components/LanguageSwitcher';

interface SideBarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase.auth]);

  // 아이콘 클래스
  const iconClasses = 'h-6 w-6';

  // 네비게이션 메뉴 항목
  const menuItems = [
    {
      name: t('sidebar.dashboard'),
      href: '/dashboard',
      icon: <HomeIcon className={iconClasses} />,
    },
    {
      name: t('sidebar.inventory'),
      href: '/dashboard/inventory',
      icon: <ArchiveBoxIcon className={iconClasses} />,
    },
    {
      name: t('sidebar.purchase'),
      href: '/dashboard/purchase',
      icon: <ShoppingCartIcon className={iconClasses} />,
    },
    {
      name: t('sidebar.production'),
      href: '/dashboard/production',
      icon: <CogIcon className={iconClasses} />,
    },
    {
      name: t('sidebar.shipping'),
      href: '/dashboard/shipping',
      icon: <TruckIcon className={iconClasses} />,
    },
    {
      name: t('sidebar.settings'),
      href: '/dashboard/settings',
      icon: <CogIcon className={iconClasses} />,
    },
  ];

  // 관리자 메뉴 항목
  const adminMenuItems = [
    {
      name: t('sidebar.admin_panel'),
      href: '/dashboard/admin',
      icon: <ShieldCheckIcon className={iconClasses} />,
    },
  ];

  // 링크가 현재 활성화 되어 있는지 확인
  const isLinkActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="relative">
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed left-0 top-0 z-50 h-full transform bg-white shadow-xl transition-transform duration-300 dark:bg-gray-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-0 lg:translate-x-0 lg:transition-width lg:duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        }`}
      >
        {/* 사이드바 헤더 */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="DMC Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <span
              className={`${
                isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'
              } overflow-hidden text-xl font-semibold transition-all duration-200 dark:text-white`}
            >
              DMC ERP
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:block"
          >
            <ChevronLeftIcon
              className={`h-6 w-6 transform transition-transform duration-200 ${
                isSidebarOpen ? '' : 'rotate-180'
              }`}
            />
          </button>
        </div>

        {/* 사이드바 링크 섹션 */}
        <div className="h-[calc(100vh-7rem)] overflow-y-auto px-3 py-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                    isLinkActive(item.href)
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : ''
                  }`}
                >
                  {item.icon}
                  <span
                    className={`${
                      isSidebarOpen ? 'ml-3 opacity-100' : 'w-0 opacity-0'
                    } whitespace-nowrap transition-all duration-200`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* 사용자가 관리자인 경우 관리자 섹션 표시 */}
          {user?.user_metadata?.role === 'admin' && (
            <Fragment>
              <div
                className={`${
                  isSidebarOpen ? 'opacity-100' : 'opacity-0'
                } my-4 h-px bg-gray-200 transition-opacity duration-200 dark:bg-gray-700`}
              ></div>
              <ul className="space-y-2">
                {adminMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                        isLinkActive(item.href)
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                          : ''
                      }`}
                    >
                      {item.icon}
                      <span
                        className={`${
                          isSidebarOpen ? 'ml-3 opacity-100' : 'w-0 opacity-0'
                        } whitespace-nowrap transition-all duration-200`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Fragment>
          )}
        </div>

        {/* 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-gray-200 bg-white px-3 py-4 dark:border-gray-700 dark:bg-gray-800">
          {/* 언어 선택기 */}
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} ml-2`}>
            <LanguageSwitcher />
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowRightOnRectangleIcon className={iconClasses} />
            <span
              className={`${
                isSidebarOpen ? 'ml-3 opacity-100' : 'w-0 opacity-0'
              } whitespace-nowrap transition-all duration-200`}
            >
              {t('sidebar.logout')}
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 토글 버튼 */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-30 rounded-md bg-white p-2 shadow-md dark:bg-gray-800 lg:hidden"
      >
        <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default SideBar; 