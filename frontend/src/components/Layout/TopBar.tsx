import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, HelpCircle, Layout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
    onEditLayout?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onEditLayout }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Generate breadcrumb title based on path
    const getTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Dashboard';
        return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <header className="h-16 px-6 flex items-center justify-between bg-gray-900/50 backdrop-blur-sm border-b border-white/5 sticky top-0 z-40">
            {/* Left: Title / Breadcrumbs */}
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white tracking-tight">{getTitle()}</h2>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search trades, symbols..."
                        className="w-64 bg-gray-800/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-gray-800 transition-all"
                    />
                </div>

                <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

                {/* Edit Layout Button (Only on Dashboard) */}
                {location.pathname === '/dashboard' && (
                    <button
                        onClick={onEditLayout}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                    >
                        <Layout size={16} />
                        <span className="hidden sm:inline">Edit Layout</span>
                    </button>
                )}

                {/* Icons */}
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900"></span>
                </button>

                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <HelpCircle size={20} />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
