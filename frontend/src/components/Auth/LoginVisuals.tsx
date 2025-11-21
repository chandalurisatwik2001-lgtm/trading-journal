import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Shield, Lock, Activity, Globe, Server, Wifi } from 'lucide-react';

const LoginVisuals: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Infinite Scroll Animation for the "System Log"
            const contentHeight = scrollRef.current?.scrollHeight || 0;

            if (contentHeight > 0) {
                gsap.to(scrollRef.current, {
                    y: -contentHeight / 2,
                    duration: 40,
                    ease: "none",
                    repeat: -1,
                });
            }

            // Pulse animations for status indicators
            gsap.to('.status-dot', {
                opacity: 0.4,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const systemLogs = [
        { time: '09:30:01', type: 'INFO', msg: 'Market connection established' },
        { time: '09:30:02', type: 'SECURE', msg: 'Encryption key verified: SHA-256' },
        { time: '09:30:05', type: 'DATA', msg: 'Real-time feed: ACTIVE' },
        { time: '09:30:08', type: 'INFO', msg: 'User session token generated' },
        { time: '09:30:12', type: 'CHECK', msg: 'Biometric handshake: PASSED' },
        { time: '09:30:15', type: 'NET', msg: 'Latency: 12ms (OPTIMAL)' },
        { time: '09:30:18', type: 'INFO', msg: 'Portfolio sync initialized' },
        { time: '09:30:22', type: 'SECURE', msg: '2FA Protocol: READY' },
        { time: '09:30:25', type: 'DATA', msg: 'Fetching watchlist data...' },
        { time: '09:30:28', type: 'SUCCESS', msg: 'Watchlist updated (14 items)' },
        { time: '09:30:32', type: 'INFO', msg: 'Analyzing market sentiment...' },
        { time: '09:30:35', type: 'DATA', msg: 'Volume spike detected: SPY' },
        { time: '09:30:38', type: 'WARN', msg: 'High volatility alert: TSLA' },
        { time: '09:30:42', type: 'SECURE', msg: 'Session integrity check: OK' },
    ];

    // Duplicate logs for infinite scroll
    const allLogs = [...systemLogs, ...systemLogs, ...systemLogs];

    return (
        <div ref={containerRef} className="hidden lg:flex w-1/2 bg-[#050505] relative overflow-hidden flex-col justify-between p-12 border-r border-white/5">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none"></div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"></div>

            {/* Top Section: Header */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">SECURE ACCESS</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 status-dot"></span>
                            <span className="text-xs text-green-400 font-mono">SYSTEM ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: System Logs (Infinite Scroll) */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-12 overflow-hidden mask-gradient-y">
                <div className="w-full max-w-md">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <span className="text-xs font-mono text-gray-400">TERMINAL_LOG.txt</span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                        </div>
                        <div className="h-[300px] overflow-hidden relative">
                            <div ref={scrollRef} className="absolute top-0 left-0 w-full px-4 py-2 space-y-2">
                                {allLogs.map((log, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-xs font-mono opacity-80 hover:opacity-100 transition-opacity">
                                        <span className="text-gray-500 shrink-0">[{log.time}]</span>
                                        <span className={`shrink-0 font-bold ${log.type === 'INFO' ? 'text-blue-400' :
                                                log.type === 'SECURE' ? 'text-purple-400' :
                                                    log.type === 'DATA' ? 'text-cyan-400' :
                                                        log.type === 'SUCCESS' ? 'text-green-400' :
                                                            log.type === 'WARN' ? 'text-yellow-400' :
                                                                'text-gray-300'
                                            }`}>{log.type}</span>
                                        <span className="text-gray-300 truncate">{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Status Indicators */}
            <div className="relative z-10 grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-400 font-medium">NETWORK</span>
                    </div>
                    <div className="text-lg font-bold text-white">GLOBAL</div>
                    <div className="text-[10px] text-blue-400/80 mt-1">Connected to 12 nodes</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Server className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400 font-medium">LATENCY</span>
                    </div>
                    <div className="text-lg font-bold text-white">12ms</div>
                    <div className="text-[10px] text-purple-400/80 mt-1">Optimized Route</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400 font-medium">ENCRYPTION</span>
                    </div>
                    <div className="text-lg font-bold text-white">AES-256</div>
                    <div className="text-[10px] text-green-400/80 mt-1">End-to-End Secure</div>
                </div>
            </div>
        </div>
    );
};

export default LoginVisuals;
