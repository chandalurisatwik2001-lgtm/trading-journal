import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import KPIGrid from './KPIGrid';
import { TrafficChart, ErrorChart, SystemChart } from './Charts';
import ActivityFeed from './ActivityFeed';
import SystemHealthPanel from './SystemHealth';
import { useWebSocket } from '../../hooks/useWebSocket';

const Dashboard: React.FC = () => {
  const { data, status } = useWebSocket();
  const [prevMetrics, setPrevMetrics] = useState<any>(null);
  const prevRef = useRef<any>(null);

  useEffect(() => {
    if (data?.metrics && prevRef.current) {
      setPrevMetrics(prevRef.current);
    }
    if (data?.metrics) {
      prevRef.current = { ...data.metrics };
    }
  }, [data?.metrics]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center" data-testid="dashboard-loading">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0033FF]/30 border-t-[#0033FF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#666] text-sm font-mono">Initializing streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="dashboard-page">
      <Header wsStatus={status} />
      <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-[1920px] mx-auto">
        {/* KPI Cards */}
        <KPIGrid metrics={data.metrics} prevMetrics={prevMetrics} />

        {/* Charts + Activity Feed Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Traffic Chart - spans 3 cols */}
          <div className="lg:col-span-3">
            <TrafficChart history={data.history} />
          </div>
          {/* System Health - spans 1 col */}
          <div className="lg:col-span-1">
            <SystemHealthPanel system={data.system} />
          </div>
        </div>

        {/* Error Chart + System Chart + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1">
            <ErrorChart history={data.history} />
          </div>
          <div className="lg:col-span-1">
            <SystemChart history={data.history} />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed activities={data.activities} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
