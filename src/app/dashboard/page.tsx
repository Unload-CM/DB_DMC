'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItem, PurchaseRequest, ProductionPlan, ShippingPlan } from '@/types';
import { 
  FaBox, FaShoppingCart, FaIndustry, FaTruck, FaBell, FaCalendarCheck, FaExclamationTriangle,
  FaChevronRight, FaChartLine, FaSearch, FaRegCalendarAlt
} from 'react-icons/fa';

export default function Dashboard() {
  const [inventorySummary, setInventorySummary] = useState<{ count: number, lowStock: number }>({ count: 0, lowStock: 0 });
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [shippingPlans, setShippingPlans] = useState<ShippingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greetingMessage, setGreetingMessage] = useState('');

  useEffect(() => {
    // 시간에 따른 인사말 설정
    const hours = new Date().getHours();
    let greeting = '';
    
    if (hours < 12) {
      greeting = '좋은 아침입니다';
    } else if (hours < 18) {
      greeting = '안녕하세요';
    } else {
      greeting = '좋은 저녁입니다';
    }
    
    setGreetingMessage(greeting);

    async function fetchDashboardData() {
      setIsLoading(true);

      try {
        // 재고 상태 요약 조회
        const { count: itemCount } = await supabase
          .from('inventory')
          .select('*', { count: 'exact' });

        const { data: lowStockItems } = await supabase
          .from('inventory')
          .select('*')
          .lt('quantity', 10);

        setInventorySummary({
          count: itemCount || 0,
          lowStock: lowStockItems?.length || 0
        });

        // 최근 구매 요청 조회
        const { data: recentPurchaseRequests } = await supabase
          .from('purchase_request')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentPurchaseRequests) {
          setPurchaseRequests(recentPurchaseRequests);
        }

        // 진행 중인 생산 계획 조회
        const { data: ongoingProductionPlans } = await supabase
          .from('production_plan')
          .select('*')
          .eq('status', 'in_progress')
          .order('start_date', { ascending: true })
          .limit(3);

        if (ongoingProductionPlans) {
          setProductionPlans(ongoingProductionPlans);
        }

        // 예정된 출하 계획 조회
        const { data: upcomingShippingPlans } = await supabase
          .from('shipping_plan')
          .select('*')
          .eq('status', 'planned')
          .order('shipping_date', { ascending: true })
          .limit(3);

        if (upcomingShippingPlans) {
          setShippingPlans(upcomingShippingPlans);
        }
      } catch (error) {
        console.error('대시보드 데이터 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <header className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300">{greetingMessage}, 관리자님</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">DMC ERP 시스템 대시보드입니다.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="검색어를 입력하세요" 
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button className="ml-3 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md">
              <FaBell />
            </button>
          </div>
        </div>
      </header>

      {/* 요약 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="총 자재 수" 
          value={inventorySummary.count.toString()} 
          icon={<FaBox className="text-blue-400" size={24} />}
          change="+5.2%"
          changeType="up"
        />
        <DashboardCard 
          title="부족 재고 항목" 
          value={inventorySummary.lowStock.toString()} 
          icon={<FaExclamationTriangle className="text-red-400" size={24} />}
          change="-2.1%"
          changeType="down"
          color="red"
        />
        <DashboardCard 
          title="구매 요청" 
          value={purchaseRequests.length.toString()} 
          icon={<FaShoppingCart className="text-green-400" size={24} />}
          change="+3.8%"
          changeType="up"
          color="green"
        />
        <DashboardCard 
          title="진행 중인 생산" 
          value={productionPlans.length.toString()} 
          icon={<FaIndustry className="text-purple-400" size={24} />}
          change="0%"
          changeType="neutral"
          color="purple"
        />
      </div>

      {/* 정보 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 구매 요청 */}
        <SectionCard 
          title="최근 구매 요청" 
          icon={<FaShoppingCart className="text-green-500" />}
          link="바로가기"
          linkHref="/dashboard/purchase"
        >
          {purchaseRequests.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {purchaseRequests.map((request) => (
                <div key={request.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{request.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      상태: <span className={`${getStatusColor(request.status)}`}>{request.status}</span>
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(request.created_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <FaShoppingCart size={32} className="mb-3 opacity-30" />
              <p>구매 요청이 없습니다.</p>
            </div>
          )}
        </SectionCard>

        {/* 생산 일정 */}
        <SectionCard 
          title="생산 일정" 
          icon={<FaIndustry className="text-purple-500" />}
          link="바로가기"
          linkHref="/dashboard/production"
        >
          {productionPlans.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {productionPlans.map((plan) => (
                <div key={plan.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900 dark:text-white">{plan.title}</p>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full dark:bg-purple-900 dark:text-purple-300">
                      진행중
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <FaRegCalendarAlt className="mr-1" size={12} />
                    {new Date(plan.start_date).toLocaleDateString()} ~ {new Date(plan.end_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <FaIndustry size={32} className="mb-3 opacity-30" />
              <p>진행 중인 생산 계획이 없습니다.</p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* 출하 일정 */}
      <SectionCard 
        title="출하 예정" 
        icon={<FaTruck className="text-blue-500" />}
        link="바로가기"
        linkHref="/dashboard/shipping"
      >
        {shippingPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingPlans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-gray-900 dark:text-white">{plan.title}</p>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FaRegCalendarAlt className="mr-2" />
                    {new Date(plan.shipping_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FaTruck className="mr-2" />
                    {plan.destination}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <FaTruck size={32} className="mb-3 opacity-30" />
            <p>예정된 출하 계획이 없습니다.</p>
          </div>
        )}
      </SectionCard>
    </div>
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
  const colorMap = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-800/50',
    red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/30 dark:to-red-800/30 dark:border-red-800/50',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/30 dark:to-green-800/30 dark:border-green-800/50',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:border-yellow-800/50',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 dark:border-purple-800/50',
  };

  const changeColorMap = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className={`relative overflow-hidden p-6 rounded-xl shadow-md border backdrop-blur-sm ${colorMap[color]}`}>
      <div className="absolute -right-4 -bottom-4 opacity-20 text-gray-500 dark:text-gray-300">
        <div className="text-6xl">{icon}</div>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
          <div className={`flex items-center text-xs ${changeColorMap[changeType]}`}>
            {changeType === 'up' && <span className="mr-1">↑</span>}
            {changeType === 'down' && <span className="mr-1">↓</span>}
            {change}
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="mr-3">
            {icon}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {link && linkHref && (
          <a href={linkHref} className="text-sm text-blue-600 hover:text-blue-800 flex items-center dark:text-blue-400 dark:hover:text-blue-300">
            {link}
            <FaChevronRight size={12} className="ml-1" />
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'approved':
      return 'text-green-600 dark:text-green-400';
    case 'rejected':
      return 'text-red-600 dark:text-red-400';
    case 'completed':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '오늘';
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString();
  }
} 