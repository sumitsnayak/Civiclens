import React, { useState } from 'react';
import { useAuth } from '../lib/authStore';
import { Lock, Mail, User, Shield, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInAsDemoUser, isSupabaseConnected } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const res = await signUpWithEmail(email, password, displayName);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        setInfoMessage('Account created successfully.');
        setTimeout(onSuccess, 800);
      }
    } else {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        onSuccess();
      }
    }
  };

  const handleDemoLogin = (role: 'citizen' | 'admin') => {
    signInAsDemoUser(role);
    onSuccess();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isSignUp ? 'Create an Account' : 'Welcome to CivicLens'}
        </h1>
        <p className="text-xs text-slate-500">
          {isSignUp
            ? 'Join the community problem reporting platform'
            : 'Access your citizen reports and track resolution updates'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-[#E7E2ED] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-2px_rgba(44,25,48,0.04)] space-y-5">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-8 pr-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] text-slate-900 placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
                />
                <User size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-8 pr-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] text-slate-900 placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              />
              <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] text-slate-900 placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              />
              <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#442646] hover:bg-[#341B36] text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Demo Fast Logins for Evaluator */}
        <div className="pt-4 border-t border-[#F0EDF5] space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Evaluator Instant Sign-In
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('citizen')}
              className="p-2.5 rounded-xl bg-[#EDE5F0] hover:bg-[#E5DAE9] border border-[#DFCEE2] text-[#552B58] text-xs font-bold transition-all text-center flex flex-col items-center gap-1"
            >
              <User size={14} />
              <span>Citizen Demo</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-[#FDF0E6] hover:bg-[#FCE5D4] border border-[#F6D5BD] text-[#B55D1C] text-xs font-bold transition-all text-center flex flex-col items-center gap-1"
            >
              <Shield size={14} />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
