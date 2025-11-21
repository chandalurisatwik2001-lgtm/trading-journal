import React from 'react';
import { BarChart2, Calendar, BookOpen, Zap, Target } from 'lucide-react';

const BentoGrid = () => {
    return (
        <section className="py-32 bg-black relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                        Everything you need to <br /> scale your trading.
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Powerful features designed to help you track, analyze, and improve your trading performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Large Card - Analytics */}
                    <div className="md:col-span-2 row-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                                <BarChart2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">Advanced Analytics</h3>
                            <p className="text-gray-400 text-lg mb-8 max-w-md">
                                Deep dive into your trading performance with over 30+ metrics. Visualize your edge like never before.
                            </p>
                            <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 overflow-hidden">
                                {/* Mock Chart */}
                                <div className="flex items-end justify-between h-full gap-2">
                                    {[40, 70, 50, 90, 60, 80, 50, 75, 65, 95, 85, 100].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-full bg-purple-500 rounded-t-sm opacity-60"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Small Card - Calendar */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                            <Calendar className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Interactive Calendar</h3>
                        <p className="text-gray-400">Visualize your daily P&L and consistency.</p>
                    </div>

                    {/* Small Card - Journal */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                            <BookOpen className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Smart Journaling</h3>
                        <p className="text-gray-400">Tag setups, mistakes, and emotions in seconds.</p>
                    </div>

                    {/* Medium Card - Playbooks */}
                    <div className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors flex items-center justify-between">
                        <div className="max-w-md">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Strategy Playbooks</h3>
                            <p className="text-gray-400">Build and refine your trading strategies. Track what works.</p>
                        </div>
                        <div className="hidden md:block w-48 h-32 bg-black/40 rounded-xl border border-white/5 p-3">
                            <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-white/10 rounded" />
                                <div className="h-2 w-1/2 bg-white/10 rounded" />
                                <div className="h-2 w-full bg-white/10 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Small Card - Fast */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Lightning Fast</h3>
                        <p className="text-gray-400">Built for speed. No lag, just data.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BentoGrid;
