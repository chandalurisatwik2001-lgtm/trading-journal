import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            gsap.to('.mobile-menu', { x: 0, duration: 0.5, ease: 'power3.out' });
        } else {
            gsap.to('.mobile-menu', { x: '100%', duration: 0.5, ease: 'power3.in' });
        }
    }, [mobileMenuOpen]);

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
                        ? 'bg-black/50 backdrop-blur-xl border-b border-white/10 py-4'
                        : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-2xl">📊</span>
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            TradeZella
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="group px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all font-medium text-sm flex items-center gap-1"
                        >
                            Get Started
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <button
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className="mobile-menu fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 translate-x-full md:hidden">
                {['Features', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="text-2xl font-bold text-white"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {item}
                    </a>
                ))}
                <Link
                    to="/login"
                    className="text-xl text-gray-400"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    Login
                </Link>
                <Link
                    to="/signup"
                    className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold text-xl"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    Get Started
                </Link>
            </div>
        </>
    );
};

export default Navbar;
