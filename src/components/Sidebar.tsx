'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBox, FaShoppingCart, FaIndustry, FaTruck, FaCog, FaTools, FaChartLine, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import '../lib/i18n';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 매 분마다 업데이트
    
    return () => clearInterval(timer);
  }, []);

  // 사용자 정보와 역할 로드
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 사용자 메타데이터에서 역할 확인
          const role = user.user_metadata?.role as 'admin' | 'user' || 'user';
          const name = user.user_metadata?.full_name as string || user.email?.split('@')[0] || '사용자';
          
          setUserRole(role);
          setUserName(name);
          setUserEmail(user.email || '');
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // 메뉴 아이템 정의 (i18n 적용)
  const menuItems = [
    { name: t('sidebar.dashboard'), path: '/dashboard', icon: <FaChartLine size={20} />, roles: ['admin', 'user'] },
    { name: t('sidebar.inventory'), path: '/dashboard/inventory', icon: <FaBox size={20} />, roles: ['admin', 'user'] },
    { name: t('sidebar.purchase'), path: '/dashboard/purchase', icon: <FaShoppingCart size={20} />, roles: ['admin', 'user'] },
    { name: t('sidebar.production'), path: '/dashboard/production', icon: <FaIndustry size={20} />, roles: ['admin', 'user'] },
    { name: t('sidebar.shipping'), path: '/dashboard/shipping', icon: <FaTruck size={20} />, roles: ['admin', 'user'] },
    { name: t('sidebar.settings'), path: '/dashboard/settings', icon: <FaCog size={20} />, roles: ['admin', 'user'] },
    { name: '관리자 패널', path: '/dashboard/admin', icon: <FaTools size={20} />, roles: ['admin'] },
  ];

  // 역할에 따라 필터링된 메뉴 아이템
  const filteredMenuItems = userRole 
    ? menuItems.filter(item => item.roles.includes(userRole))
    : menuItems.filter(item => item.roles.includes('user'));

  // 모바일에서 메뉴 아이템 클릭 시 메뉴 닫기
  const handleMobileMenuItemClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  // 현재 언어에 맞는 날짜 형식 가져오기
  const getLocalizedDate = () => {
    try {
      return currentTime.toLocaleDateString(i18n.language, { weekday: 'long' });
    } catch (error) {
      return currentTime.toLocaleDateString('ko-KR', { weekday: 'long' });
    }
  };

  // 현재 언어에 맞는 시간 형식 가져오기
  const getLocalizedTime = () => {
    try {
      return currentTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <>
      {/* 모바일 메뉴 토글 버튼 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-full bg-blue-600 text-white shadow-lg"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* 배경 오버레이 (모바일) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div 
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white z-30 transition-all duration-300 shadow-2xl
          ${isOpen ? 'w-64' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* 로고 섹션 */}
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          {isOpen ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <FaChartLine className="text-white" size={20} />
              </div>
              <h1 className="ml-3 text-xl font-bold">DMC ERP</h1>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-500 flex items-center justify-center">
              <FaChartLine className="text-white" size={20} />
            </div>
          )}
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block rounded p-1 hover:bg-blue-700"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* 시간 및 정보 섹션 */}
        {isOpen && (
          <div className="p-4 border-b border-blue-700 text-sm text-blue-300">
            <p>{getLocalizedDate()}</p>
            <p className="text-white font-semibold">
              {getLocalizedTime()}
            </p>
          </div>
        )}

        {/* 네비게이션 메뉴 */}
        <nav className="mt-6">
          <ul className="space-y-2 px-2">
            {filteredMenuItems.map((item) => {
              const isActive = pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={handleMobileMenuItemClick}
                    className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-blue-200 hover:bg-blue-700/60'
                      }
                      ${!isOpen && 'justify-center'}`}
                  >
                    <span className="inline-flex items-center justify-center">
                      {item.icon}
                    </span>
                    {isOpen && <span className="ml-3">{item.name}</span>}
                    
                    {/* 활성 메뉴 인디케이터 */}
                    {isActive && isOpen && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-blue-400"></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 언어 선택기 */}
        <div className="px-2 mt-6">
          <LanguageSelector isCollapsed={!isOpen} />
        </div>

        {/* 사용자 프로필 섹션 */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-blue-700">
          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className={`w-full p-4 flex items-center text-blue-200 hover:bg-blue-700/60 transition-colors
              ${!isOpen && 'justify-center'}`}
          >
            <FaSignOutAlt size={20} />
            {isOpen && <span className="ml-3">{t('sidebar.logout')}</span>}
          </button>

          {/* 프로필 정보 */}
          {isOpen && (
            <div className="p-4 border-t border-blue-700">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="font-bold text-lg">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-blue-300">{userEmail}</p>
                  <p className="text-xs mt-1 bg-blue-700/60 px-2 py-0.5 rounded-full inline-block">
                    {userRole === 'admin' ? '관리자' : '일반 사용자'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 