import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import gsap from 'gsap';
import LoginVisuals from './LoginVisuals';
import AuthTabs from './AuthTabs';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.title = 'Forgot Password | TradeZella';
    }, []);

    useEffect(() => {
        // Entry Animation
        const ctx = gsap.context(() => {
            gsap.from('.form-item', {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.2,
            });
        }, formRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
            const response = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send reset email');
            }

            setSuccess(true);

            // Success animation
            gsap.to('.success-message', {
                scale: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut',
            });
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to send reset email. Please try again.';
            setError(errorMessage);

            gsap.to(formRef.current, {
                keyframes: {
                    x: [-5, 5, -5, 5, 0]
                },
                duration: 0.4,
                ease: 'power2.inOut'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-black flex">
            {/* Left Side - Visuals */}
            <LoginVisuals />

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 relative overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-6">
                    {/* Mobile Background Effects */}
                    <div className="lg:hidden absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                    <div className="lg:hidden absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px]" />

                    <div ref={formRef} className="max-w-md w-full relative z-10">
                        <AuthTabs />

                        {/* Header with Icon */}
                        <div className="text-center mb-6 form-item">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg shadow-blue-500/20">
                                <Mail className="text-white w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                            <p className="text-gray-400">No worries, we'll send you reset instructions</p>
                        </div>

                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="form-item p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="form-item space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="trader@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="form-item w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <div className="form-item text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                        Back to login
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="success-message space-y-5">
                                <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                                    <p className="text-gray-400 text-sm">
                                        If an account exists for <span className="text-white font-medium">{email}</span>,
                                        you will receive a password reset link shortly.
                                    </p>
                                    <p className="text-gray-500 text-xs mt-3">
                                        Check your spam folder if you don't see it in a few minutes.
                                    </p>
                                </div>

                                <Link
                                    to="/login"
                                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                    Back to login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
