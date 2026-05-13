import React from 'react';

// MetricCard Component
const MetricCard: React.FC<{
  label: string;
  value: string;
  subtitle?: string;
  showProgress?: boolean;
  progress?: number;
  color?: 'blue' | 'gray';
  showBar?: boolean;
  icon?: string;
}> = ({ label, value, subtitle, showProgress, progress = 0, color = 'blue', showBar, icon }) => {
  const strokeColor = color === 'blue' ? '#3b82f6' : '#6b7280';

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      {showProgress && (
        <div className="mt-3 flex justify-center">
          <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16">
              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={strokeColor}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(progress / 100) * 176} 176`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      )}
      {showBar && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-2 bg-green-500 rounded"></div>
          <div className="flex-1 h-2 bg-red-500 rounded"></div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
