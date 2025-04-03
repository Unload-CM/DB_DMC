'use client';

import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 배경 패턴 효과 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      
      {/* 장식용 블러 요소들 */}
      <div className="fixed top-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-600/20 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[30%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] dark:bg-purple-600/20 pointer-events-none" />
      
      <Sidebar />
      
      <main className="relative md:ml-20 lg:ml-64 min-h-screen pt-16 md:pt-4 px-4 md:px-6 pb-6">
        {/* 헤더 (모바일) */}
        <header className="md:pl-64 sticky top-0 z-10 md:hidden flex items-center h-16 bg-white dark:bg-gray-900 px-4 shadow">
          <span className="text-xl font-bold">DMC ERP</span>
        </header>
        
        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6 md:pl-64 pt-16 md:pt-6">
          <div className="max-w-full mx-auto">
            {/* 페이지 헤더 */}
            <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">대시보드</h1>
                
                {/* 오른쪽 영역: 검색, 알림 등 */}
                <div className="flex items-center space-x-2">
                  {/* 검색 */}
                  <div className="relative hidden sm:block">
                    <input
                      type="text"
                      placeholder="검색어를 입력하세요..."
                      className="w-64 py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </span>
                  </div>
                  
                  {/* 알림 아이콘 */}
                  <NotificationBell />

                  {/* 사용자 프로필 (생략) */}
                </div>
              </div>
            </div>

            {/* 실제 페이지 콘텐츠 */}
            {children}
          </div>
        </main>
      </main>

      <style jsx global>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        
        @media (prefers-color-scheme: dark) {
          .bg-grid-pattern {
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          }
        }
      `}</style>
    </div>
  );
} 