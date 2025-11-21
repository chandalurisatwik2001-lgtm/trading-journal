import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingUp, Shield, Zap, Target, Award, Users } from 'lucide-react';

const SignupVisuals = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        // Clone children for infinite scroll
        const content = scrollContainer.innerHTML;
        scrollContainer.innerHTML = content + content;

        const totalHeight = scrollContainer.scrollHeight / 2;

        gsap.to(scrollContainer, {
            y: -totalHeight,
            duration: 30, // Slower duration for a more subtle effect
            ease: 'none',
            repeat: -1,
        });
    }, []);

    const notifications = [
        { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20', title: 'New High Score', desc: 'You just beat your monthly profit record!' },
        { icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/20', title: 'Setup Identified', desc: 'A+ Setup detected on TSLA (Long)' },
        { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/20', title: 'Risk Managed', desc: 'Stop loss prevented a -2% drawdown' },
        { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20', title: 'Execution Speed', desc: 'Trade executed in 12ms' },
        { icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/20', title: 'Consistency Badge', desc: '10 Green Days in a row!' },
        { icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/20', title: 'Community Insight', desc: 'Top traders are longing NVDA today' },
    ];

    return (
        <div className="hidden lg:flex flex-col w-1/2 bg-[#050505] relative overflow-hidden border-r border-white/10">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[120px]" />

            <div className="relative z-10 p-12 flex flex-col h-full">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-2xl">📊</span>
                        </div>
                        <span className="text-2xl font-bold text-white">TradeZella</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Join the top 1% of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Profitable Traders
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md">
                        Get access to the same tools used by 7-figure traders to track, analyze, and scale their performance.
                    </p>
                </div>

                {/* Infinite Scroll Feed */}
                <div className="flex-1 relative overflow-hidden mask-gradient-y">
                    {/* Removed manual gradient overlay to use CSS mask instead for a natural fade */}

                    <div ref={scrollRef} className="space-y-6 py-4">
                        {notifications.map((item, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4 transform transition-transform hover:scale-[1.02] hover:bg-white/10 cursor-default shadow-lg shadow-black/20">
                                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                    <div>
                        <div className="text-2xl font-bold text-white">50K+</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Traders</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">10M+</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Trades</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">4.9/5</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Rating</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupVisuals;
