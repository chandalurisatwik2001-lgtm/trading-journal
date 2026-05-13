import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, ArrowRight, Activity } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, email, password, name); // Using email as username for now
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="auth-page">
      {/* Left panel - branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1761078739436-ccee01f3d89c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxkYXJrJTIwdGV4dHVyZSUyMGFic3RyYWN0fGVufDB8fHx8MTc3ODY2MTczMHww&ixlib=rb-4.1.0&q=85)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 px-16 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#0033FF] rounded-sm flex items-center justify-center">
              <Activity size={22} className="text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              PULSE
            </h1>
          </div>
          <h2 className="font-heading text-4xl font-black tracking-tight text-white leading-tight mb-4">
            Real-time operations
            <br />
            at a glance.
          </h2>
          <p className="text-[#A0A0A0] text-base leading-relaxed">
            Monitor your infrastructure, track KPIs, and respond to incidents — all from a single command center.
          </p>
          <div className="mt-12 flex gap-6">
            {[
              { label: 'UPTIME', value: '99.97%' },
              { label: 'LATENCY', value: '12ms' },
              { label: 'EVENTS/S', value: '4.2K' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-mono text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-[10px] tracking-[0.2em] text-[#666] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#050505] px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-[#0033FF] rounded-sm flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">PULSE</span>
          </div>

          <h2 className="font-heading text-3xl font-bold tracking-tight mb-2">
            {isLogin ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-[#666] text-sm mb-8">
            {isLogin ? 'Access your operations dashboard' : 'Start monitoring in seconds'}
          </p>

          {error && (
            <div
              data-testid="auth-error"
              className="mb-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-sm text-[#FF3B30] text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  data-testid="register-name-input"
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-[#111111] border border-white/10 rounded-sm px-10 py-3 text-white placeholder-[#666] text-sm focus:outline-none focus:border-[#0033FF] transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
              <input
                data-testid="auth-email-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111111] border border-white/10 rounded-sm px-10 py-3 text-white placeholder-[#666] text-sm focus:outline-none focus:border-[#0033FF] transition-colors"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
              <input
                data-testid="auth-password-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#111111] border border-white/10 rounded-sm px-10 py-3 text-white placeholder-[#666] text-sm focus:outline-none focus:border-[#0033FF] transition-colors"
              />
            </div>
            <button
              data-testid="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0033FF] hover:bg-[#0028CC] text-white font-medium py-3 rounded-sm text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="auth-toggle-button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[#666] text-sm hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-[#0033FF]">{isLogin ? 'Sign up' : 'Sign in'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
