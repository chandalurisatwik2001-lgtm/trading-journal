import React from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
    return (
        <section id="pricing" className="py-32 bg-black relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple Pricing</h2>
                    <p className="text-xl text-gray-400">Start for free. Scale when you're ready.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:border-white/20 transition-colors">
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$0</span>
                                <span className="text-gray-500">/mo</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Basic Analytics', '10 Trades / Month', 'Standard Support'].map((f) => (
                                <li key={f} className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-green-500" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition">
                            Start Free
                        </button>
                    </div>

                    {/* Pro */}
                    <div className="relative p-8 rounded-3xl bg-black border border-purple-500/50 flex flex-col transform md:-translate-y-4 shadow-2xl shadow-purple-900/20">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent rounded-3xl pointer-events-none" />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                            Most Popular
                        </div>
                        <div className="relative z-10 mb-8">
                            <h3 className="text-xl font-semibold text-purple-300 mb-2">Pro Trader</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$29</span>
                                <span className="text-gray-500">/mo</span>
                            </div>
                        </div>
                        <ul className="relative z-10 space-y-4 mb-8 flex-1">
                            {['Unlimited Trades', 'Advanced Analytics', 'Trade Replay', 'Priority Support'].map((f) => (
                                <li key={f} className="flex items-center gap-3 text-white">
                                    <Check className="w-5 h-5 text-purple-400" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button className="relative z-10 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition shadow-lg shadow-purple-600/25">
                            Start Trial
                        </button>
                    </div>

                    {/* Elite */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:border-white/20 transition-colors">
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">Elite</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$49</span>
                                <span className="text-gray-500">/mo</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Everything in Pro', 'AI Insights', 'Mentor View', 'API Access'].map((f) => (
                                <li key={f} className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-green-500" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
