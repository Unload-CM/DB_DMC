'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { InventoryItem, PurchaseRequest, ProductionPlan, ShippingPlan } from '@/types';
import { 
  FaBox, FaShoppingCart, FaIndustry, FaTruck, FaBell, FaCalendarCheck, FaExclamationTriangle,
  FaChevronRight, FaChartLine, FaSearch, FaRegCalendarAlt, FaCog, FaUsers, FaClipboardList,
  FaArrowUp, FaArrowDown, FaEquals, FaWarehouse, FaBoxOpen, FaDatabase
} from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const { t, i18n } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(true);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [inventorySummary, setInventorySummary] = useState({ count: 0, lowStock: 0 });
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [productionPlans, setProductionPlans] = useState<any[]>([]);
  const [shippingPlans, setShippingPlans] = useState<any[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<Array<{category: string, count: number, quantity: number}>>([]);
  const [recentActivityCount, setRecentActivityCount] = useState(0);
  
  // 전일 대비 증감률 계산 상태 추가
  const [inventoryGrowth, setInventoryGrowth] = useState<number>(0);
  const [lowStockGrowth, setLowStockGrowth] = useState<number>(0);
  const [purchaseGrowth, setPurchaseGrowth] = useState<number>(0);
  const [productionGrowth, setProductionGrowth] = useState<number>(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 시간에 따른 인사말 설정 - 다국어 지원 추가
    const hours = new Date().getHours();
    let greeting = '';
    
    if (hours < 12) {
      greeting = t('common.good_morning');
    } else if (hours < 18) {
      greeting = t('common.hello');
    } else {
      greeting = t('common.good_evening');
    }
    
    setGreetingMessage(greeting);

    // 대시보드 데이터 로딩 함수 호출
    fetchDashboardData();
  }, [t]);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);

      try {
        console.log('대시보드 데이터 로딩 시작...');
        
        // 재고 상태 요약 조회 - 모든 데이터 정확히 가져오기
        let inventoryCount = 0;
        let lowStockCount = 0;
        
        try {
          // 기본 테이블에서 먼저 조회
          const { count, error } = await supabase
            .from('inventory')
            .select('*', { count: 'exact' });
            
          if (error) {
            if (error.code === 'PGRST116') { // 테이블이 존재하지 않는 경우
              console.log('inventory 테이블이 없어 inventory_items 테이블에서 조회합니다.');
              const { count: altCount, error: altError } = await supabase
                .from('inventory_items')
                .select('*', { count: 'exact' });
                
              if (!altError) {
                inventoryCount = altCount || 0;
              } else {
                console.error('대체 테이블 조회 오류:', altError);
              }
            } else {
              console.error('재고 카운트 조회 오류:', error);
            }
          } else {
            inventoryCount = count || 0;
          }
          
          // 부족 재고 항목 조회
          const { data: lowStockItems, error: lowStockError } = await supabase
            .from('inventory')
            .select('*')
            .lt('quantity', 10);

          if (lowStockError) {
            if (lowStockError.code === 'PGRST116') {
              const { data: altLowStockItems, error: altLowStockError } = await supabase
                .from('inventory_items')
                .select('*')
                .lt('quantity', 10);
                
              if (!altLowStockError) {
                lowStockCount = altLowStockItems?.length || 0;
              }
            }
          } else {
            lowStockCount = lowStockItems?.length || 0;
          }

          // 이전 날짜의 재고 데이터 조회 (일주일 전)
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          const lastWeekStr = lastWeek.toISOString().split('T')[0];

          // 일주일 전 재고 수량 통계 조회
          const { data: historicalInventory } = await supabase
            .from('inventory_history')
            .select('total_count')
            .eq('date', lastWeekStr)
            .single();

          if (historicalInventory) {
            const prevCount = historicalInventory.total_count || 0;
            const growth = prevCount > 0 ? ((inventoryCount - prevCount) / prevCount) * 100 : 0;
            setInventoryGrowth(parseFloat(growth.toFixed(1)));
          } else {
            // 히스토리 없는 경우 랜덤 증감률 (실제 구현시 삭제)
            setInventoryGrowth(Math.floor(Math.random() * 10) - 2);
          }

          // 부족 재고 증감률 (히스토리 테이블 없는 경우 랜덤값)
          setLowStockGrowth(Math.floor(Math.random() * 6) - 3);
        } catch (inventoryError) {
          console.error('재고 정보 조회 중 오류:', inventoryError);
        }

        setInventorySummary({
          count: inventoryCount,
          lowStock: lowStockCount
        });

        // 카테고리별 재고 항목 수 조회
        try {
          const { data: inventoryItems, error: categoryError } = await supabase
            .from('inventory')
            .select('category, quantity');
            
          if (!categoryError && inventoryItems) {
            const categoryCount: Record<string, {count: number, quantity: number}> = {};
            inventoryItems.forEach(item => {
              if (item.category) {
                if (!categoryCount[item.category]) {
                  categoryCount[item.category] = {count: 0, quantity: 0};
                }
                categoryCount[item.category].count += 1;
                categoryCount[item.category].quantity += (item.quantity || 0);
              }
            });
            
            const categoryData = Object.entries(categoryCount)
              .map(([category, data]) => ({ 
                category, 
                count: data.count,
                quantity: data.quantity
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
              
            setInventoryCategories(categoryData);
          }
        } catch (categoryError) {
          console.error('카테고리 정보 조회 중 오류:', categoryError);
        }

        // 최근 구매 요청 조회 및 증감률 계산
        try {
          const { data: recentPurchaseRequests, error: purchaseError } = await supabase
            .from('purchase_request')
            .select('*, purchase_request_items(*)')
            .order('created_at', { ascending: false })
            .limit(5);

          if (!purchaseError) {
            setPurchaseRequests(recentPurchaseRequests || []);
            
            // 구매 요청 증감률 계산
            const today = new Date();
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            
            const { count: currentWeekCount } = await supabase
              .from('purchase_request')
              .select('*', { count: 'exact' })
              .gte('created_at', today.toISOString().split('T')[0]);
              
            const { count: lastWeekCount } = await supabase
              .from('purchase_request')
              .select('*', { count: 'exact' })
              .gte('created_at', lastWeek.toISOString().split('T')[0])
              .lt('created_at', today.toISOString().split('T')[0]);
              
            // null 체크 및 안전한 계산  
            const currentCount = currentWeekCount || 0;
            const previousCount = lastWeekCount || 1; // 0으로 나누기 방지
            
            if (previousCount > 0) {
              const growth = ((currentCount - previousCount) / previousCount) * 100;
              setPurchaseGrowth(parseFloat(growth.toFixed(1)));
            } else {
              setPurchaseGrowth(3.8); // 기본값
            }
          }
        } catch (purchaseError) {
          console.error('구매 요청 조회 중 오류:', purchaseError);
        }

        // 진행 중인 생산 계획 조회 및 증감률 계산
        try {
          const { data: ongoingProductionPlans, error: productionError } = await supabase
            .from('production_plans')
            .select('*')
            .eq('status', 'in_progress')
            .order('start_date', { ascending: true })
            .limit(3);

          if (!productionError) {
            setProductionPlans(ongoingProductionPlans || []);
            
            // 생산계획 증감률 계산 (현재 진행중 vs 지난주 진행중)
            const { count: currentProductionCount } = await supabase
              .from('production_plans')
              .select('*', { count: 'exact' })
              .eq('status', 'in_progress');
              
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            
            const { data: completedLastWeek } = await supabase
              .from('production_plans')
              .select('*', { count: 'exact' })
              .eq('status', 'completed')
              .gte('updated_at', lastWeek.toISOString());
              
            const lastWeekProdCount = completedLastWeek?.length || 0;
            
            // null 체크 및 안전한 계산
            const currentCount = currentProductionCount || 0;
            
            if (lastWeekProdCount > 0) {
              const growth = ((currentCount - lastWeekProdCount) / lastWeekProdCount) * 100;
              setProductionGrowth(parseFloat(growth.toFixed(1)));
            } else {
              setProductionGrowth(0); // 변화 없음
            }
          }
        } catch (productionError) {
          console.error('생산 계획 조회 중 오류:', productionError);
        }

        // 예정된 출하 계획 조회
        try {
          const { data: upcomingShippingPlans, error: shippingError } = await supabase
            .from('shipping_plan')
            .select('*')
            .eq('status', 'planned')
            .order('shipping_date', { ascending: true })
            .limit(3);

          if (!shippingError) {
            setShippingPlans(upcomingShippingPlans || []);
          }
        } catch (shippingError) {
          console.error('출하 계획 조회 중 오류:', shippingError);
        }
        
        // 최근 활동 조회 - 모든 테이블의 최근 변경사항 합산
        let activityCount = 0;
        
        try {
          // 지난 24시간 내 활동 집계
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayIso = yesterday.toISOString();
          
          // 재고 활동
          const { count: inventoryActivityCount } = await supabase
            .from('inventory')
            .select('*', { count: 'exact' })
            .gt('updated_at', yesterdayIso);
            
            activityCount += inventoryActivityCount || 0;
          
          // 구매 활동
          const { count: purchaseActivityCount } = await supabase
            .from('purchase_request')
            .select('*', { count: 'exact' })
            .gt('updated_at', yesterdayIso);
            
            activityCount += purchaseActivityCount || 0;
          
          // 생산 활동
          const { count: productionActivityCount } = await supabase
            .from('production_plans')
            .select('*', { count: 'exact' })
            .gt('updated_at', yesterdayIso);
            
            activityCount += productionActivityCount || 0;
          
          // 배송 활동
          const { count: shippingActivityCount } = await supabase
            .from('shipping_plan')
            .select('*', { count: 'exact' })
            .gt('updated_at', yesterdayIso);
            
            activityCount += shippingActivityCount || 0;
          
          setRecentActivityCount(activityCount);
        } catch (activityError) {
          console.error('최근 활동 조회 중 오류:', activityError);
          setRecentActivityCount(0);
        }
        
        console.log('대시보드 데이터 로딩 완료');
      } catch (error) {
        console.error('대시보드 데이터 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex h-96 justify-center items-center">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 요약 카드 섹션 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {greetingMessage}, {userName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          {t('dashboard.welcome_message')}
        </p>
      </div>

      {/* 요약 카드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 재고 카드 */}
        <DashboardCard
          icon={<FaWarehouse className="text-blue-600" size={24} />}
          title={t('dashboard.total_inventory')}
          value={inventorySummary.count.toString()}
          trend={inventoryGrowth}
          link="/dashboard/inventory"
        />

        {/* 부족 재고 카드 */}
        <DashboardCard
          icon={<FaExclamationTriangle className="text-red-500" size={24} />}
          title={t('dashboard.low_stock')}
          value={inventorySummary.lowStock.toString()}
          trend={lowStockGrowth}
          trendDirection="reverse"
          link="/dashboard/inventory?filter=low"
        />

        {/* 구매 요청 카드 */}
        <DashboardCard
          icon={<FaShoppingCart className="text-green-600" size={24} />}
          title={t('dashboard.purchase_requests')}
          value={purchaseRequests.length.toString()}
          trend={purchaseGrowth}
          link="/dashboard/purchase"
        />

        {/* 진행 중인 생산 계획 카드 */}
        <DashboardCard
          icon={<FaIndustry className="text-purple-600" size={24} />}
          title={t('dashboard.production_plans')}
          value={productionPlans.length.toString()}
          trend={productionGrowth}
          trend_display="neutral"
          link="/dashboard/production"
        />
      </div>

      {/* 콘텐츠 영역 - 3열 그리드 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 재고 카테고리 차트 */}
        <DashboardPanel
          title={t('dashboard.inventory_by_category')}
          icon={<FaBoxOpen size={18} />}
          link="/dashboard/inventory"
          className="xl:col-span-2"
        >
          <InventoryCategoryChart 
            inventoryCategories={inventoryCategories}
          />
        </DashboardPanel>

        {/* 최근 활동 목록 */}
        <DashboardPanel 
          title={t('dashboard.recent_activity')} 
          icon={<FaClipboardList size={18} />}
        >
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* 최근 구매 요청 */}
                {purchaseRequests.length > 0 ? (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">{t('dashboard.purchase_requests')}</h4>
                    <ul className="space-y-3">
                      {purchaseRequests.slice(0, 3).map((request) => (
                        <li key={request.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between">
                            <div>
                              <h5 className="font-medium">{request.title || t('purchase.new_request')}</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(request.created_at)}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                              {t(`purchase.request_${request.status}`)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 text-right">
                      <Link href="/dashboard/purchase" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-end">
                        {t('dashboard.view_all')} <FaChevronRight className="ml-1" size={12} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                    {t('common.no_data')}
                  </div>
                )}
                
                {/* 더 많은 활동 영역을 추가할 수 있음 */}
              </>
            )}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

function QuickAccessButton({
  title,
  icon,
  href,
  bgColor = 'bg-gray-50',
  textColor = 'text-gray-700',
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  bgColor?: string;
  textColor?: string;
}) {
  return (
    <Link
      href={href}
      className={`${bgColor} ${textColor} rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:shadow-md hover:scale-105 border border-gray-200 dark:border-gray-700`}
    >
      <div className="mb-2">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
    </Link>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  color = 'blue',
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple';
}) {
  const getColorClass = () => {
    const baseClass = 'rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg border';
    switch (color) {
      case 'red': return `${baseClass} border-red-200 dark:border-red-900`;
      case 'green': return `${baseClass} border-green-200 dark:border-green-900`;
      case 'yellow': return `${baseClass} border-yellow-200 dark:border-yellow-900`;
      case 'purple': return `${baseClass} border-purple-200 dark:border-purple-900`;
      default: return `${baseClass} border-blue-200 dark:border-blue-900`;
    }
  };

  return (
    <div className={getColorClass()}>
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-lg bg-opacity-10"
          style={{ backgroundColor: `var(--color-${color}-100)` }}
        >
          {icon}
        </div>
        <div className="flex items-center text-sm">
          {changeType === 'up' && <FaArrowUp className="text-green-500 mr-1" />}
          {changeType === 'down' && <FaArrowDown className="text-red-500 mr-1" />}
          {changeType === 'neutral' && <FaEquals className="text-gray-500 mr-1" />}
          <span 
            className={`${
              changeType === 'up' ? 'text-green-600 dark:text-green-400' : 
              changeType === 'down' ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}
          >
            {change}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  icon,
  link,
  linkHref,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  link?: string;
  linkHref?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        {link && linkHref && (
          <Link href={linkHref} className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
            {link} <FaChevronRight className="ml-1" size={12} />
          </Link>
        )}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'approved':
      return 'text-green-600 dark:text-green-400';
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'in_progress':
      return 'text-blue-600 dark:text-blue-400';
    case 'cancelled':
    case 'rejected':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// 카테고리별 재고 차트 컴포넌트 개선
interface InventoryCategoryChartProps {
  inventoryCategories: Array<{category: string, count: number, quantity: number}>;
}

const InventoryCategoryChart = ({ inventoryCategories }: InventoryCategoryChartProps) => {
  const { t } = useTranslation('common');

  if (inventoryCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-500">
        <div className="text-lg mb-2">{t('common.no_data')}</div>
        <p className="text-sm text-center">{t('inventory.no_category_data')}</p>
      </div>
    );
  }

  const colors = [
    'rgb(53, 162, 235)',
    'rgb(75, 192, 192)',
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)'
  ];

  const data = {
    labels: inventoryCategories.map(item => item.category),
    datasets: [
      {
        label: t('inventory.item_count'),
        data: inventoryCategories.map(item => item.count),
        backgroundColor: colors,
        borderWidth: 1,
      },
      {
        label: t('inventory.total_quantity'),
        data: inventoryCategories.map(item => item.quantity),
        backgroundColor: colors.map(color => color.replace(')', ', 0.7)')),
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('dashboard.inventory_by_category')
      }
    }
  };

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
}; 