import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import LoginVisuals from './LoginVisuals';
import AuthTabs from './AuthTabs';
import AnimatedLockIcon from './AnimatedLockIcon';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);
  const lockIconRef = useRef<SVGSVGElement>(null);
  const lockContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Login | TradeZella';
  }, []);

  useEffect(() => {
    // Check if already logged in
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    // Entry Animation
    const ctx = gsap.context(() => {
      gsap.from('.form-item', {
        y: 20,
        opacity: 100,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2,
      });
    }, formRef);

    return () => ctx.revert();
  }, []);

  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayLockRef = useRef<SVGSVGElement>(null);

  const playUnlockAnimation = () => {
    if (!lockContainerRef.current) return;

    // 1. Measure the current lock position
    const rect = lockContainerRef.current.getBoundingClientRect();

    // 2. Set overlay to match exactly
    setOverlayStyle({
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 50,
      borderRadius: '1rem', // matching rounded-2xl
    });

    setShowUnlockAnimation(true);

    // Allow a brief moment for the overlay to render before animating
    requestAnimationFrame(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          navigate('/dashboard');
        }
      });

      if (overlayRef.current && overlayLockRef.current) {
        // Hide the original lock immediately so we don't have duplicates
        gsap.set(lockContainerRef.current, { opacity: 0 });

        // 1. Scale up and pulse the container
        tl.to(overlayRef.current, {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(1.7)',
        });

        // 2. Unlock animation - lift the shackle (target the overlay's lock)
        tl.to('.overlay-lock-shackle', {
          y: -12,
          rotation: -15,
          transformOrigin: 'left center',
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.1');

        // 3. Change color to success green
        tl.to(overlayRef.current, {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          duration: 0.3,
        }, '-=0.3');

        // 4. Bounce the lock body
        tl.to('.overlay-lock-body', {
          y: 3,
          duration: 0.15,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        }, '-=0.2');

        // 5. Create particle burst effect
        tl.to(overlayRef.current, {
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.4)',
          duration: 0.4,
        }, '-=0.2');

        // 6. Fade out the form elements
        tl.to(formRef.current?.querySelectorAll('.form-item') || [], {
          opacity: 0,
          y: 20,
          scale: 0.95,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.in',
        }, '-=0.2');

        // 7. WARP SPEED: Scale up the lock container to fill the screen
        // Calculate scale needed to cover screen
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const maxDim = Math.max(viewportHeight, viewportWidth);
        const scale = (maxDim / rect.width) * 2.5; // * 2.5 to be safe

        tl.to(overlayRef.current, {
          scale: scale,
          duration: 0.8,
          ease: 'power4.in',
        });

        // 8. Fade out the lock icon itself as we zoom in
        tl.to(overlayLockRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        }, '<');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      playUnlockAnimation();
    } catch (err: any) {
      const errorMessage = err?.detail || err?.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
      setLoading(false);

      gsap.to(formRef.current, {
        keyframes: {
          x: [-5, 5, -5, 5, 0]
        },
        duration: 0.4,
        ease: 'power2.inOut'
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}/auth/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Google authentication failed');
      }

      const data = await response.json();

      // Store token and user data
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Trigger unlock animation
      setShowUnlockAnimation(true);
      playUnlockAnimation();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  return (
    <div className="h-screen overflow-hidden bg-black flex">
      {/* Transition Overlay */}
      {overlayStyle && (
        <div
          ref={overlayRef}
          style={overlayStyle}
          className="fixed flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/20 pointer-events-none"
        >
          {/* We clone the lock icon here for the animation */}
          <svg
            ref={overlayLockRef}
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white w-12 h-12"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="shackleGradientOverlay" x1="16" y1="8" x2="48" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="40%" stopColor="#94A3B8" />
                <stop offset="60%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              <linearGradient id="bodyGradientOverlay" x1="32" y1="24" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="bodyBevelOverlay" x1="32" y1="24" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="10%" stopColor="white" stopOpacity="0.1" />
                <stop offset="90%" stopColor="black" stopOpacity="0.1" />
                <stop offset="100%" stopColor="black" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            <g className="overlay-lock-shackle">
              <path
                d="M19 26V18C19 10.8203 24.8203 5 32 5C39.1797 5 45 10.8203 45 18V26"
                stroke="black"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.2"
                transform="translate(0, 2)"
              />
              <path
                d="M19 26V18C19 10.8203 24.8203 5 32 5C39.1797 5 45 10.8203 45 18V26"
                stroke="url(#shackleGradientOverlay)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </g>

            <g className="overlay-lock-body">
              <rect
                x="14"
                y="24"
                width="36"
                height="32"
                rx="6"
                fill="url(#bodyGradientOverlay)"
              />
              <rect
                x="14"
                y="24"
                width="36"
                height="32"
                rx="6"
                fill="url(#bodyBevelOverlay)"
                style={{ mixBlendMode: 'overlay' }}
              />
              <circle cx="32" cy="38" r="4" fill="#1E293B" opacity="0.6" />
              <rect x="30" y="38" width="4" height="8" rx="1" fill="#1E293B" opacity="0.6" />
              <circle cx="32" cy="38" r="3" fill="white" opacity="0.9" />
              <rect x="30.5" y="38" width="3" height="7" rx="1" fill="white" opacity="0.9" />
            </g>
          </svg>
        </div>
      )}

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

            {/* Header with Animated Lock */}
            <div className="text-center mb-6 form-item">
              <div
                ref={lockContainerRef}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg shadow-blue-500/20 transition-all duration-300"
              >
                <AnimatedLockIcon ref={lockIconRef} className="text-white w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Access your trading terminal</p>
            </div>

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
                  disabled={showUnlockAnimation}
                />
              </div>

              <div className="form-item space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all pr-10"
                    placeholder="••••••••"
                    required
                    disabled={showUnlockAnimation}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={showUnlockAnimation}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="form-item flex items-center gap-3 pt-1">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:border-blue-500 checked:bg-blue-500 transition-all"
                    disabled={showUnlockAnimation}
                  />
                  <ArrowRight className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity rotate-[-45deg]" />
                </div>
                <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer select-none">
                  Keep me logged in
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || showUnlockAnimation}
                className="form-item w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    {showUnlockAnimation ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Accessing Terminal...
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Access Terminal
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="form-item flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Google Sign In */}
              <div className="form-item flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="384"
                />
              </div>

              <p className="form-item text-center text-gray-400 text-sm mt-6">
                New to TradeZella?{' '}
                <Link to="/signup" className="text-white font-semibold hover:text-blue-400 transition-colors">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with GoogleOAuthProvider
const LoginWithGoogle = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  if (!googleClientId) {
    console.warn('REACT_APP_GOOGLE_CLIENT_ID not set - Google OAuth will not work');
    return <Login />;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Login />
    </GoogleOAuthProvider>
  );
};

export default LoginWithGoogle;
