import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import gsap from 'gsap';
import LoginVisuals from './LoginVisuals';
import AuthTabs from './AuthTabs';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const token = searchParams.get('token');

    useEffect(() => {
        document.title = 'Reset Password | TradeZella';
    }, []);

    useEffect(() => {
        // Verify token on mount
        const verifyToken = async () => {
            if (!token) {
                setError('Invalid reset link. Please request a new password reset.');
                setVerifying(false);
                return;
            }

            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
                const response = await fetch(`${apiUrl}/auth/verify-reset-token?token=${token}`, {
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error('Invalid or expired reset token');
                }

                setTokenValid(true);
            } catch (err: any) {
                setError(err?.message || 'Invalid or expired reset link. Please request a new password reset.');
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    useEffect(() => {
        if (!verifying) {
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
        }
    }, [verifying]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            gsap.to(formRef.current, {
                keyframes: {
                    x: [-5, 5, -5, 5, 0]
                },
                duration: 0.4,
                ease: 'power2.inOut'
            });
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    new_password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to reset password');
            }

            setSuccess(true);

            // Success animation and redirect
            gsap.to('.success-message', {
                scale: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut',
                onComplete: () => {
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                },
            });
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to reset password. Please try again.';
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
                                <Lock className="text-white w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                            <p className="text-gray-400">Enter your new password below</p>
                        </div>

                        {verifying ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                                <p className="text-gray-400">Verifying reset link...</p>
                            </div>
                        ) : !tokenValid ? (
                            <div className="space-y-5">
                                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h3>
                                    <p className="text-gray-400 text-sm">{error}</p>
                                </div>

                                <Link
                                    to="/forgot-password"
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    Request New Reset Link
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <Link
                                    to="/login"
                                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                    Back to login
                                </Link>
                            </div>
                        ) : success ? (
                            <div className="success-message space-y-5">
                                <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Password Reset Successful!</h3>
                                    <p className="text-gray-400 text-sm">
                                        Your password has been reset successfully.
                                    </p>
                                    <p className="text-gray-500 text-xs mt-3">
                                        Redirecting to login...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="form-item p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="form-item space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all pr-10"
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            disabled={loading}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-item space-y-1.5">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all pr-10"
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            disabled={loading}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="form-item w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Resetting Password...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
