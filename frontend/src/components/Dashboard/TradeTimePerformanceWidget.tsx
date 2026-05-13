import React from 'react';

const TradeTimePerformanceWidget: React.FC = () => (
  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center h-64">
    <div className="text-lg font-bold mb-4 text-gray-700">Trade time performance</div>
    <div className="flex flex-col justify-center items-center h-full">
      <div className="flex gap-2 items-end mb-4">
        <div className="w-8 h-12 bg-gray-200 rounded"></div>
        <div className="w-8 h-20 bg-gray-200 rounded"></div>
        <div className="w-8 h-16 bg-gray-200 rounded"></div>
      </div>
      <div className="text-gray-400 text-sm text-center">Not enough performance data yet</div>
    </div>
  </div>
);

export default TradeTimePerformanceWidget;
