'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ShoppingBagIcon,
  ExclamationCircleIcon, 
  TruckIcon,
  CogIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// 임시 인터페이스 정의
interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// 필요한 컴포넌트들 직접 구현
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* 사이드바 영역 */}
        <aside className="hidden w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:flex md:flex-col">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
            <span className="text-lg font-bold text-primary">DMC ERP</span>
          </div>
          <nav className="flex flex-col p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
              대시보드
            </Link>
            <Link href="/dashboard/inventory" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              재고 관리
            </Link>
            <Link href="/dashboard/purchase" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              구매 관리
            </Link>
            <Link href="/dashboard/production" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              생산 관리
            </Link>
            <Link href="/dashboard/shipping" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              출하 관리
            </Link>
          </nav>
        </aside>
        
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// DashboardCard 컴포넌트 직접 구현
const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  trend = '', 
  description = '', 
  loading = false 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend?: string; 
  description?: string; 
  loading?: boolean; 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex justify-between">
        <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className={`text-sm flex items-center ${
            trend === 'positive' ? 'text-green-500' : 
            trend === 'negative' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {trend === 'positive' && '↑'}
            {trend === 'negative' && '↓'}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

// InventoryCategoryChart 컴포넌트 직접 구현
const InventoryCategoryChart = ({ data }: { data: Array<{name: string, value: number}> }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">카테고리 데이터가 없습니다</p>
      </div>
    );
  }

  // 간단한 차트 표현 (실제 구현에서는 Chart.js 등을 사용)
  return (
    <div className="h-full flex items-end justify-around pt-6">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="bg-primary hover:bg-primary-dark transition-all rounded-t-lg w-12" 
            style={{ 
              height: `${Math.max(20, Math.min(100, item.value * 10))}px`,
              backgroundColor: `hsl(${index * 30}, 70%, 60%)`
            }}>
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 max-w-[60px] truncate text-center">
            {item.name}
          </p>
          <p className="text-xs text-gray-500">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

// 간단한 번역 훅 구현
const useTranslation = () => {
  // 실제 구현에서는 i18n 라이브러리 사용
  const translations: Record<string, string> = {
    'common.good_morning': '좋은 아침입니다',
    'common.hello': '안녕하세요',
    'common.good_evening': '좋은 저녁입니다',
    'common.no_data': '데이터가 없습니다',
    'dashboard.erp_system': 'DMC ERP 시스템',
    'dashboard.welcome_message': '오늘의 대시보드 요약을 확인하세요',
    'dashboard.total_inventory_items': '총 재고 품목',
    'dashboard.low_stock_items': '부족 재고 품목',
    'dashboard.ongoing_production': '진행중인 생산',
    'dashboard.upcoming_shipments': '예정된 출하',
    'dashboard.inventory_by_category_view': '카테고리별 재고',
    'dashboard.go_to_inventory': '재고 보기',
    'dashboard.recent_purchase_requests': '최근 구매 요청',
    'dashboard.view_all': '모두 보기',
    'dashboard.shortcut': '바로가기',
    'sidebar.inventory': '재고',
    'sidebar.purchase': '구매',
    'sidebar.production': '생산',
    'sidebar.shipping': '출하',
    'sidebar.settings': '설정',
    'inventory.no_category_data': '카테고리 데이터가 없습니다'
  };

  return {
    t: (key: string) => translations[key] || key
  };
};

// 대시보드 컴포넌트 정의
export default function DashboardPage() {
  const { t } = useTranslation();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // 재고 항목 데이터 가져오기
    const fetchInventoryItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setInventoryItems(data as InventoryItem[]);
        }
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryItems();
  }, [supabase]);

  // 현재 시간에 따라 인사말 생성
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('common.good_morning');
    } else if (hour < 18) {
      return t('common.hello');
    } else {
      return t('common.good_evening');
    }
  };

  // 재고 수량이 적은 항목 필터링
  const lowStockItems = inventoryItems.filter((item) => item.quantity < 10);

  // 카테고리별 재고 데이터 계산
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {};
    
    inventoryItems.forEach((item) => {
      if (item.category) {
        if (categories[item.category]) {
          categories[item.category]++;
        } else {
          categories[item.category] = 1;
        }
      }
    });
    
    return Object.keys(categories).map((category) => ({
      name: category,
      value: categories[category],
    }));
  };

  const categoryData = getCategoryData();

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.erp_system')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {getGreeting()} - {t('dashboard.welcome_message')}
          </p>
        </div>

        {/* 요약 카드 섹션 */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title={t('dashboard.total_inventory_items')}
            value={inventoryItems.length.toString()}
            icon={<ShoppingBagIcon className="h-6 w-6" />}
            trend=""
            description=""
            loading={loading}
          />
          <DashboardCard
            title={t('dashboard.low_stock_items')}
            value={lowStockItems.length.toString()}
            icon={<ExclamationCircleIcon className="h-6 w-6" />}
            trend={lowStockItems.length > 5 ? 'negative' : 'neutral'}
            description=""
            loading={loading}
          />
          <DashboardCard
            title={t('dashboard.ongoing_production')}
            value="3"
            icon={<CogIcon className="h-6 w-6" />}
            trend="positive"
            description=""
            loading={false}
          />
          <DashboardCard
            title={t('dashboard.upcoming_shipments')}
            value="2"
            icon={<TruckIcon className="h-6 w-6" />}
            trend="neutral"
            description=""
            loading={false}
          />
        </div>

        {/* 차트 및 데이터 섹션 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 카테고리별 재고 차트 */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('dashboard.inventory_by_category_view')}
              </h2>
              <Link
                href="/dashboard/inventory"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {t('dashboard.go_to_inventory')}
              </Link>
            </div>
            <div className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : categoryData.length > 0 ? (
                <InventoryCategoryChart data={categoryData} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('inventory.no_category_data')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 최근 구매 요청 */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('dashboard.recent_purchase_requests')}
              </h2>
              <Link
                href="/dashboard/purchase"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {t('dashboard.view_all')}
              </Link>
            </div>
            {/* 구매 요청 목록은 추후 구현 */}
            <div className="h-80 rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-700">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('common.no_data')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  구매 요청 기능 개발 예정
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 바로가기 버튼 */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.shortcut')}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <Link
              href="/dashboard/inventory"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <ShoppingBagIcon className="mb-2 h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.inventory')}
              </span>
            </Link>
            <Link
              href="/dashboard/purchase"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <ShoppingBagIcon className="mb-2 h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.purchase')}
              </span>
            </Link>
            <Link
              href="/dashboard/production"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <CogIcon className="mb-2 h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.production')}
              </span>
            </Link>
            <Link
              href="/dashboard/shipping"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <TruckIcon className="mb-2 h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.shipping')}
              </span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <CogIcon className="mb-2 h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.settings')}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 