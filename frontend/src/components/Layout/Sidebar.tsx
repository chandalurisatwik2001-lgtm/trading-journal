import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    List,
    FileText,
    TrendingUp,
    Calendar,
    BarChart2,
    PlayCircle,
    Library,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn'; // We'll need to create this utility

import LogoutAnimation from '../Auth/LogoutAnimation';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);

    const handleLogout = () => {
        setShowLogoutAnimation(true);
        // The actual logout happens in the onComplete callback of the animation
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'Daily Journal', path: '/dashboard/daily-journal' },
        { icon: List, label: 'Trades', path: '/dashboard/trades' },
        { icon: FileText, label: 'Notebook', path: '/dashboard/notebook' },
        { icon: TrendingUp, label: 'Reports', path: '/dashboard/reports', badge: 'NEW' },
        { icon: Library, label: 'Playbooks', path: '/dashboard/playbooks', badge: 'NEW' },
    ];

    const toolsItems = [
        { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
        { icon: BarChart2, label: 'Progress', path: '/dashboard/progress-tracker' },
        { icon: PlayCircle, label: 'Replay', path: '/dashboard/trade-replay' },
        { icon: Library, label: 'Resources', path: '/dashboard/resource-center' },
    ];

    return (
        <>
            {showLogoutAnimation && (
                <LogoutAnimation onComplete={() => logout()} />
            )}

            <aside
                className={cn(
                    "relative flex flex-col h-screen bg-gray-900/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-50",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-lg">T</span>
                    </div>
                    <div className={cn("ml-3 overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                        <h1 className="text-white font-bold text-lg tracking-wide">TRADEZELLA</h1>
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shadow-lg z-50"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Quick Action */}
                <div className="p-4">
                    <Link
                        to="/dashboard/new-trade"
                        className={cn(
                            "flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] transition-all duration-300 group",
                            collapsed ? "px-0" : "px-4"
                        )}
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        {!collapsed && <span>Add Trade</span>}
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6 custom-scrollbar">
                    {/* Main Nav */}
                    <div className="space-y-1">
                        {!collapsed && <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</div>}
                        {navItems.map((item) => (
                            <NavItem
                                key={item.path}
                                item={item}
                                isActive={location.pathname === item.path}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>

                    {/* Tools Nav */}
                    <div className="space-y-1">
                        {!collapsed && <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</div>}
                        {toolsItems.map((item) => (
                            <NavItem
                                key={item.path}
                                item={item}
                                isActive={location.pathname === item.path}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>
                </div>

                {/* User / Settings */}
                <div className="p-4 border-t border-white/5 space-y-1">
                    <NavItem
                        item={{ icon: Settings, label: 'Settings', path: '/settings/exchanges' }}
                        isActive={location.pathname === '/settings/exchanges'}
                        collapsed={collapsed}
                    />
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group",
                            collapsed && "justify-center"
                        )}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!collapsed && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

const NavItem = ({ item, isActive, collapsed }: { item: any, isActive: boolean, collapsed: boolean }) => (
    <Link
        to={item.path}
        className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
            isActive
                ? "bg-blue-600/10 text-blue-400"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
            collapsed && "justify-center"
        )}
    >
        <item.icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-blue-400" : "group-hover:text-white")} />

        {!collapsed && (
            <div className="flex-1 flex items-center justify-between overflow-hidden">
                <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/20 font-semibold">
                        {item.badge}
                    </span>
                )}
            </div>
        )}

        {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        )}
    </Link>
);

export default Sidebar;
