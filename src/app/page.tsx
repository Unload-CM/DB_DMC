'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // 클라이언트 사이드에서 리디렉션 강제 실행
    router.replace('/auth/login');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-6 max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DMC ERP</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">리디렉션 중...</p>
      </div>
    </div>
  );
}
