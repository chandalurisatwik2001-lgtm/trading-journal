import React from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';

interface LiveNotificationsProps {
  onRemove?: () => void;
}

const levelIcons: Record<string, React.ReactNode> = {
  info: <Info size={12} className="text-blue-400" />,
  success: <CheckCircle size={12} className="text-green-400" />,
  warning: <AlertTriangle size={12} className="text-yellow-400" />,
  error: <AlertCircle size={12} className="text-red-400" />,
};

const levelColors: Record<string, string> = {
  info: 'border-blue-500/20 bg-blue-500/5',
  success: 'border-green-500/20 bg-green-500/5',
  warning: 'border-yellow-500/20 bg-yellow-500/5',
  error: 'border-red-500/20 bg-red-500/5',
};

const LiveNotifications: React.FC<LiveNotificationsProps> = ({ onRemove }) => {
  const { notifications, status } = useRealtimeData();

  return (
    <div
      data-testid="live-notifications"
      className="relative group bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 h-full flex flex-col"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          data-testid="remove-notifications"
          className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100 z-10"
        >
          <X size={16} />
        </button>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Bell size={14} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white" data-testid="notifications-title">Live Alerts</h3>
        {notifications.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full font-bold">
            {notifications.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <div
              key={notif.id + '-' + i}
              data-testid={`notification-item-${i}`}
              className={`p-2.5 rounded-lg border ${levelColors[notif.level] || levelColors.info} transition-all`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{levelIcons[notif.level] || levelIcons.info}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-gray-600">{notif.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveNotifications;
