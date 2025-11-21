import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const dashboard = dashboardRef.current;

        if (!container || !dashboard) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { left, top, width, height } = container.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;

            gsap.to(dashboard, {
                rotationY: x * 10, // Tilt X
                rotationX: -y * 10, // Tilt Y
                transformPerspective: 1000,
                ease: 'power2.out',
                duration: 0.5,
            });
        };

        const handleMouseLeave = () => {
            gsap.to(dashboard, {
                rotationY: 0,
                rotationX: 0,
                ease: 'power2.out',
                duration: 0.5,
            });
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <section ref={containerRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex flex-col justify-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 text-center z-10">
                <div className="hero-text-element inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 hover:bg-white/10 transition cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-300">V3.0 Now Live</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                </div>

                <h1 className="hero-text-element text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                    The Operating System <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
                        For Profitable Traders
                    </span>
                </h1>

                <p className="hero-text-element text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Stop gambling. Start trading. TradeZella gives you the analytics, journaling, and replay tools you need to find your edge.
                </p>

                <div className="hero-text-element flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                    <Link
                        to="/signup"
                        className="group w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full transition-all hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2"
                    >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <button className="group w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all font-semibold text-lg backdrop-blur-sm flex items-center justify-center gap-2">
                        <Play className="w-5 h-5 fill-current" />
                        Watch Demo
                    </button>
                </div>

                {/* 3D Dashboard Preview */}
                <div className="perspective-1000">
                    <div
                        ref={dashboardRef}
                        className="relative mx-auto max-w-6xl bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform-style-3d"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Glass Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none z-20" />

                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="mx-auto px-3 py-1 rounded-md bg-black/50 text-xs text-gray-500 font-mono border border-white/5">
                                tradezella.com/dashboard
                            </div>
                        </div>

                        <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6 text-left">
                            {/* Sidebar Mock */}
                            <div className="hidden md:block col-span-2 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-8 w-full bg-white/5 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>

                            {/* Main Content Mock */}
                            <div className="col-span-12 md:col-span-10 space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                                        <div className="text-sm text-gray-400 mb-2">Total Profit</div>
                                        <div className="text-3xl font-bold text-green-400">+$12,450.00</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                                        <div className="text-sm text-gray-400 mb-2">Win Rate</div>
                                        <div className="text-3xl font-bold text-white">68%</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                                        <div className="text-sm text-gray-400 mb-2">Profit Factor</div>
                                        <div className="text-3xl font-bold text-purple-400">2.41</div>
                                    </div>
                                </div>

                                {/* Chart Area */}
                                <div className="h-80 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-6 flex items-end justify-between gap-2 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
                                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95, 60, 80, 70, 90, 100, 85].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-full bg-purple-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                            style={{ height: `${h}%`, opacity: 0.5 + (i / 40) }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
