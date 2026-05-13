import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthTabs: React.FC = () => {
    const location = useLocation();
    // Normalize path by removing trailing slash for comparison
    const path = location.pathname.toLowerCase().replace(/\/$/, '');
    const isLogin = path === '/login';
    const isSignup = path === '/signup';

    return (
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
            <Link
                to="/login"
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all duration-300 ${isLogin
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                Log In
            </Link>
            <Link
                to="/signup"
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all duration-300 ${isSignup
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                Sign Up
            </Link>
        </div>
    );
};

export default AuthTabs;
