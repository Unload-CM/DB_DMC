import React from 'react';

interface CategoryData {
  name: string;
  value: number;
}

interface InventoryCategoryChartProps {
  data: CategoryData[];
}

const InventoryCategoryChart: React.FC<InventoryCategoryChartProps> = ({ data }) => {
  // 데이터가 없는 경우
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 dark:text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

  // 간단한 파이 차트를 위한 색상 배열
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
    '#14B8A6', // teal-500
    '#F97316', // orange-500
    '#06B6D4', // cyan-500
  ];

  // 총 합계 계산
  const total = data.reduce((sum, category) => sum + category.value, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        {/* 단순 막대 차트 */}
        <div className="w-full">
          <div className="h-full flex flex-col justify-center">
            {data.map((category, index) => {
              const percentage = Math.round((category.value / total) * 100);
              
              return (
                <div key={index} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* 범례 */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((category, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryCategoryChart; 