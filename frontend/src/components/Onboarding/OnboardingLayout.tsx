import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
    children: React.ReactNode;
    progress: number;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children, progress }) => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-900/20 blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="w-full p-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-lg">T</span>
                    </div>
                    <span className="font-bold text-lg tracking-wide">TRADEZELLA</span>
                </div>

                {/* Progress Bar */}
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-2xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default OnboardingLayout;
