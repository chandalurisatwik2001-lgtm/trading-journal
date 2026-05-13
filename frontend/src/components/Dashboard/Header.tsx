import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, User } from 'lucide-react';

interface HeaderProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected';
}

const Header: React.FC<HeaderProps> = ({ wsStatus }) => {
  const { user, logout } = useAuth();

  const statusColor = {
    connected: '#00FF66',
    connecting: '#E2F13C',
    disconnected: '#FF3B30',
  }[wsStatus];

  const statusText = {
    connected: 'LIVE',
    connecting: 'CONNECTING',
    disconnected: 'OFFLINE',
  }[wsStatus];

  return (
    <header
      data-testid="dashboard-header"
      className="border-b border-white/10 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0033FF] rounded-sm flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">PULSE</span>
        </div>
        <div className="h-5 w-px bg-white/10" />
        <div className="flex items-center gap-2" data-testid="ws-status-indicator">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse-live"
            style={{ backgroundColor: statusColor }}
          />
          <span
            className="text-[10px] tracking-[0.15em] font-mono font-bold"
            style={{ color: statusColor }}
          >
            {statusText}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
          <User size={14} />
          <span data-testid="user-name">{user && typeof user === 'object' ? user.name || user.email : ''}</span>
        </div>
        <button
          data-testid="logout-button"
          onClick={logout}
          className="flex items-center gap-1.5 text-[#666] hover:text-[#FF3B30] transition-colors text-sm"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
