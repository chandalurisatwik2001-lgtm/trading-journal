import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Activity {
  id: string;
  message: string;
  level: string;
  timestamp: string;
  source: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const levelConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  info: {
    icon: <Info size={12} />,
    color: '#0033FF',
    bg: 'rgba(0,51,255,0.1)',
  },
  success: {
    icon: <CheckCircle size={12} />,
    color: '#00FF66',
    bg: 'rgba(0,255,102,0.1)',
  },
  warning: {
    icon: <AlertTriangle size={12} />,
    color: '#E2F13C',
    bg: 'rgba(226,241,60,0.1)',
  },
  error: {
    icon: <AlertCircle size={12} />,
    color: '#FF3B30',
    bg: 'rgba(255,59,48,0.1)',
  },
};

const formatTimestamp = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div
      data-testid="activity-feed"
      className="bg-[#111111] border border-white/10 rounded-sm flex flex-col h-full"
    >
      <div className="p-4 border-b border-white/10">
        <h3 className="text-[10px] tracking-[0.2em] text-[#666] uppercase">Activity Feed</h3>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[480px]" style={{ scrollbarWidth: 'thin' }}>
        {activities.map((activity, i) => {
          const config = levelConfig[activity.level] || levelConfig.info;
          return (
            <div
              key={activity.id + '-' + i}
              data-testid={`activity-item-${i}`}
              className="px-4 py-3 border-b border-white/5 hover:bg-[#1A1A1A] transition-colors"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="mt-0.5 w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: config.bg, color: config.color }}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-[#666]">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                    <span className="text-[10px] text-[#444]">·</span>
                    <span className="text-[10px] text-[#555] truncate">{activity.source}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <div className="p-8 text-center text-[#444] text-sm">No activity yet</div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
