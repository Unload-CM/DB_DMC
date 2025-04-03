import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral' | '';
  description?: string;
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend = '',
  description = '',
  loading = false
}) => {
  // 트렌드에 따른 색상 변경
  const trendColor = 
    trend === 'positive' 
      ? 'text-green-500 dark:text-green-400' 
      : trend === 'negative' 
        ? 'text-red-500 dark:text-red-400' 
        : 'text-blue-500 dark:text-blue-400';
  
  const trendIcon = 
    trend === 'positive' 
      ? '↑' 
      : trend === 'negative' 
        ? '↓' 
        : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <div className="flex items-end">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${trendColor}`}>
                {trendIcon}
              </span>
            )}
          </div>
        )}
        
        {description && !loading && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard; 