import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import SignupVisuals from './SignupVisuals';
import AuthTabs from './AuthTabs';
import { API_BASE_URL } from '../../config/api';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Real-time validation states
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Sign Up | TradeZella';
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

  // Debounced email validation
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        setEmailAvailable(data.available);
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [email]);

  // Debounced username validation
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [username]);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    // Calculate strength score (0-4)
    const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length;

    return {
      isValid: score === 4,
      score,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    if (emailAvailable === false) {
      setError('Email is already registered');
      return;
    }

    if (usernameAvailable === false) {
      setError('Username is already taken');
      return;
    }

    setLoading(true);

    try {
      await signup(email, username, password, fullName);
      navigate('/onboarding');
    } catch (err: any) {
      // Backend returns error as { detail: "Error message" }
      const errorMessage = err?.detail || err?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <div className="h-screen overflow-hidden bg-black flex">
      <SignupVisuals />

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 relative overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-6">
          {/* Mobile Background */}
          <div className="lg:hidden absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
          <div className="lg:hidden absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px]" />

          <div ref={formRef} className="max-w-md w-full relative z-10">
            <div className="lg:hidden text-center mb-8 form-item">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-500/20">
                <span className="text-2xl">📊</span>
              </div>
              <h1 className="text-3xl font-bold text-white">TradeZella</h1>
            </div>

            <AuthTabs />

            <div className="mb-6 form-item">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Start your 14-day free trial. No credit card required.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="form-item p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="form-item space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="form-item space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all pr-10 ${usernameAvailable === false ? 'border-red-500/50' : usernameAvailable === true ? 'border-green-500/50' : 'border-white/10'
                      }`}
                    placeholder="trader123"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : usernameAvailable === true ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {usernameAvailable === false && (
                  <p className="text-xs text-red-400 mt-1 ml-1">Username already taken</p>
                )}
              </div>

              <div className="form-item space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all pr-10 ${emailAvailable === false ? 'border-red-500/50' : emailAvailable === true ? 'border-green-500/50' : 'border-white/10'
                      }`}
                    placeholder="john@example.com"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingEmail ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : emailAvailable === true ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : emailAvailable === false ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {emailAvailable === false && (
                  <p className="text-xs text-red-400 mt-1 ml-1">Email already registered</p>
                )}
              </div>

              <div className="form-item space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Volume Bar Strength Meter */}
                {password && (
                  <div className="flex gap-1 mt-2 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all duration-300 ${step <= passwordValidation.score
                          ? passwordValidation.score === 4
                            ? 'bg-green-500'
                            : passwordValidation.score >= 2
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          : 'bg-white/10'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-item space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="form-item flex items-start gap-3 pt-2">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:border-purple-500 checked:bg-purple-500 transition-all"
                  />
                  <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer select-none">
                  I agree to the <Link to="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link> and <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || emailAvailable === false || usernameAvailable === false}
                className="form-item w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="form-item text-center text-gray-400 text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-semibold hover:text-purple-400 transition-colors">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
