import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingUp } from 'lucide-react';

interface LogoutAnimationProps {
    onComplete: () => void;
}

const LogoutAnimation: React.FC<LogoutAnimationProps> = ({ onComplete }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: onComplete
            });

            // 1. Fade in container
            tl.to(containerRef.current, {
                opacity: 1,
                duration: 0.3
            });

            // 2. Animate Text
            tl.from('.logout-text', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });

            // 3. Animate Candlesticks
            tl.from('.candle', {
                scaleY: 0,
                transformOrigin: 'bottom',
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }, '-=0.4');

            // 4. Draw Line Chart
            tl.from('.chart-line', {
                strokeDashoffset: 1000,
                duration: 1.5,
                ease: 'power2.inOut'
            }, '-=1');

            // 5. Fade out everything
            tl.to(containerRef.current, {
                opacity: 0,
                duration: 0.5,
                delay: 0.5
            });

        }, containerRef);

        return () => ctx.revert();
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center opacity-0"
        >
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-black pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Trading Visuals */}
                <div className="w-64 h-32 mb-8 relative flex items-end justify-center gap-2">
                    {/* Abstract Candlesticks */}
                    <div className="candle w-2 h-12 bg-green-500/50 rounded-sm" />
                    <div className="candle w-2 h-8 bg-red-500/50 rounded-sm" />
                    <div className="candle w-2 h-16 bg-green-500/50 rounded-sm" />
                    <div className="candle w-2 h-24 bg-green-500 rounded-sm shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                    <div className="candle w-2 h-14 bg-red-500/50 rounded-sm" />
                    <div className="candle w-2 h-20 bg-green-500/50 rounded-sm" />

                    {/* Overlay Line Chart SVG */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        <path
                            d="M0 100 C 20 80, 40 110, 60 90 S 100 20, 130 10 S 180 60, 256 40"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="chart-line"
                            strokeDasharray="1000"
                        />
                    </svg>
                </div>

                <h1 className="logout-text text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                    See You Soon
                </h1>
                <p className="logout-text text-gray-500 text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Closing Session...
                </p>
            </div>
        </div>
    );
};

export default LogoutAnimation;
