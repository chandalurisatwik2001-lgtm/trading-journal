import React from 'react';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-white/10 bg-black">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        <span className="font-bold text-xl text-white">TradeZella</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition">Privacy</a>
                        <a href="#" className="hover:text-white transition">Terms</a>
                        <a href="#" className="hover:text-white transition">Twitter</a>
                        <a href="#" className="hover:text-white transition">Discord</a>
                    </div>
                    <div className="text-sm text-gray-500">
                        © 2025 TradeZella. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
