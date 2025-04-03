'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  ShoppingBagIcon,
  ExclamationCircleIcon,
  TruckIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { InventoryItem } from '../../types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardCard from '../../components/dashboard/DashboardCard';
import InventoryCategoryChart from '../../components/dashboard/InventoryCategoryChart';
import Link from 'next/link';
import { useTranslation } from '../../hooks';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
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
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                {t('dashboard.go_to_inventory')}
              </Link>
            </div>
            <div className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                className="text-sm font-medium text-primary hover:text-primary-dark"
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
              <ShoppingBagIcon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.inventory')}
              </span>
            </Link>
            <Link
              href="/dashboard/purchase"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <ShoppingBagIcon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.purchase')}
              </span>
            </Link>
            <Link
              href="/dashboard/production"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <CogIcon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.production')}
              </span>
            </Link>
            <Link
              href="/dashboard/shipping"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <TruckIcon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.shipping')}
              </span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800"
            >
              <CogIcon className="mb-2 h-6 w-6 text-primary" />
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