import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const trigger = triggerRef.current;

        if (!section || !trigger) return;

        const pin = gsap.fromTo(
            section,
            {
                translateX: 0,
            },
            {
                translateX: '-200vw',
                ease: 'none',
                duration: 1,
                scrollTrigger: {
                    trigger: trigger,
                    start: 'top top',
                    end: '2000 top',
                    scrub: 0.6,
                    pin: true,
                },
            }
        );

        return () => {
            pin.kill();
        };
    }, []);

    return (
        <section className="overflow-hidden bg-black">
            <div ref={triggerRef}>
                <div ref={sectionRef} className="h-screen w-[300vw] flex flex-row relative">

                    {/* Panel 1 */}
                    <div className="w-screen h-full flex items-center justify-center px-20 border-r border-white/10">
                        <div className="max-w-4xl grid grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="text-purple-500 font-mono mb-4 block">01 — ANALYSIS</span>
                                <h3 className="text-5xl md:text-7xl font-bold text-white mb-6">Find Your Edge</h3>
                                <p className="text-xl text-gray-400 leading-relaxed">
                                    Stop guessing. Our advanced analytics engine processes your trading data to reveal hidden patterns and profitability leaks.
                                </p>
                            </div>
                            <div className="h-[400px] bg-gradient-to-br from-purple-900/20 to-black border border-white/10 rounded-3xl p-8 relative">
                                <div className="absolute inset-0 bg-grid-white/[0.05]" />
                                {/* Abstract UI Representation */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500 rounded-full blur-[80px]" />
                            </div>
                        </div>
                    </div>

                    {/* Panel 2 */}
                    <div className="w-screen h-full flex items-center justify-center px-20 border-r border-white/10 bg-black">
                        <div className="max-w-4xl grid grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 h-[400px] bg-gradient-to-br from-blue-900/20 to-black border border-white/10 rounded-3xl p-8 relative">
                                <div className="absolute inset-0 bg-grid-white/[0.05]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500 rounded-full blur-[80px]" />
                            </div>
                            <div className="order-1 md:order-2">
                                <span className="text-blue-500 font-mono mb-4 block">02 — JOURNALING</span>
                                <h3 className="text-5xl md:text-7xl font-bold text-white mb-6">Log in Seconds</h3>
                                <p className="text-xl text-gray-400 leading-relaxed">
                                    Frictionless trade entry. Import from your broker or log manually. Tag your setups and mistakes to build a powerful database.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Panel 3 */}
                    <div className="w-screen h-full flex items-center justify-center px-20 bg-black">
                        <div className="max-w-4xl grid grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="text-green-500 font-mono mb-4 block">03 — IMPROVEMENT</span>
                                <h3 className="text-5xl md:text-7xl font-bold text-white mb-6">Scale Up</h3>
                                <p className="text-xl text-gray-400 leading-relaxed">
                                    Use data-driven insights to size up on your best setups and cut out the noise. Watch your P&L grow with your consistency.
                                </p>
                            </div>
                            <div className="h-[400px] bg-gradient-to-br from-green-900/20 to-black border border-white/10 rounded-3xl p-8 relative">
                                <div className="absolute inset-0 bg-grid-white/[0.05]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500 rounded-full blur-[80px]" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Features;
