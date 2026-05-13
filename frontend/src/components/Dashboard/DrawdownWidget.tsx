import React from 'react';

const DrawdownWidget: React.FC = () => (
  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center h-64">
    <div className="text-lg font-bold mb-2 text-gray-700">Drawdown</div>
    <div className="flex items-center justify-center flex-col gap-2 h-full">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" fill="#E5E7EB"/>
        </svg>
      </div>
      <div className="text-gray-400 text-sm mt-2">No drawdown data to show here</div>
    </div>
  </div>
);

export default DrawdownWidget;
